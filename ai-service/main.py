from __future__ import annotations

import os

from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI
from Main.llm import LLMClient
from Routes.adaptation import create_adaptation_router
from Routes.knowledge import create_knowledge_router
from Routes.system import create_system_router
from Service.adaptation import AdaptationService
from Storage.database import AIDatabase

ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ROOT_ENV)


def create_app() -> FastAPI:
    app = FastAPI(
        title="FitMaster AI Service",
        version="1.1.0",
    )

    database: AIDatabase | None = None
    llm: LLMClient | None = None
    adaptation_service: AdaptationService | None = None

    startup_errors: list[str] = []
    database_status = "error"
    ai_status = "not configured"

    try:
        database = AIDatabase()
        database.initialize()
        database_status = "configured"
    except Exception as exc:
        startup_errors.append(f"Database initialization failed: {exc}")

    try:
        llm = LLMClient()
        ai_status = "configured"
    except Exception as exc:
        startup_errors.append(f"AI initialization failed: {exc}")

    if database is not None and llm is not None:
        adaptation_service = AdaptationService(database, llm)

    startup_error = "; ".join(startup_errors) if startup_errors else None

    app.include_router(
        create_system_router(
            database_status=database_status,
            ai_status=ai_status,
            startup_error=startup_error,
        )
    )
    app.include_router(
        create_knowledge_router(
            service=adaptation_service,
            database=database,
            startup_error=startup_error,
        )
    )
    app.include_router(
        create_adaptation_router(
            service=adaptation_service,
            startup_error=startup_error,
        )
    )

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("AI_HOST", "127.0.0.1"),
        port=int(os.getenv("AI_PORT", "8000")),
        reload=False,
    )
