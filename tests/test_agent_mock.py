import os

from agent_workbench.agent import ReActAgent
from agent_workbench.multi_agent import MultiAgentOrchestrator
from agent_workbench.trace import TraceLogger


def test_mock_agent_calculator(tmp_path, monkeypatch):
    monkeypatch.setenv("AGENT_WB_MOCK", "1")
    monkeypatch.setenv("AGENT_WB_MEMORY_DB", str(tmp_path / "m.db"))
    monkeypatch.setenv("AGENT_WB_TRACE_DIR", str(tmp_path / "traces"))
    agent = ReActAgent(mock=True, tracer=TraceLogger(str(tmp_path / "traces")))
    result = agent.run("Calculate 12 * 7 + 3")
    assert result.answer
    tools_used = [s.get("tool") for s in result.steps if s.get("type") == "tool"]
    assert "calculator" in tools_used
    assert any("87" in (s.get("observation") or "") for s in result.steps)
    assert result.trace_path
    assert os.path.exists(result.trace_path)


def test_mock_agent_datetime(tmp_path, monkeypatch):
    monkeypatch.setenv("AGENT_WB_MEMORY_DB", str(tmp_path / "m.db"))
    monkeypatch.setenv("AGENT_WB_TRACE_DIR", str(tmp_path / "traces"))
    agent = ReActAgent(mock=True, tracer=TraceLogger(str(tmp_path / "traces")))
    result = agent.run("What time is it now?")
    tools_used = [s.get("tool") for s in result.steps if s.get("type") == "tool"]
    assert "datetime_now" in tools_used


def test_multi_agent_mock(tmp_path, monkeypatch):
    monkeypatch.setenv("AGENT_WB_MEMORY_DB", str(tmp_path / "m.db"))
    monkeypatch.setenv("AGENT_WB_TRACE_DIR", str(tmp_path / "traces"))
    orch = MultiAgentOrchestrator(mock=True)
    result = orch.run("Calculate 2 + 2")
    assert result.plan
    assert result.final_answer
    assert result.critique
