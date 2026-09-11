"""Short-term chat buffer + long-term SQLite memory."""

from __future__ import annotations

import os
import sqlite3
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


@dataclass
class ChatTurn:
    role: str
    content: str
    ts: float = field(default_factory=time.time)


class ShortTermMemory:
    """In-process rolling chat history for the current session."""

    def __init__(self, max_turns: int = 40) -> None:
        self.max_turns = max_turns
        self.turns: list[ChatTurn] = []

    def add(self, role: str, content: str) -> None:
        self.turns.append(ChatTurn(role=role, content=content))
        if len(self.turns) > self.max_turns:
            self.turns = self.turns[-self.max_turns :]

    def as_text(self) -> str:
        return "\n".join(f"{t.role}: {t.content}" for t in self.turns)

    def clear(self) -> None:
        self.turns.clear()


class LongTermMemory:
    """Persistent key/value + free-text notes in SQLite."""

    def __init__(self, db_path: str | None = None) -> None:
        path = db_path or os.getenv("AGENT_WB_MEMORY_DB") or "./data/memory.db"
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS notes (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at REAL NOT NULL
                )
                """
            )
            conn.commit()

    def write(self, key: str, value: str) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO notes(key, value, updated_at) VALUES(?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
                """,
                (key, value, time.time()),
            )
            conn.commit()

    def read(self, key: str) -> str | None:
        with self._connect() as conn:
            row = conn.execute("SELECT value FROM notes WHERE key = ?", (key,)).fetchone()
            return None if row is None else str(row["value"])

    def list_keys(self) -> list[str]:
        with self._connect() as conn:
            rows = conn.execute("SELECT key FROM notes ORDER BY key").fetchall()
            return [str(r["key"]) for r in rows]

    def search(self, query: str, limit: int = 10) -> list[dict]:
        q = f"%{query}%"
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT key, value, updated_at FROM notes
                WHERE key LIKE ? OR value LIKE ?
                ORDER BY updated_at DESC LIMIT ?
                """,
                (q, q, limit),
            ).fetchall()
            return [dict(r) for r in rows]
