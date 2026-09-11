"""JSONL trace / observability for interview demos."""

from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class TraceEvent:
    run_id: str
    event: str
    timestamp: float
    data: dict[str, Any] = field(default_factory=dict)


class TraceLogger:
    """Append-only JSONL traces: thoughts, tool calls, results, final answer."""

    def __init__(self, trace_dir: str | None = None, run_id: str | None = None) -> None:
        directory = Path(trace_dir or os.getenv("AGENT_WB_TRACE_DIR") or "./traces")
        directory.mkdir(parents=True, exist_ok=True)
        self.run_id = run_id or uuid.uuid4().hex[:12]
        self.path = directory / f"run_{self.run_id}.jsonl"
        self.events: list[TraceEvent] = []

    def log(self, event: str, **data: Any) -> TraceEvent:
        ev = TraceEvent(run_id=self.run_id, event=event, timestamp=time.time(), data=data)
        self.events.append(ev)
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(ev), ensure_ascii=False) + "\n")
        return ev

    def thought(self, text: str) -> None:
        self.log("thought", text=text)

    def tool_call(self, name: str, arguments: dict[str, Any]) -> None:
        self.log("tool_call", name=name, arguments=arguments)

    def tool_result(self, name: str, result: str) -> None:
        self.log("tool_result", name=name, result=result)

    def final_answer(self, text: str) -> None:
        self.log("final_answer", text=text)

    def as_list(self) -> list[dict[str, Any]]:
        return [asdict(e) for e in self.events]
