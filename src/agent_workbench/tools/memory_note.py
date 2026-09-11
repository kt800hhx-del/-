"""memory_note tool factory bound to LongTermMemory."""

from __future__ import annotations

import json
from typing import Any, Callable


def make_memory_note_tool(memory) -> Callable[..., str]:
    def memory_note(
        op: str,
        key: str | None = None,
        value: str | None = None,
        query: str | None = None,
    ) -> str:
        if memory is None:
            return "ERROR: long-term memory not configured"
        op = op.lower().strip()
        if op == "write":
            if not key or value is None:
                return "ERROR: write requires key and value"
            memory.write(key, value)
            return f"OK: wrote note '{key}'"
        if op == "read":
            if not key:
                return "ERROR: read requires key"
            val = memory.read(key)
            return "null" if val is None else val
        if op == "list":
            return json.dumps(memory.list_keys(), ensure_ascii=False)
        if op == "search":
            if not query:
                return "ERROR: search requires query"
            return json.dumps(memory.search(query), ensure_ascii=False, indent=2)
        return f"ERROR: unknown op '{op}'"

    return memory_note
