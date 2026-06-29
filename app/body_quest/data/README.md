# Body Quest — game data (JSON)

Static content for optional API routes in `app/body_quest/routes.py`.
Edit these `.json` files — not `gamedata.py`.

No database is used.

| File | Purpose |
|------|---------|
| `patient.json` | Patient profile (name, age, symptoms) |
| `organs.json` | Organ definitions and per-organ question steps |
| `levels.json` | Level metadata (title, pass score, organ order) |
| `quizzes.json` | MCQ questions keyed by level id (`"1"`, `"2"`, `"3"`) |

`gamedata.py` loads these at startup.
