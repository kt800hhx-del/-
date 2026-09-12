"""Web research helpers for travel planning.

Best-effort: DuckDuckGo HTML/lite search, Wikipedia REST, Wikivoyage.
Graceful failure — never crash the pipeline if the network is down.
"""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import quote, unquote

import httpx

from agent_workbench.travel.schema import SourceRef

USER_AGENT = "AgentWorkbenchTravel/0.1 (+https://github.com/local; research bot)"
TIMEOUT = 15.0


def _strip_html(text: str) -> str:
    text = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", text)
    text = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fetch_url(url: str, max_chars: int = 4000) -> tuple[str, str | None]:
    """Return (text_snippet, error). error is None on success."""
    try:
        with httpx.Client(follow_redirects=True, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}) as client:
            resp = client.get(url)
            resp.raise_for_status()
            body = resp.text
        return _strip_html(body)[:max_chars], None
    except Exception as exc:  # noqa: BLE001
        return "", f"{type(exc).__name__}: {exc}"


def duckduckgo_search(query: str, max_results: int = 5) -> list[SourceRef]:
    """Best-effort DuckDuckGo HTML search. Returns empty list on failure."""
    url = f"https://html.duckduckgo.com/html/?q={quote(query)}"
    try:
        with httpx.Client(follow_redirects=True, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}) as client:
            resp = client.get(url)
            resp.raise_for_status()
            html = resp.text
    except Exception:
        # lite fallback
        try:
            lite = f"https://lite.duckduckgo.com/lite/?q={quote(query)}"
            with httpx.Client(follow_redirects=True, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}) as client:
                resp = client.get(lite)
                resp.raise_for_status()
                html = resp.text
        except Exception:
            return []

    results: list[SourceRef] = []
    # html.duckduckgo.com result links
    for m in re.finditer(
        r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
        html,
        re.I | re.S,
    ):
        href, title = m.group(1), _strip_html(m.group(2))
        # DDG wraps redirects: uddg=
        if "uddg=" in href:
            uddg = re.search(r"uddg=([^&]+)", href)
            if uddg:
                href = unquote(uddg.group(1))
        snippet = ""
        results.append(SourceRef(title=title[:200], url=href, snippet=snippet))
        if len(results) >= max_results:
            break

    if not results:
        # lite.duckduckgo.com: links in <a rel="nofollow"...
        for m in re.finditer(r'<a[^>]+href="(https?://[^"]+)"[^>]*>(.*?)</a>', html, re.I | re.S):
            href, title = m.group(1), _strip_html(m.group(2))
            if "duckduckgo.com" in href:
                continue
            results.append(SourceRef(title=title[:200] or href, url=href, snippet=""))
            if len(results) >= max_results:
                break

    # Attach nearby snippets if present
    for r in results:
        if not r.snippet:
            r.snippet = r.title
    return results


def wikipedia_summary(title: str, lang: str = "zh") -> SourceRef | None:
    """Wikipedia REST summary. lang: zh / en / ja …"""
    api = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{quote(title)}"
    try:
        with httpx.Client(follow_redirects=True, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}) as client:
            resp = client.get(api)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            data: dict[str, Any] = resp.json()
        extract = (data.get("extract") or "")[:800]
        page_url = (data.get("content_urls") or {}).get("desktop", {}).get("page") or data.get("url") or api
        return SourceRef(title=data.get("title") or title, url=page_url, snippet=extract)
    except Exception:
        return None


def wikivoyage_summary(title: str, lang: str = "en") -> SourceRef | None:
    """Wikivoyage REST summary (travel guide). Prefer en; zh may be sparse."""
    api = f"https://{lang}.wikivoyage.org/api/rest_v1/page/summary/{quote(title)}"
    try:
        with httpx.Client(follow_redirects=True, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}) as client:
            resp = client.get(api)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            data: dict[str, Any] = resp.json()
        extract = (data.get("extract") or "")[:800]
        page_url = (data.get("content_urls") or {}).get("desktop", {}).get("page") or api
        return SourceRef(title=f"Wikivoyage: {data.get('title') or title}", url=page_url, snippet=extract)
    except Exception:
        return None


def research_destination(destination: str, *, preferences: list[str] | None = None, use_web: bool = True) -> list[SourceRef]:
    """Gather snippets + URLs for a destination. Empty on total failure."""
    prefs = preferences or []
    sources: list[SourceRef] = []
    if not use_web:
        return sources

    # Wikipedia (zh then en)
    for lang, title in (("zh", destination), ("en", destination)):
        ref = wikipedia_summary(title, lang=lang)
        if ref and ref.snippet:
            sources.append(ref)
            break

    # Wikivoyage
    for lang in ("en", "zh"):
        ref = wikivoyage_summary(destination, lang=lang)
        if ref and ref.snippet:
            sources.append(ref)
            break

    # DuckDuckGo topical queries
    queries = [
        f"{destination} 旅游 攻略 景点",
        f"{destination} travel guide attractions",
    ]
    if prefs:
        queries.append(f"{destination} {' '.join(prefs[:3])}")
    for q in queries[:2]:
        sources.extend(duckduckgo_search(q, max_results=3))

    # Deduplicate by URL
    seen: set[str] = set()
    unique: list[SourceRef] = []
    for s in sources:
        key = s.url or s.title
        if key in seen:
            continue
        seen.add(key)
        unique.append(s)
    return unique


def sources_as_context(sources: list[SourceRef], max_chars: int = 6000) -> str:
    """Format sources for LLM prompts."""
    parts: list[str] = []
    used = 0
    for i, s in enumerate(sources, 1):
        block = f"[{i}] {s.title}\nURL: {s.url}\n{s.snippet}\n"
        if used + len(block) > max_chars:
            break
        parts.append(block)
        used += len(block)
    return "\n".join(parts) if parts else "（无可用网络资料，请基于常识给出估算方案，并标注不确定性。）"
