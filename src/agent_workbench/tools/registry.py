"""Tool registry — explicit schemas for the ReAct loop."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable

from agent_workbench.tools.calculator import calculator
from agent_workbench.tools.datetime_now import datetime_now
from agent_workbench.tools.http_fetch import http_fetch
from agent_workbench.tools.json_query import json_query
from agent_workbench.tools.memory_note import make_memory_note_tool
from agent_workbench.tools.sandbox_file import sandbox_file_read
from agent_workbench.tools.web_search import web_search


@dataclass
class Tool:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: Callable[..., str]

    def run(self, **kwargs: Any) -> str:
        return self.handler(**kwargs)

    def schema_text(self) -> str:
        params = json.dumps(self.parameters, ensure_ascii=False)
        return f"- {self.name}: {self.description}\n  parameters: {params}"


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool | None:
        return self._tools.get(name)

    def names(self) -> list[str]:
        return sorted(self._tools)

    def catalog_text(self) -> str:
        return "\n".join(t.schema_text() for t in self._tools.values())

    def run(self, name: str, arguments: dict[str, Any]) -> str:
        tool = self.get(name)
        if tool is None:
            return f"ERROR: unknown tool '{name}'. Available: {', '.join(self.names())}"
        try:
            return tool.run(**arguments)
        except TypeError as exc:
            return f"ERROR: bad arguments for {name}: {exc}"
        except Exception as exc:  # noqa: BLE001 — surface to agent
            return f"ERROR: {name} failed: {exc}"


def build_default_registry(long_term_memory=None) -> ToolRegistry:
    reg = ToolRegistry()
    reg.register(
        Tool(
            name="calculator",
            description="Evaluate a basic arithmetic expression (+ - * / // % ** and parentheses).",
            parameters={
                "type": "object",
                "properties": {"expression": {"type": "string"}},
                "required": ["expression"],
            },
            handler=calculator,
        )
    )
    reg.register(
        Tool(
            name="http_fetch",
            description="HTTP GET a URL and return truncated text/HTML body.",
            parameters={
                "type": "object",
                "properties": {
                    "url": {"type": "string"},
                    "max_chars": {"type": "integer", "default": 2000},
                },
                "required": ["url"],
            },
            handler=http_fetch,
        )
    )
    reg.register(
        Tool(
            name="web_search",
            description="Best-effort web search (DuckDuckGo). Returns JSON results or graceful error.",
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "default": 5},
                },
                "required": ["query"],
            },
            handler=web_search,
        )
    )
    reg.register(
        Tool(
            name="sandbox_file_read",
            description="Read a text file under the sandbox_data directory (path traversal blocked).",
            parameters={
                "type": "object",
                "properties": {"path": {"type": "string", "description": "Relative path inside sandbox"}},
                "required": ["path"],
            },
            handler=sandbox_file_read,
        )
    )
    reg.register(
        Tool(
            name="datetime_now",
            description="Return current UTC and local timestamps.",
            parameters={"type": "object", "properties": {}},
            handler=datetime_now,
        )
    )
    reg.register(
        Tool(
            name="json_query",
            description="Walk a JSON object with a dotted path (e.g. metrics.tool_success_rate) or list index.",
            parameters={
                "type": "object",
                "properties": {
                    "data": {"description": "JSON object/array or JSON string"},
                    "path": {"type": "string"},
                },
                "required": ["data", "path"],
            },
            handler=json_query,
        )
    )
    memory_handler = make_memory_note_tool(long_term_memory)
    reg.register(
        Tool(
            name="memory_note",
            description="Write/read/list long-term notes in SQLite memory.",
            parameters={
                "type": "object",
                "properties": {
                    "op": {"type": "string", "enum": ["write", "read", "list", "search"]},
                    "key": {"type": "string"},
                    "value": {"type": "string"},
                    "query": {"type": "string"},
                },
                "required": ["op"],
            },
            handler=memory_handler,
        )
    )
    return reg
