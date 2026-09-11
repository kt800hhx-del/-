"""Streamlit UI — chat + tool trace panel."""

from __future__ import annotations

import json

import streamlit as st

from agent_workbench.agent import ReActAgent
from agent_workbench.multi_agent import MultiAgentOrchestrator
from agent_workbench.trace import TraceLogger

DEMO_PROMPTS = [
    "Calculate 12 * 7 + 3",
    "What time is it now?",
    "Read sandbox file welcome.txt and summarize it",
    "From company.json, what is metrics.tool_success_rate?",
    "Remember a note key=interview value=Agent Workbench demo",
]


def run_app() -> None:
    st.set_page_config(page_title="Agent Workbench", page_icon="🛠️", layout="wide")
    st.title("🛠️ Agent Workbench")
    st.caption("ReAct agent · tools · memory · JSONL traces · mock/real LLM")

    with st.sidebar:
        st.header("Settings")
        mock = st.toggle("Mock LLM (offline)", value=True)
        multi = st.toggle("Multi-agent (Planner→Worker→Critic)", value=False)
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
        st.subheader("Chat")
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
        st.subheader("Tool trace")
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


if __name__ == "__main__":
    run_app()
