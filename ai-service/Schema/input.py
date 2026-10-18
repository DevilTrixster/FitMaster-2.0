from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class MuscleLoad(CamelModel):
    code: str
    name: str
    load_ratio: float = Field(ge=0, le=1)
    is_primary: bool


class ExerciseInput(CamelModel):
    id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=100)
    equipment_type: str
    muscle_groups: list[MuscleLoad] = Field(default_factory=list)


class RepsValue(CamelModel):
    type: Literal["reps"]
    metric: Literal["count"]
    value: int = Field(gt=0)


class WeightValue(CamelModel):
    type: Literal["weight"]
    metric: Literal["kg"]
    value: float = Field(ge=0)


class DurationValue(CamelModel):
    type: Literal["duration"]
    metric: Literal["min_sec"]
    value: str = Field(pattern=r"^\d{2}:[0-5]\d$")


class DistanceValue(CamelModel):
    type: Literal["distance"]
    metric: Literal["metr"]
    value: float = Field(ge=0)


WorkoutValue = Annotated[
    RepsValue | WeightValue | DurationValue | DistanceValue,
    Field(discriminator="type"),
]


class ActualRepsValue(CamelModel):
    """Actual performance may legitimately be zero even though a target may not."""

    type: Literal["reps"]
    metric: Literal["count"]
    value: int = Field(ge=0)


ActualWorkoutValue = Annotated[
    ActualRepsValue | WeightValue | DurationValue | DistanceValue,
    Field(discriminator="type"),
]


class WorkoutExercisePlanInput(CamelModel):
    exercise_id: int = Field(gt=0)
    exercise_name: str = Field(min_length=1, max_length=100)
    order_index: int = Field(ge=0)
    sets: int = Field(gt=0, le=20)
    target: list[WorkoutValue] = Field(min_length=1)


class WorkoutPlanInput(CamelModel):
    exercises: list[WorkoutExercisePlanInput] = Field(min_length=1, max_length=12)
    rest_seconds: int = Field(ge=0, le=900)


class WorkoutExerciseResultInput(CamelModel):
    exercise_id: int = Field(gt=0)
    exercise_name: str = Field(min_length=1, max_length=100)
    order_index: int = Field(ge=0)
    sets: int = Field(gt=0, le=20)
    actual_values: list[list[ActualWorkoutValue] | None]


class WorkoutResultInput(CamelModel):
    rest_seconds: int = Field(ge=0)
    wellness: int | None = Field(default=None, ge=1, le=5)
    fatigue: int | None = Field(default=None, ge=1, le=5)
    exercises: list[WorkoutExerciseResultInput] = Field(min_length=1)


class UserProfileInput(CamelModel):
    id: int = Field(gt=0)
    nickname: str
    email: str
    first_name: str
    last_name: str
    birth_date: str
    gender: str
    height: float = Field(gt=0)
    weight: float = Field(ge=0)
    avatar_url: str | None = None
    preferred_workout_time: str
    preferred_days: list[int] = Field(min_length=1)
    experience_level: str
    fitness_goal: str
    created_at: datetime
    updated_at: datetime


class ReplacementInput(CamelModel):
    planned_exercise_id: int = Field(gt=0)
    exercise_id: int = Field(gt=0)
    adaptation_data: dict | None = None


class WorkoutEventInput(CamelModel):
    user_id: int = Field(gt=0)
    source_workout_id: int = Field(gt=0)
    pattern_id: UUID
    status: Literal["COMPLETED"]
    original_scheduled_at: datetime
    scheduled_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    planned_data: WorkoutPlanInput
    actual_data: WorkoutResultInput
    replacements: list[ReplacementInput] = Field(default_factory=list)
    exercise_catalog: list[ExerciseInput] = Field(min_length=1)


class AdaptationGenerateRequest(CamelModel):
    profile: UserProfileInput
    workout: WorkoutEventInput
    history: list[WorkoutEventInput] = Field(default_factory=list)

