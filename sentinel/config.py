"""Server-side credentials; never returned to the dashboard."""
import os
import shutil
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def placeholder(value: str) -> bool:
    return not value or value.lower().startswith(("dummy", "replace", "your-"))


@dataclass
class Settings:
    database: str = "sentinel/sentinel.db"
    node: str = "node"
    gemini_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    telegram_token: str = ""
    telegram_chat: str = ""
    twilio_sid: str = ""
    twilio_key: str = ""
    twilio_secret: str = ""
    twilio_from: str = ""
    twilio_to: str = ""
    live_notifications: bool = False
    twilio_custom_sms: bool = False

    @classmethod
    def from_env(cls):
        return cls(
            database=os.getenv("SQLITE_PATH", str(ROOT / "sentinel/sentinel.db")),
            node=os.getenv("WASMER_NODE", shutil.which("node") or "node"),
            gemini_key=os.getenv("GEMINI_API_KEY", ""),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            telegram_token=os.getenv("TELEGRAM_BOT_TOKEN", ""),
            telegram_chat=os.getenv("TELEGRAM_CHAT_ID", ""),
            twilio_sid=os.getenv("TWILIO_ACCOUNT_SID", ""),
            twilio_key=os.getenv("TWILIO_API_KEY_SID", ""),
            twilio_secret=os.getenv("TWILIO_API_KEY_SECRET", ""),
            twilio_from=os.getenv("TWILIO_FROM_NUMBER", ""),
            twilio_to=os.getenv("TWILIO_TO_NUMBER", ""),
            live_notifications=os.getenv("LIVE_NOTIFICATIONS") == "1",
            twilio_custom_sms=os.getenv("TWILIO_CUSTOM_SMS_ENABLED") == "1",
        )
