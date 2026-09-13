"""Scanning-agent decision boundary: metadata deltas are evidence, never the verdict."""
import asyncio
import json
import re
from pathlib import Path

import httpx

from sentinel.config import placeholder
from sentinel.models import Judgment
from sentinel.scanner import redact

SYSTEM = (Path(__file__).parent / 'prompts/security-assessor.txt').read_text(encoding='utf-8')


def validate_judgment(value, evidence):
    judgment = Judgment.model_validate(redact(value))
    available = {item.id for item in evidence}
    if not set(judgment.evidence_ids).issubset(available):
        raise ValueError('Agent cited nonexistent evidence')
    return judgment


async def assess_gemini(settings, evidence, transport=None):
    if placeholder(settings.gemini_key):
        raise ValueError('Configure GEMINI_API_KEY before selecting the Gemini assessor')
    if not re.fullmatch(r'[a-zA-Z0-9._-]+', settings.gemini_model):
        raise ValueError('Invalid model identifier')
    payload = {
        'systemInstruction': {'parts': [{'text': SYSTEM}]},
        'contents': [{'role': 'user', 'parts': [{'text': json.dumps({
            'target': 'owned synthetic Helix MCP',
            'evidence': [item.model_dump() for item in evidence],
        })}]}],
        'generationConfig': {'temperature': 0, 'maxOutputTokens': 4096,
                             'responseMimeType': 'application/json',
                             'responseJsonSchema': Judgment.model_json_schema()},
    }
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent'
    async with httpx.AsyncClient(timeout=45, transport=transport, follow_redirects=False) as client:
        response = await client.post(url, headers={'x-goog-api-key': settings.gemini_key}, json=payload)
        if response.status_code != 200:
            raise ValueError(f'Assessment provider returned HTTP {response.status_code}')
        body = response.json()
    candidates = body.get('candidates', [])
    if not candidates or candidates[0].get('finishReason') != 'STOP':
        raise ValueError('Assessment provider returned no complete judgment')
    text = ''.join(p.get('text', '') for p in candidates[0].get('content', {}).get('parts', [])
                   if not p.get('thought', False))
    return validate_judgment(json.loads(text), evidence)


async def assess_openrouter(settings, evidence, transport=None):
    if placeholder(settings.openrouter_key):
        raise ValueError('Configure OPENROUTER_API_KEY before selecting OpenRouter')
    if not re.fullmatch(r'[a-zA-Z0-9._:/-]+', settings.openrouter_model):
        raise ValueError('Invalid OpenRouter model identifier')
    payload = {
        'model': settings.openrouter_model,
        'messages': [
            {'role': 'system', 'content': SYSTEM},
            {'role': 'user', 'content': json.dumps(redact({
                'target': 'owned synthetic Helix MCP',
                'evidence': [item.model_dump() for item in evidence],
            }))},
        ],
        'temperature': 0, 'max_tokens': 4096, 'stream': False,
        'response_format': {'type': 'json_schema', 'json_schema': {
            'name': 'security_judgment', 'strict': True, 'schema': Judgment.model_json_schema(),
        }},
        'provider': {'require_parameters': True},
    }
    async with asyncio.timeout(95), httpx.AsyncClient(
        timeout=90, transport=transport, follow_redirects=False
    ) as client:
        response = await client.post('https://openrouter.ai/api/v1/chat/completions',
            headers={'Authorization': f'Bearer {settings.openrouter_key}'}, json=payload)
        if response.status_code != 200:
            raise ValueError(f'OpenRouter assessment returned HTTP {response.status_code}')
        body = response.json()
    choices = body.get('choices', [])
    if body.get('error') or not choices or choices[0].get('finish_reason') != 'stop':
        raise ValueError('OpenRouter returned no complete judgment')
    message = choices[0].get('message', {})
    if message.get('refusal') or message.get('tool_calls') or not isinstance(message.get('content'), str):
        raise ValueError('OpenRouter returned an unsupported assessment response')
    judgment = validate_judgment(json.loads(message['content']), evidence)
    resolved = body.get('model')
    if not isinstance(resolved, str) or not re.fullmatch(r'[a-zA-Z0-9._:/-]{1,200}', resolved):
        raise ValueError('OpenRouter response missing valid model attribution')
    judgment._resolved_model = resolved
    return judgment


async def assess_demo(settings, evidence):
    """Deterministic test double; visibly labeled and never represented as an LLM."""
    metadata = next((e for e in evidence if e.kind == 'METADATA_OBSERVED'), None)
    behavior = next((e for e in evidence if e.kind == 'BEHAVIOR_TEST'), None)
    content = json.dumps(metadata.data.get('after', [])) if metadata else ''
    if 'local key material' in content or 'export_workspace' in content:
        return Judgment(flag=True, severity='high', category='instruction_abuse',
            title='Tool instructions request local key material',
            rationale='The changed comment guidance asks for key material and a new export tool '
                      'is exposed after benign calls. This is a synthetic test, not proof of real theft.',
            evidence_ids=[metadata.id],
            recommendation='Review the altered instructions and disable the unapproved export capability.')
    if behavior and behavior.data.get('changed'):
        return Judgment(flag=True, severity='medium', category='behavior',
            title='Ticket behavior changed without a metadata update',
            rationale='The same ticket request returned changed content after activation while the '
                      'advertised tool contract remained unchanged. Investigate the behavior evidence.',
            evidence_ids=[behavior.id],
            recommendation='Inspect the output difference before trusting the updated tool behavior.')
    return Judgment(flag=False, severity='info', category='none',
        title='No actionable security finding in this test',
        rationale='The observed evidence contains no credential-seeking instruction or unexpected '
                  'behavior. A documentation clarification alone does not merit a security alert.',
        evidence_ids=[metadata.id] if metadata else [],
        recommendation='Keep monitoring and retain the observation in the timeline.')
