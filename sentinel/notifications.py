"""Fixed-recipient delivery adapters; dry-run first, with atomic attempt claims."""
import re

import httpx

from sentinel.config import placeholder
from sentinel.models import SEVERITIES


def readiness(settings, channel):
    if channel == 'telegram':
        return not placeholder(settings.telegram_token) and bool(settings.telegram_chat)
    return (settings.twilio_custom_sms and
            all(not placeholder(v) for v in [settings.twilio_sid, settings.twilio_key,
                settings.twilio_secret, settings.twilio_from, settings.twilio_to]))


async def deliver(store, settings, alert, channel, transport=None):
    if alert['status'] == 'resolved':
        raise ValueError('Resolved alerts do not send notifications')
    if SEVERITIES[alert['severity']] < SEVERITIES['high']:
        raise ValueError('External notifications require high or critical severity')
    live = settings.live_notifications
    if live and (not readiness(settings, channel) or alert['provenance'].startswith('demo')):
        raise ValueError('Live delivery requires configured channel and a real agent assessment')
    attempt, claimed = store.claim_delivery(alert, channel, live)
    if not claimed:
        return attempt
    if not live:
        store.event(alert['scan_id'], 'NOTIFICATION_PREVIEW',
                    f'{channel} preview for alert #{alert["id"]}; nothing sent')
        return attempt
    # Never send model-written descriptions, arguments, or payloads to external channels.
    text = f'MCP Sentinel: {alert["severity"].upper()} alert #{alert["id"]}. Review the local dashboard.'
    try:
        async with httpx.AsyncClient(timeout=12, transport=transport, follow_redirects=False) as client:
            if channel == 'telegram':
                if not re.fullmatch(r'\d+:[A-Za-z0-9_-]+', settings.telegram_token):
                    raise ValueError('Invalid Telegram token format')
                response = await client.post(
                    f'https://api.telegram.org/bot{settings.telegram_token}/sendMessage',
                    json={'chat_id': settings.telegram_chat, 'text': text,
                          'allow_paid_broadcast': False})
            else:
                if not re.fullmatch(r'AC[0-9a-fA-F]{32}', settings.twilio_sid):
                    raise ValueError('Invalid Twilio account identifier')
                response = await client.post(
                    f'https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_sid}/Messages.json',
                    auth=(settings.twilio_key, settings.twilio_secret),
                    data={'To': settings.twilio_to, 'From': settings.twilio_from, 'Body': text})
            if response.status_code >= 400:
                # No response body or exception URL: both may contain secrets.
                state = 'failed' if response.status_code < 500 else 'unknown'
                store.finish_delivery(attempt['id'], state, f'Provider HTTP {response.status_code}; no auto retry')
            else:
                value = response.json()
                if channel == 'telegram' and not value.get('ok'):
                    store.finish_delivery(attempt['id'], 'failed', 'Provider rejected the message')
                else:
                    provider_id = (value.get('result', {}).get('message_id') if channel == 'telegram'
                                   else value.get('sid'))
                    if not provider_id:
                        raise ValueError('Missing provider receipt')
                    store.finish_delivery(attempt['id'], 'accepted',
                        'Provider accepted; handset delivery not confirmed', str(provider_id))
    except (httpx.HTTPError, ValueError):
        store.finish_delivery(attempt['id'], 'unknown',
                              'Delivery outcome uncertain; check provider before any retry')
    result = next(d for d in store.deliveries() if d['id'] == attempt['id'])
    store.event(alert['scan_id'], 'NOTIFICATION_' + result['status'].upper(),
                f'{channel}: {result["detail"]}')
    return result
