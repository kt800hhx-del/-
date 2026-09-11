"""Simple multi-agent pipeline: Planner → Worker → Critic."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from agent_workbench.agent import AgentResult, ReActAgent
from agent_workbench.llm import ChatMessage, LLMClient, MockLLM, build_llm
from agent_workbench.trace import TraceLogger


@dataclass
class MultiAgentResult:
    plan: str
    worker: AgentResult
    critique: str
    final_answer: str


class PlannerCriticLLM(MockLLM):
    """Mock planner/critic when offline."""

    def __init__(self, mode: str) -> None:
        super().__init__()
        self.mode = mode

    def chat(self, messages: list[ChatMessage], *, stop: list[str] | None = None) -> str:
        user = next((m.content for m in reversed(messages) if m.role == "user"), "")
        if self.mode == "planner":
            return (
                "Plan:\n"
                "1) Identify which tools are needed\n"
                "2) Call tools to gather facts\n"
                "3) Produce a concise Final Answer\n"
                f"User goal: {user}"
            )
        # critic
        return (
            "Critique: Check that tool observations support the answer; "
            "flag hallucinations; prefer citing tool results.\n"
            f"Context length={len(user)}"
        )


class MultiAgentOrchestrator:
    """Planner drafts steps → Worker (ReAct) executes → Critic reviews."""

    def __init__(self, mock: bool | None = None, worker: ReActAgent | None = None) -> None:
        self.mock = mock
        self.llm: LLMClient = build_llm(mock=mock)
        self.worker = worker or ReActAgent(mock=mock, tracer=TraceLogger())
        self.tracer = TraceLogger()

    def run(self, question: str) -> MultiAgentResult:
        self.tracer.log("multi_start", question=question)

        planner_llm: LLMClient = PlannerCriticLLM("planner") if isinstance(self.llm, MockLLM) or self.mock else self.llm
        plan = planner_llm.chat(
            [
                ChatMessage(role="system", content="You are the Planner. Output a short numbered plan."),
                ChatMessage(role="user", content=question),
            ]
        )
        self.tracer.log("plan", text=plan)

        worker_question = f"{question}\n\nFollow this plan:\n{plan}"
        worker_result = self.worker.run(worker_question)
        self.tracer.log("worker_done", answer=worker_result.answer, run_id=worker_result.run_id)

        critic_llm: LLMClient = PlannerCriticLLM("critic") if isinstance(self.llm, MockLLM) or self.mock else self.llm
        critique = critic_llm.chat(
            [
                ChatMessage(
                    role="system",
                    content="You are the Critic. Review plan + answer; suggest a polished Final Answer.",
                ),
                ChatMessage(
                    role="user",
                    content=f"Question: {question}\nPlan:\n{plan}\nAnswer:\n{worker_result.answer}",
                ),
            ]
        )
        self.tracer.log("critique", text=critique)

        # In mock mode, keep worker answer; with real LLM, critic may rewrite — keep simple:
        final = worker_result.answer
        if "Final Answer:" in critique:
            final = critique.split("Final Answer:", 1)[1].strip()
        self.tracer.final_answer(final)
        return MultiAgentResult(plan=plan, worker=worker_result, critique=critique, final_answer=final)
