from __future__ import annotations

from Main.llm import LLMClient
from Schema.input import AdaptationGenerateRequest, ProfileSyncRequest
from Schema.output import AdaptationGenerateResponse, KnowledgeResponse
from Service.builder import build_ai_context
from Service.indicators import build_indicators
from Service.guards import validate_generated_workout
from Storage.database import AIDatabase


class AdaptationService:
    def __init__(self, database: AIDatabase, llm: LLMClient) -> None:
        self.database = database
        self.llm = llm

    def initialize(self) -> None:
        self.database.initialize()

    def sync_profile(self, request: ProfileSyncRequest) -> KnowledgeResponse:
        profile = request.profile.model_dump(mode="json", by_alias=False)
        history = self.database.get_history(request.profile.id)
        indicators = build_indicators(profile, history)

        self.database.upsert_profile(
            request.profile.id,
            profile,
            indicators,
        )

        return KnowledgeResponse(
            user_id=request.profile.id,
            profile=profile,
            indicators=indicators,
        )

    def generate(self, request: AdaptationGenerateRequest) -> AdaptationGenerateResponse:
        profile = request.profile.model_dump(mode="json", by_alias=False)
        event = request.workout.model_dump(mode="python", by_alias=False)

        self.database.upsert_profile(request.profile.id, profile)
        for history_event in request.history:
            self.database.save_workout_event(
                history_event.model_dump(mode="python", by_alias=False)
            )
        self.database.save_workout_event(event)

        history = self.database.get_history(request.profile.id)
        indicators = build_indicators(profile, history)
        self.database.update_indicators(request.profile.id, indicators)

        current_catalog = [
            item.model_dump(mode="json", by_alias=False)
            for item in request.workout.exercise_catalog
        ]

        context = build_ai_context(
            profile=profile,
            indicators=indicators,
            history=history,
            current_catalog=current_catalog,
        )

        generated = self.llm.generate(context)
        generated = validate_generated_workout(generated, current_catalog)

        generation_id = self.database.save_generation(
            user_id=request.profile.id,
            source_workout_id=request.workout.source_workout_id,
            model=self.llm.model,
            indicators=indicators,
            generated_workout=generated.model_dump(mode="json", by_alias=False),
        )

        return AdaptationGenerateResponse(
            user_id=request.profile.id,
            model=self.llm.model,
            generated_workout=generated,
            indicators=indicators,
            generation_id=generation_id,
        )
