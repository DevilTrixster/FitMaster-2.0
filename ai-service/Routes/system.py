from __future__ import annotations

import asyncio

from fastapi import APIRouter

from Main.llm import LLMClient

TEST_PROMPT = (
    "Привет! Ты — AI-ядро FitMaster. "
    "Ответь одной короткой фразой на русском, что ты готов генерировать тренировки."
)


def create_system_router(
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
            "ai_test": "/health/ai",
            "docs": "/docs",
        }

    @router.get("/health")
    def health() -> dict:
        # This endpoint deliberately does not call the model: free-model requests
        # are limited, so a simple health check must not consume one.
        is_ready = llm is not None
        result = {
            "status": "ok" if is_ready else "degraded",
            "service": "FitMaster AI Service",
            "database": "managed by the main TypeScript application",
            "ai": ai_status,
            "model_router": "openrouter/free",
            "ai_test": "/health/ai",
        }
        if startup_error:
            result["startup_error"] = startup_error
        return result

    @router.get("/health/ai")
    async def test_ai() -> dict:
        # Use this route manually when testing the actual provider connection.
        if llm is None:
            return {
                "status": "error",
                "error": startup_error or "LLM client is not initialized",
            }
        return await asyncio.to_thread(llm.ping, TEST_PROMPT)

    return router
