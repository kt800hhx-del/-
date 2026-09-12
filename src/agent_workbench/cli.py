"""CLI entry: python -m agent_workbench  /  agent-workbench

Subcommands:
  (default)  ReAct chat agent
  travel     Travel Planning Agent
"""

from __future__ import annotations

import argparse
import json
import sys


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Agent Workbench — ReAct + Travel Planning")
    sub = p.add_subparsers(dest="command")

    # --- travel ---
    t = sub.add_parser("travel", help="Travel Planning Agent（旅行规划）")
    t.add_argument("--dest", "--destination", dest="dest", required=True, help="目的地")
    t.add_argument("--days", type=int, default=3, help="行程天数")
    t.add_argument("--budget", type=float, default=None, help="总预算（CNY）")
    t.add_argument("--travelers", type=int, default=2, help="出行人数")
    t.add_argument("--origin", default="", help="出发地")
    t.add_argument("--prefs", default="", help="偏好，逗号分隔，如 美食,人文")
    t.add_argument(
        "--pace",
        default="balanced",
        choices=["relaxed", "balanced", "packed"],
        help="行程节奏",
    )
    t.add_argument("--mock", action="store_true", help="离线示例/Mock 管道")
    t.add_argument("--json", action="store_true", help="输出 TripPlan JSON")
    t.add_argument("--no-web", action="store_true", help="禁用网页检索")

    # --- default react (also accept legacy positional) ---
    p.add_argument("question", nargs="?", help="User question (legacy / default mode)")
    p.add_argument("-q", "--question", dest="question_opt", help="User question")
    p.add_argument("--mock", action="store_true", help="Use MockLLM (no API key)")
    p.add_argument("--multi", action="store_true", help="Planner → Worker → Critic mode")
    p.add_argument("--max-steps", type=int, default=8)
    p.add_argument("--json", action="store_true", help="Print machine-readable JSON result")
    return p


def _run_travel(args: argparse.Namespace) -> int:
    from agent_workbench.trace import TraceLogger
    from agent_workbench.travel.pipeline import TravelPipeline
    from agent_workbench.travel.schema import TripRequest

    prefs = [x.strip() for x in (args.prefs or "").split(",") if x.strip()]
    req = TripRequest(
        destination=args.dest,
        days=args.days,
        budget_cny=args.budget,
        travelers=args.travelers,
        origin=args.origin or "",
        preferences=prefs,
        pace=args.pace,
    )
    tracer = TraceLogger()
    pipe = TravelPipeline(mock=True if args.mock else None, tracer=tracer, use_web=not args.no_web)
    result = pipe.run(req)
    if args.json:
        print(
            json.dumps(
                {
                    "run_id": result.run_id,
                    "trace_path": result.trace_path,
                    "stages": [{"stage": s.stage, "message": s.message} for s in result.stages],
                    "plan": result.plan.model_dump(),
                    "markdown": result.markdown,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        print("=== STAGES ===")
        for s in result.stages:
            print(f"[{s.stage}] {s.message}")
        print("\n=== ITINERARY (Markdown) ===\n")
        print(result.markdown)
        print(f"\n(trace: {result.trace_path})")
    return 0


def _run_react(args: argparse.Namespace) -> int:
    from agent_workbench.agent import ReActAgent
    from agent_workbench.multi_agent import MultiAgentOrchestrator
    from agent_workbench.trace import TraceLogger

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


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    # If first token is travel, use travel subcommand path via parse_known / dedicated parse
    if argv and argv[0] == "travel":
        # Build a travel-only parser to avoid conflict with top-level --mock/--json
        tp = argparse.ArgumentParser(prog="agent_workbench travel", description="Travel Planning Agent")
        tp.add_argument("--dest", "--destination", dest="dest", required=True, help="目的地")
        tp.add_argument("--days", type=int, default=3)
        tp.add_argument("--budget", type=float, default=None)
        tp.add_argument("--travelers", type=int, default=2)
        tp.add_argument("--origin", default="")
        tp.add_argument("--prefs", default="")
        tp.add_argument("--pace", default="balanced", choices=["relaxed", "balanced", "packed"])
        tp.add_argument("--mock", action="store_true")
        tp.add_argument("--json", action="store_true")
        tp.add_argument("--no-web", action="store_true")
        targs = tp.parse_args(argv[1:])
        return _run_travel(targs)

    args = build_parser().parse_args(argv)
    if args.command == "travel":
        return _run_travel(args)
    return _run_react(args)


if __name__ == "__main__":
    raise SystemExit(main())
