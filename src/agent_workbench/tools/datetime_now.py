"""Current time tool."""

from __future__ import annotations

from datetime import datetime, timezone


def datetime_now() -> str:
    utc = datetime.now(timezone.utc).isoformat()
    local = datetime.now().astimezone().isoformat()
    return f"utc={utc}\nlocal={local}"
