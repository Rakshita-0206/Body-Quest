"""
Load static game content from JSON files in app/body_quest/data/.

Edit the JSON files directly — do not embed large data structures here.
"""

import json
from pathlib import Path

_DATA_DIR = Path(__file__).resolve().parent / "data"


def _load_json(name: str):
    path = _DATA_DIR / name
    with open(path, encoding="utf-8") as f:
        return json.load(f)


STATIC_PATIENT = _load_json("patient.json")
STATIC_ORGANS = _load_json("organs.json")
STATIC_LEVELS = _load_json("levels.json")
STATIC_QUIZZES = {int(k): v for k, v in _load_json("quizzes.json").items()}
