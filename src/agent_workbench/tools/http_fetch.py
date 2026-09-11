"""Simple HTTP GET tool."""

from __future__ import annotations

import os

import httpx


def http_fetch(url: str, max_chars: int = 2000) -> str:
    if os.getenv("AGENT_WB_MOCK", "0").strip() in {"1", "true", "True", "yes"} and "example.com" in url:
        # Offline-friendly stub for mock demos
        body = "<html><title>Example Domain</title><body>Example Domain mock body</body></html>"
        return body[:max_chars]

    with httpx.Client(follow_redirects=True, timeout=20.0) as client:
        resp = client.get(url)
        resp.raise_for_status()
        text = resp.text
    return text[: int(max_chars)]
