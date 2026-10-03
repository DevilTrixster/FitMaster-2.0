from __future__ import annotations

from fastapi import APIRouter


def create_system_router(
    database_status: str,
    ai_status: str,
    startup_error: str | None,
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
    def health() -> dict[str, str]:
        result = {
            "status": (
                "ok"
                if database_status == "configured" and ai_status == "configured"
                else "degraded"
            ),
            "service": "FitMaster AI Service",
            "database": database_status,
            "ai": ai_status,
        }
        if startup_error:
            result["startup_error"] = startup_error
        return result

    return router
