import json
import os
from pathlib import Path

import pytest

from agent_workbench.memory import LongTermMemory
from agent_workbench.tools.calculator import calculator
from agent_workbench.tools.datetime_now import datetime_now
from agent_workbench.tools.json_query import json_query
from agent_workbench.tools.registry import build_default_registry
from agent_workbench.tools.sandbox_file import sandbox_file_read


def test_calculator_basic():
    assert calculator("12 * 7 + 3") == "87"


def test_calculator_rejects_names():
    with pytest.raises(Exception):
        calculator("__import__('os').system('echo hi')")


def test_datetime_now_format():
    out = datetime_now()
    assert "utc=" in out and "local=" in out


def test_json_query_dotted():
    data = {"metrics": {"tool_success_rate": 0.97}}
    assert "0.97" in json_query(data, "metrics.tool_success_rate")


def test_sandbox_file_read(tmp_path, monkeypatch):
    sandbox = tmp_path / "sandbox_data"
    sandbox.mkdir()
    (sandbox / "a.txt").write_text("hello", encoding="utf-8")
    monkeypatch.setenv("AGENT_WB_SANDBOX", str(sandbox))
    assert sandbox_file_read("a.txt") == "hello"


def test_sandbox_blocks_traversal(tmp_path, monkeypatch):
    sandbox = tmp_path / "sandbox_data"
    sandbox.mkdir()
    monkeypatch.setenv("AGENT_WB_SANDBOX", str(sandbox))
    with pytest.raises(PermissionError):
        sandbox_file_read("../secrets.txt")


def test_memory_note_tool(tmp_path):
    mem = LongTermMemory(str(tmp_path / "m.db"))
    reg = build_default_registry(mem)
    assert "OK" in reg.run("memory_note", {"op": "write", "key": "k", "value": "v"})
    assert reg.run("memory_note", {"op": "read", "key": "k"}) == "v"
    keys = json.loads(reg.run("memory_note", {"op": "list"}))
    assert "k" in keys
