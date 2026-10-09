from __future__ import annotations
import asyncio
from fastapi import APIRouter
from Main.llm import LLMClient

TEST_PROMPT = (
    "Привет! Ты — AI-ядро FitMaster. "
    "Ответь одной короткой фразой на русском, что ты готов генерировать тренировки."
)

def create_system_router(
    database_status: str,
    ai_status: str,
    startup_error: str | None,
    llm: LLMClient | None,
) -> APIRouter:
    router = APIRouter(tags=["System"])

    @router.get("/")
    def root() -> dict[str, str]:
        return {
            "status": "ok",
            "service": "FitMaster AI Service",
            "health": "/health",
            "docs": "/docs",
        }

    @router.get("/health")
    async def health() -> dict:
        # Запускаем синхронный ping в отдельном потоке, чтобы не блокировать FastAPI
        if llm is not None:
            ping_result = await asyncio.to_thread(llm.ping, TEST_PROMPT)
        else:
            ping_result = {
                "status": "skipped",
                "reply": None,
                "error": "LLM client is not initialized",
            }

        is_healthy = (
            database_status == "configured"
            and ai_status == "configured"
            and ping_result.get("status") == "ok"
        )

        result = {
            "status": "ok" if is_healthy else "degraded",
            "service": "FitMaster AI Service",
            "database": database_status,
            "ai": ai_status,
            "test_prompt": TEST_PROMPT,
            "ai_response": ping_result,
        }

        if startup_error:
            result["startup_error"] = startup_error

        return result

    return router