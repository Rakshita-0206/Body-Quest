"""
UTMT Learning Portal — FastAPI entry point.

Body Quest lives under:
  - Backend:  app/body_quest/
  - Frontend: templates/body_quest_templates/

Run: uvicorn main:app --reload --port 8000
Open: http://127.0.0.1:8000/body-quest/
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.body_quest.routes import router as body_quest_router

load_dotenv()

app = FastAPI(title="UTMT Learning Portal")

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
if FRONTEND_URL != "*":
    cors_origins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        FRONTEND_URL,
    ]
    allow_credentials = True
else:
    cors_origins = ["*"]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Body Quest API (register before static mount so /body-quest/api/* is handled)
app.include_router(body_quest_router, prefix="/body-quest", tags=["body-quest"])

# Body Quest game UI (HTML, JS, CSS, images, JSON data)
_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates" / "body_quest_templates"
app.mount(
    "/body-quest",
    StaticFiles(directory=str(_TEMPLATES_DIR), html=True),
    name="body_quest",
)


@app.get("/")
def root():
    return RedirectResponse(url="/body-quest/")


@app.get("/index.html")
def root_index():
    return RedirectResponse(url="/body-quest/")


@app.get("/health")
def portal_health():
    return {"status": "ok", "portal": "utmt"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("APP_DEBUG", "false").lower() == "true"

    print()
    print("  Body Quest — UTMT Learning Portal")
    print("  =================================")
    print(f"  Open: http://127.0.0.1:{port}/body-quest/")
    print("  (Do NOT open index.html directly — use the URL above)")
    print()

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
    )
