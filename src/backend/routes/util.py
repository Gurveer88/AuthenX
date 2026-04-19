from __future__ import annotations
import uuid
from pathlib import Path



_SKILLS_DIR = Path(__file__).resolve().parent.parent / "tools" / "skills"


def load_skills(tool: str) -> str:
    skills_file = _SKILLS_DIR / f"{tool}.md"
    if skills_file.exists():
        return skills_file.read_text(encoding="utf-8")
    return f"No specific skill instructions found for tool '{tool}'. Use your best judgement."


def new_task_id() -> str:
    return uuid.uuid4().hex[:12]