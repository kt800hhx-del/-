"""Best-effort web search tool (DuckDuckGo HTML/lite). Graceful failure."""

from __future__ import annotations

import json


def web_search(query: str, max_results: int = 5) -> str:
    """Search the web; return JSON list of {title,url,snippet} or an error string."""
    try:
        from agent_workbench.travel.research import duckduckgo_search

        results = duckduckgo_search(query, max_results=int(max_results))
        if not results:
            return json.dumps(
                {"ok": False, "error": "no results (network blocked or parse miss)", "results": []},
                ensure_ascii=False,
            )
        payload = {
            "ok": True,
            "results": [{"title": r.title, "url": r.url, "snippet": r.snippet} for r in results],
        }
        return json.dumps(payload, ensure_ascii=False)
    except Exception as exc:  # noqa: BLE001 — tool must not crash agent
        return json.dumps({"ok": False, "error": f"{type(exc).__name__}: {exc}", "results": []}, ensure_ascii=False)
