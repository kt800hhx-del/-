"""Explicit ReAct agent loop — readable for a 30-minute interview walkthrough."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any

from agent_workbench.llm import ChatMessage, LLMClient, build_llm
from agent_workbench.memory import LongTermMemory, ShortTermMemory
from agent_workbench.tools.registry import ToolRegistry, build_default_registry
from agent_workbench.trace import TraceLogger

ACTION_RE = re.compile(r"^Action:\s*(.+)$", re.MULTILINE)
ACTION_INPUT_RE = re.compile(r"^Action Input:\s*(.+)$", re.MULTILINE | re.DOTALL)
FINAL_RE = re.compile(r"^Final Answer:\s*(.+)$", re.MULTILINE | re.DOTALL)
THOUGHT_RE = re.compile(r"^Thought:\s*(.+)$", re.MULTILINE)


SYSTEM_TEMPLATE = """You are Agent Workbench, a careful ReAct-style assistant.
Use this exact format:

Thought: reason about what to do next
Action: tool_name
Action Input: {{JSON object}}

After you receive an Observation, continue with Thought/Action or finish with:
Thought: ...
Final Answer: ...

Available tools:
{tool_catalog}

Rules:
- Action Input MUST be valid JSON.
- Prefer tools over guessing facts (time, files, math, HTTP).
- Keep thoughts short and explicit.
"""


@dataclass
class AgentResult:
    answer: str
    steps: list[dict[str, Any]] = field(default_factory=list)
    run_id: str = ""
    trace_path: str = ""


class ReActAgent:
    def __init__(
        self,
        llm: LLMClient | None = None,
        tools: ToolRegistry | None = None,
        short_memory: ShortTermMemory | None = None,
        long_memory: LongTermMemory | None = None,
        tracer: TraceLogger | None = None,
        max_steps: int = 8,
        mock: bool | None = None,
    ) -> None:
        self.long_memory = long_memory or LongTermMemory()
        self.short_memory = short_memory or ShortTermMemory()
        self.tools = tools or build_default_registry(self.long_memory)
        self.llm = llm or build_llm(mock=mock)
        self.tracer = tracer or TraceLogger()
        self.max_steps = max_steps

    def run(self, question: str) -> AgentResult:
        self.tracer.log("run_start", question=question)
        self.short_memory.add("user", question)

        system = SYSTEM_TEMPLATE.format(tool_catalog=self.tools.catalog_text())
        scratch = f"Question: {question}"
        messages = [
            ChatMessage(role="system", content=system),
            ChatMessage(role="user", content=scratch),
        ]
        steps: list[dict[str, Any]] = []

        for step_i in range(1, self.max_steps + 1):
            raw = self.llm.chat(messages, stop=["Observation:"])
            messages.append(ChatMessage(role="assistant", content=raw))
            thought_m = THOUGHT_RE.search(raw)
            thought = thought_m.group(1).strip() if thought_m else ""
            if thought:
                self.tracer.thought(thought)

            final_m = FINAL_RE.search(raw)
            if final_m and not ACTION_RE.search(raw.split("Final Answer:")[0] if "Final Answer:" in raw else raw):
                # Prefer Final Answer when present without a new action after it
                pass
            if final_m and "Action:" not in raw.split("Final Answer:")[0]:
                answer = final_m.group(1).strip()
                # If Action appears before Final Answer in same blob, handle tools first
            if "Final Answer:" in raw and not re.search(r"Action:\s*\w+", raw.split("Final Answer:")[0]):
                answer = raw.split("Final Answer:", 1)[1].strip()
                self.tracer.final_answer(answer)
                self.short_memory.add("assistant", answer)
                steps.append({"step": step_i, "type": "final", "thought": thought, "answer": answer})
                return AgentResult(answer=answer, steps=steps, run_id=self.tracer.run_id, trace_path=str(self.tracer.path))

            action_m = ACTION_RE.search(raw)
            if not action_m:
                # No tool — treat whole output as answer
                answer = final_m.group(1).strip() if final_m else raw.strip()
                self.tracer.final_answer(answer)
                self.short_memory.add("assistant", answer)
                steps.append({"step": step_i, "type": "final", "thought": thought, "answer": answer})
                return AgentResult(answer=answer, steps=steps, run_id=self.tracer.run_id, trace_path=str(self.tracer.path))

            tool_name = action_m.group(1).strip()
            input_m = ACTION_INPUT_RE.search(raw)
            raw_input = input_m.group(1).strip() if input_m else "{}"
            # Trim trailing Thought/Final if model glued them
            for stop_tok in ("\nThought:", "\nFinal Answer:", "\nObservation:"):
                if stop_tok in raw_input:
                    raw_input = raw_input.split(stop_tok, 1)[0].strip()
            try:
                arguments = json.loads(raw_input) if raw_input else {}
                if not isinstance(arguments, dict):
                    arguments = {"value": arguments}
            except json.JSONDecodeError:
                arguments = {"expression": raw_input} if tool_name == "calculator" else {"_raw": raw_input}

            self.tracer.tool_call(tool_name, arguments)
            observation = self.tools.run(tool_name, arguments)
            self.tracer.tool_result(tool_name, observation)
            steps.append(
                {
                    "step": step_i,
                    "type": "tool",
                    "thought": thought,
                    "tool": tool_name,
                    "arguments": arguments,
                    "observation": observation,
                }
            )
            messages.append(ChatMessage(role="user", content=f"Observation: {observation}"))

        answer = "Max steps reached without Final Answer. Partial trace is available."
        self.tracer.final_answer(answer)
        self.short_memory.add("assistant", answer)
        return AgentResult(answer=answer, steps=steps, run_id=self.tracer.run_id, trace_path=str(self.tracer.path))
