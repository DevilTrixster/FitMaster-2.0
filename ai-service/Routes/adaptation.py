from __future__ import annotations

from fastapi import APIRouter, HTTPException
from Schema.input import AdaptationGenerateRequest
from Schema.output import AdaptationGenerateResponse
from Service.adaptation import AdaptationService


def create_adaptation_router(
    service: AdaptationService | None,
    startup_error: str | None,
) -> APIRouter:
    router = APIRouter(prefix="/api/v1/adaptation", tags=["Adaptation"])

    @router.post("/generate", response_model=AdaptationGenerateResponse)
    def generate_adaptation(
        request: AdaptationGenerateRequest,
    ) -> AdaptationGenerateResponse:
        if service is None:
            raise HTTPException(503, startup_error or "AI service is not ready")

        try:
            return service.generate(request)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(502, f"Adaptation generation failed: {exc}") from exc

    return router
