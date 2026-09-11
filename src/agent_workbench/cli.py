"""CLI entry: python -m agent_workbench  /  agent-workbench"""

from __future__ import annotations

import argparse
import json
import sys

from agent_workbench.agent import ReActAgent
from agent_workbench.multi_agent import MultiAgentOrchestrator
from agent_workbench.trace import TraceLogger


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Agent Workbench — ReAct agent CLI")
    p.add_argument("question", nargs="?", help="User question (or pass via --question)")
    p.add_argument("-q", "--question", dest="question_opt", help="User question")
    p.add_argument("--mock", action="store_true", help="Use MockLLM (no API key)")
    p.add_argument("--multi", action="store_true", help="Planner → Worker → Critic mode")
    p.add_argument("--max-steps", type=int, default=8)
    p.add_argument("--json", action="store_true", help="Print machine-readable JSON result")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    question = args.question_opt or args.question
    if not question:
        print("Enter a question (empty line to cancel):")
        question = sys.stdin.readline().strip()
    if not question:
        print("No question provided.", file=sys.stderr)
        return 2

    tracer = TraceLogger()
    if args.multi:
        orch = MultiAgentOrchestrator(mock=True if args.mock else None)
        result = orch.run(question)
        if args.json:
            print(
                json.dumps(
                    {
                        "mode": "multi",
                        "plan": result.plan,
                        "critique": result.critique,
                        "answer": result.final_answer,
                        "worker_steps": result.worker.steps,
                        "run_id": result.worker.run_id,
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
        else:
            print("=== PLAN ===")
            print(result.plan)
            print("\n=== WORKER STEPS ===")
            for s in result.worker.steps:
                print(json.dumps(s, ensure_ascii=False))
            print("\n=== CRITIQUE ===")
            print(result.critique)
            print("\n=== FINAL ===")
            print(result.final_answer)
        return 0

    agent = ReActAgent(mock=True if args.mock else None, tracer=tracer, max_steps=args.max_steps)
    result = agent.run(question)
    if args.json:
        print(
            json.dumps(
                {
                    "mode": "single",
                    "answer": result.answer,
                    "steps": result.steps,
                    "run_id": result.run_id,
                    "trace_path": result.trace_path,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        for s in result.steps:
            print(json.dumps(s, ensure_ascii=False))
        print("\n=== FINAL ANSWER ===")
        print(result.answer)
        print(f"\n(trace: {result.trace_path})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
