from __future__ import annotations

from pydantic import Field, field_validator

from Schema.input import CamelModel, WorkoutPlanInput


class GeneratedWorkoutOutput(CamelModel):
    name: str = Field(min_length=1, max_length=100)
    workout_plan: WorkoutPlanInput
    rationale: str = Field(min_length=1, max_length=2000)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return " ".join(value.strip().split())


class AdaptationGenerateResponse(CamelModel):
    user_id: int
    model: str
    generated_workout: GeneratedWorkoutOutput
    indicators: dict
    generation_id: int | None = None


class KnowledgeResponse(CamelModel):
    user_id: int
    profile: dict
    indicators: dict
