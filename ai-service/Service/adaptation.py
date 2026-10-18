from __future__ import annotations

from Main.llm import LLMClient
from Schema.input import AdaptationGenerateRequest
from Schema.output import AdaptationGenerateResponse
from Service.builder import build_ai_context
from Service.guards import validate_generated_workout
from Service.indicators import build_indicators


class AdaptationService:
    """Stateless AI layer; TypeScript/PostgreSQL remains the source of truth."""

    def __init__(self, llm: LLMClient) -> None:
        self.llm = llm

    def generate(self, request: AdaptationGenerateRequest) -> AdaptationGenerateResponse:
        if request.workout.user_id != request.profile.id:
            raise ValueError("Workout user_id does not match profile id")
        if request.workout.status != "COMPLETED":
            raise ValueError("Only completed workouts can trigger adaptation")
        if any(item.user_id != request.profile.id for item in request.history):
            raise ValueError("Workout history contains an event for another user")

        profile = request.profile.model_dump(mode="python", by_alias=False)
        event = request.workout.model_dump(mode="python", by_alias=False)

        # The main application already owns every completed workout in PostgreSQL.
        # Do not duplicate user/profile/history tables in a second AI database.
        history_by_id: dict[int, dict] = {}
        for history_event in request.history:
            item = history_event.model_dump(mode="python", by_alias=False)
            if item["source_workout_id"] != request.workout.source_workout_id:
                history_by_id[item["source_workout_id"]] = item
        history_by_id[request.workout.source_workout_id] = event
        history = list(history_by_id.values())

        indicators = build_indicators(profile, history)
        current_catalog = [
            item.model_dump(mode="python", by_alias=False)
            for item in request.workout.exercise_catalog
        ]
        context = build_ai_context(
            profile=profile,
            indicators=indicators,
            history=history,
            current_workout=event,
            current_catalog=current_catalog,
        )

        generated, used_model = self.llm.generate(context)
        generated = validate_generated_workout(generated, current_catalog)

        # Persistence is intentionally done by TypeScript through
        # CreateWorkoutPatternUseCase -> workout_pattern. AI does not own a DB.
        return AdaptationGenerateResponse(
            user_id=request.profile.id,
            model=used_model,
            generated_workout=generated,
            indicators=indicators,
            generation_id=None,
        )
