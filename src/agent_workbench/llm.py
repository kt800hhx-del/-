"""OpenAI-compatible LLM client + deterministic MockLLM for offline demos."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Any, Protocol

import httpx


@dataclass
class ChatMessage:
    role: str
    content: str


class LLMClient(Protocol):
    def chat(self, messages: list[ChatMessage], *, stop: list[str] | None = None) -> str: ...


class OpenAICompatibleLLM:
    """Minimal chat client for any OpenAI-compatible `/chat/completions` API."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
        timeout: float = 60.0,
    ) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.base_url = (base_url or os.getenv("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
        self.model = model or os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
        self.timeout = timeout
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is required unless mock mode is enabled")

    def chat(self, messages: list[ChatMessage], *, stop: list[str] | None = None) -> str:
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": 0.2,
        }
        if stop:
            payload["stop"] = stop
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
        return data["choices"][0]["message"]["content"]


class MockLLM:
    """Rule-based LLM so demos/tests run with zero API cost or network.

    It inspects the latest user question + available tool list embedded in the
    system prompt, then emits a short ReAct-style Thought/Action/Action Input
    transcript that the agent loop can parse.
    """

    def __init__(self) -> None:
        self._step = 0
        self._last_question = ""
        self._pending: list[str] = []

    def chat(self, messages: list[ChatMessage], *, stop: list[str] | None = None) -> str:
        user_msgs = [m.content for m in messages if m.role == "user"]
        assistant_so_far = "\n".join(m.content for m in messages if m.role == "assistant")
        full = "\n".join(m.content for m in messages)
        question = user_msgs[-1] if user_msgs else ""
        # Strip ReAct scratchpad continuation markers
        if "Observation:" in question and self._last_question:
            question = self._last_question
        else:
            # keep first non-scratchpad user line as the question
            for line in question.splitlines():
                if line.strip() and not line.startswith("Observation:"):
                    if "Question:" in line:
                        question = line.split("Question:", 1)[-1].strip()
                    else:
                        question = line.strip()
                    break
            self._last_question = question
            self._step = 0
            self._pending = self._plan(question, full)

        if self._step < len(self._pending):
            out = self._pending[self._step]
            self._step += 1
            return out
        return "Thought: I have enough information.\nFinal Answer: Done."

    def _plan(self, question: str, prompt_ctx: str) -> list[str]:
        q = question.lower()
        steps: list[str] = []

        # Calculator — capture a full arithmetic phrase, not just the first binary op
        calc = re.search(r"(\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)+)", question)
        if calc or "calculate" in q or "计算" in question or "算" in question:
            expr = calc.group(1) if calc else "12 * 7 + 3"
            steps.append(
                "Thought: I should use the calculator tool.\n"
                f"Action: calculator\n"
                f"Action Input: {{\"expression\": \"{expr}\"}}"
            )
            steps.append(
                "Thought: I have the numeric result.\n"
                f"Final Answer: The result of {expr} is available from the calculator observation above."
            )
            return steps

        # Datetime
        if any(k in q for k in ("time", "date", "今天", "日期", "时间", "now")):
            steps.append(
                "Thought: I need the current time.\n"
                "Action: datetime_now\n"
                "Action Input: {}"
            )
            steps.append(
                "Thought: Got the timestamp.\n"
                "Final Answer: See the datetime_now observation for the current UTC/local time."
            )
            return steps

        # Sandbox file
        if any(k in q for k in ("read", "file", "welcome", "faq", "sandbox", "读取", "文件")):
            path = "welcome.txt"
            if "faq" in q:
                path = "faq.md"
            elif "company" in q:
                path = "company.json"
            steps.append(
                "Thought: I should read a sandbox file.\n"
                "Action: sandbox_file_read\n"
                f"Action Input: {{\"path\": \"{path}\"}}"
            )
            steps.append(
                "Thought: File contents retrieved.\n"
                "Final Answer: Summarized from sandbox file — see observation above for raw text."
            )
            return steps

        # JSON query
        if "json" in q or "headcount" in q or "metrics" in q or "json_query" in q:
            steps.append(
                "Thought: First read the JSON file, then query it.\n"
                "Action: sandbox_file_read\n"
                "Action Input: {\"path\": \"company.json\"}"
            )
            steps.append(
                "Thought: Now extract the metric with json_query.\n"
                "Action: json_query\n"
                "Action Input: {\"data\": {\"metrics\": {\"tool_success_rate\": 0.97}}, \"path\": \"metrics.tool_success_rate\"}"
            )
            steps.append(
                "Thought: Extracted the value.\n"
                "Final Answer: Acme Robotics tool_success_rate is 0.97 (from company.json)."
            )
            return steps

        # Memory note
        if "remember" in q or "note" in q or "记住" in question or "笔记" in question:
            steps.append(
                "Thought: Store a note in long-term memory.\n"
                "Action: memory_note\n"
                "Action Input: {\"op\": \"write\", \"key\": \"demo\", \"value\": \"interview portfolio note\"}"
            )
            steps.append(
                "Thought: Note saved.\n"
                "Final Answer: Saved memory note under key 'demo'."
            )
            return steps

        # HTTP fetch (mock still "calls" the tool; tool itself may be mocked offline)
        if "http" in q or "fetch" in q or "url" in q or "网页" in question:
            steps.append(
                "Thought: Fetch a URL.\n"
                "Action: http_fetch\n"
                "Action Input: {\"url\": \"https://example.com\", \"max_chars\": 500}"
            )
            steps.append(
                "Thought: Got the response body snippet.\n"
                "Final Answer: Fetched example.com — see observation for truncated body."
            )
            return steps

        # Default: datetime then answer
        steps.append(
            "Thought: I'll check the time as a simple demo action.\n"
            "Action: datetime_now\n"
            "Action Input: {}"
        )
        steps.append(
            f"Thought: Ready to answer.\n"
            f"Final Answer: (mock) You asked: {question}. Enable a real LLM via OPENAI_API_KEY for richer reasoning."
        )
        return steps


def build_llm(*, mock: bool | None = None) -> LLMClient:
    """Factory: mock wins when AGENT_WB_MOCK=1 or mock=True."""
    if mock is None:
        mock = os.getenv("AGENT_WB_MOCK", "0").strip() in {"1", "true", "True", "yes"}
    if mock:
        return MockLLM()
    return OpenAICompatibleLLM()
