from agent_workbench.memory import LongTermMemory, ShortTermMemory


def test_short_term_rolls():
    mem = ShortTermMemory(max_turns=3)
    for i in range(5):
        mem.add("user", str(i))
    assert len(mem.turns) == 3
    assert mem.turns[0].content == "2"


def test_long_term_roundtrip(tmp_path):
    db = tmp_path / "mem.db"
    mem = LongTermMemory(str(db))
    mem.write("lang", "python")
    assert mem.read("lang") == "python"
    assert mem.list_keys() == ["lang"]
    hits = mem.search("pyth")
    assert hits and hits[0]["key"] == "lang"
