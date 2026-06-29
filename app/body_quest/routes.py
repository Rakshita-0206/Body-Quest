"""
Body Quest API routes — static JSON only (no database).
Mount via main.py: include_router(router, prefix="/body-quest")
"""

from datetime import datetime

from fastapi import APIRouter, Query

from app.body_quest.gamedata import (
    STATIC_LEVELS,
    STATIC_ORGANS,
    STATIC_PATIENT,
    STATIC_QUIZZES,
)

router = APIRouter()

_gamedata_cache: dict = {}


def _build_gamedata_cache():
    for lv in STATIC_LEVELS:
        lid = lv["id"]
        oids = lv.get("organ_ids", [o["id"] for o in STATIC_ORGANS])
        order = {oid: i for i, oid in enumerate(oids)}
        organs = sorted(
            [o for o in STATIC_ORGANS if o["id"] in oids],
            key=lambda o: order.get(o["id"], 99),
        )
        _gamedata_cache[lid] = {
            "patient": STATIC_PATIENT,
            "organs": organs,
            "quiz": STATIC_QUIZZES.get(lid, []),
            "level": {
                "id": lid,
                "title": lv["title"],
                "min_pass_score": lv["min_pass_score"],
            },
        }


_build_gamedata_cache()


@router.get("/api/gamedata")
def get_gamedata(level: int = Query(default=1)):
    try:
        level_id = int(level)
    except (ValueError, TypeError):
        level_id = 1
    return _gamedata_cache.get(level_id) or _gamedata_cache.get(1)


@router.get("/api/levels")
def get_levels():
    return {
        "levels": [
            {
                "id": lv["id"],
                "sort_order": lv["sort_order"],
                "title": lv["title"],
                "description": lv["description"],
                "status": "available" if lv["id"] == 1 else "locked",
            }
            for lv in STATIC_LEVELS
        ]
    }


@router.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "game": "body-quest"}
