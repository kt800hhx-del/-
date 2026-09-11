"""Dotted-path JSON walker (JSONPath-lite)."""

from __future__ import annotations

import json
from typing import Any


def json_query(data: Any, path: str) -> str:
    if isinstance(data, str):
        data = json.loads(data)
    cur: Any = data
    for part in path.split("."):
        if part == "":
            continue
        if isinstance(cur, list):
            cur = cur[int(part)]
        elif isinstance(cur, dict):
            if part not in cur:
                return json.dumps({"error": f"missing key '{part}'", "path": path}, ensure_ascii=False)
            cur = cur[part]
        else:
            return json.dumps({"error": f"cannot index {type(cur).__name__} with '{part}'"}, ensure_ascii=False)
    return json.dumps(cur, ensure_ascii=False, indent=2)
