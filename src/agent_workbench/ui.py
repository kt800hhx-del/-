"""Streamlit UI — 旅行规划（旗舰）+ 聊天工具演示."""

from __future__ import annotations

import json

import streamlit as st

from agent_workbench.agent import ReActAgent
from agent_workbench.multi_agent import MultiAgentOrchestrator
from agent_workbench.trace import TraceLogger
from agent_workbench.travel.pipeline import TravelPipeline
from agent_workbench.travel.schema import TripRequest

DEMO_PROMPTS = [
    "你是谁",
    "计算 12 * 7 + 3",
    "现在几点？",
    "读一下 sandbox 里的 faq.md 并总结",
    "From company.json, what is metrics.tool_success_rate?",
    "记住笔记 key=interview value=Agent Workbench demo",
]


def _travel_tab() -> None:
    st.subheader("🧳 旅行规划")
    st.caption("多智能体管道：受理 → 调研 → 行程 → 后勤 → 预算 → 审稿（一轮修订）· 中文旅行社风格输出")

    with st.form("travel_form"):
        c1, c2, c3 = st.columns(3)
        with c1:
            dest = st.text_input("目的地", value="成都")
            days = st.number_input("天数", min_value=1, max_value=30, value=3)
            travelers = st.number_input("人数", min_value=1, max_value=20, value=2)
        with c2:
            budget = st.number_input("预算（CNY，总）", min_value=0, value=4000, step=500)
            origin = st.text_input("出发地", value="上海")
            pace = st.selectbox("节奏", options=["relaxed", "balanced", "packed"], index=1,
                                format_func=lambda x: {"relaxed": "宽松", "balanced": "适中", "packed": "紧凑"}[x])
        with c3:
            prefs_raw = st.text_input("偏好（逗号分隔）", value="美食,人文")
            mock = st.toggle("Mock / 示例数据（离线）", value=True)
            use_web = st.toggle("启用网页检索（真实模式）", value=False)
        submitted = st.form_submit_button("生成行程", type="primary", use_container_width=True)

    if submitted:
        prefs = [p.strip() for p in prefs_raw.split(",") if p.strip()]
        req = TripRequest(
            destination=dest.strip() or "成都",
            days=int(days),
            budget_cny=float(budget) if budget else None,
            travelers=int(travelers),
            origin=origin.strip(),
            preferences=prefs,
            pace=pace,  # type: ignore[arg-type]
        )
        with st.spinner("管道运行中…"):
            tracer = TraceLogger()
            pipe = TravelPipeline(mock=mock, tracer=tracer, use_web=use_web and not mock)
            result = pipe.run(req)
        st.session_state["travel_result"] = result

    result = st.session_state.get("travel_result")
    if not result:
        st.info("填写表单后点击「生成行程」。Mock 下内置 成都3日 / 东京5日 / 云南大理丽江 精选示例。")
        return

    st.markdown("### 管道阶段")
    for s in result.stages:
        st.write(f"**{s.stage}** — {s.message}")

    st.markdown("### 行程方案")
    st.markdown(result.markdown)

    st.download_button(
        label="下载 Markdown (.md)",
        data=result.markdown.encode("utf-8"),
        file_name=f"trip_{result.plan.request.destination}_{result.plan.request.days}d.md",
        mime="text/markdown",
    )
    with st.expander("TripPlan JSON"):
        st.json(result.plan.model_dump())
    st.caption(f"run_id={result.run_id} · trace={result.trace_path}")


def _chat_tab() -> None:
    st.subheader("💬 工具聊天（ReAct）")
    with st.sidebar:
        st.header("Chat Settings")
        mock = st.toggle("Mock LLM (offline)", value=True, key="chat_mock")
        multi = st.toggle("Multi-agent (Planner→Worker→Critic)", value=False, key="chat_multi")
        st.markdown("### Demo prompts")
        for i, prompt in enumerate(DEMO_PROMPTS):
            if st.button(prompt, key=f"demo_{i}"):
                st.session_state["prefill"] = prompt

    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "last_steps" not in st.session_state:
        st.session_state.last_steps = []
    if "last_meta" not in st.session_state:
        st.session_state.last_meta = {}

    col_chat, col_trace = st.columns([1.2, 1])

    with col_chat:
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        prefill = st.session_state.pop("prefill", None)
        user_input = st.chat_input("Ask the agent…")
        if prefill and not user_input:
            user_input = prefill

        if user_input:
            st.session_state.messages.append({"role": "user", "content": user_input})
            with st.chat_message("user"):
                st.markdown(user_input)

            tracer = TraceLogger()
            if multi:
                orch = MultiAgentOrchestrator(mock=mock)
                result = orch.run(user_input)
                answer = result.final_answer
                steps = result.worker.steps
                meta = {"plan": result.plan, "critique": result.critique, "run_id": result.worker.run_id}
            else:
                agent = ReActAgent(mock=mock, tracer=tracer)
                result = agent.run(user_input)
                answer = result.answer
                steps = result.steps
                meta = {"run_id": result.run_id, "trace_path": result.trace_path}

            st.session_state.messages.append({"role": "assistant", "content": answer})
            st.session_state.last_steps = steps
            st.session_state.last_meta = meta
            with st.chat_message("assistant"):
                st.markdown(answer)

    with col_trace:
        st.markdown("#### Tool trace")
        meta = st.session_state.last_meta
        if meta:
            st.json(meta)
        steps = st.session_state.last_steps
        if not steps:
            st.info("Run a prompt to see thoughts / tool calls / observations.")
        for step in steps:
            label = f"Step {step.get('step')} · {step.get('type')}"
            with st.expander(label, expanded=True):
                st.markdown(f"**Thought:** {step.get('thought', '')}")
                if step.get("type") == "tool":
                    st.code(f"{step.get('tool')} {json.dumps(step.get('arguments'), ensure_ascii=False)}")
                    st.text(step.get("observation", ""))
                else:
                    st.success(step.get("answer", ""))


def run_app() -> None:
    st.set_page_config(page_title="Agent Workbench · 旅行规划", page_icon="🧳", layout="wide")
    st.title("🧳 Agent Workbench")
    st.caption("旗舰功能：旅行规划 Agent · 亦含 ReAct 工具聊天 / JSONL 轨迹 / Mock↔真实 LLM")

    tab_travel, tab_chat = st.tabs(["旅行规划", "工具聊天"])
    with tab_travel:
        _travel_tab()
    with tab_chat:
        _chat_tab()


if __name__ == "__main__":
    run_app()
