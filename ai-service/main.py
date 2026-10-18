from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from Main.llm import LLMClient
from Routes.adaptation import create_adaptation_router
from Routes.system import create_system_router
from Service.adaptation import AdaptationService

ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ROOT_ENV)


def create_app() -> FastAPI:
    app = FastAPI(
        title="FitMaster AI Service",
        version="1.1.0",
        description=(
            "Stateless adaptation service. PostgreSQL and workout-pattern persistence "
            "are owned by the main TypeScript application. AI calls use OpenRouter's "
            "dynamic free-model router."
        ),
    )

    llm: LLMClient | None = None
    startup_error: str | None = None
    ai_status = "not configured"

    try:
        llm = LLMClient()
        ai_status = "configured"
    except Exception as exc:
        startup_error = f"AI initialization failed: {exc}"

    adaptation_service = AdaptationService(llm) if llm is not None else None

    app.include_router(
        create_system_router(
            ai_status=ai_status,
            startup_error=startup_error,
            llm=llm,
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
