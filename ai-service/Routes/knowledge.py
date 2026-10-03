from __future__ import annotations

from fastapi import APIRouter, HTTPException
from Schema.input import ProfileSyncRequest
from Schema.output import KnowledgeResponse
from Service.adaptation import AdaptationService
from Storage.database import AIDatabase


def create_knowledge_router(
    service: AdaptationService | None,
    database: AIDatabase | None,
    startup_error: str | None,
) -> APIRouter:
    router = APIRouter(prefix="/api/v1/knowledge", tags=["Knowledge"])

    def ensure_service() -> AdaptationService:
        if service is None:
            raise HTTPException(503, startup_error or "AI service is not ready")
        return service

    @router.post("/profile", response_model=KnowledgeResponse)
    def sync_profile(request: ProfileSyncRequest) -> KnowledgeResponse:
        return ensure_service().sync_profile(request)

    @router.get("/{user_id}", response_model=KnowledgeResponse)
    def get_knowledge(user_id: int) -> KnowledgeResponse:
        if database is None:
            raise HTTPException(503, startup_error or "Database is not ready")

        knowledge = database.get_knowledge(user_id)
        if not knowledge:
            raise HTTPException(404, f"Knowledge for user {user_id} not found")

        return KnowledgeResponse(
            user_id=user_id,
            profile=knowledge["profile"],
            indicators=knowledge["indicators"],
        )

    return router
