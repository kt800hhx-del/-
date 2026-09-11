"""Sandboxed file read — confined to sandbox_data."""

from __future__ import annotations

import os
from pathlib import Path


def _sandbox_root() -> Path:
    raw = os.getenv("AGENT_WB_SANDBOX") or "./sandbox_data"
    return Path(raw).resolve()


def sandbox_file_read(path: str) -> str:
    root = _sandbox_root()
    # Normalize and block traversal
    target = (root / path).resolve()
    if not str(target).startswith(str(root)):
        raise PermissionError("path escapes sandbox")
    if not target.exists():
        raise FileNotFoundError(f"not found: {path}")
    if not target.is_file():
        raise IsADirectoryError(f"not a file: {path}")
    return target.read_text(encoding="utf-8")
