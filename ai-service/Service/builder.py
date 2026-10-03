from __future__ import annotations

from typing import Any


def build_ai_context(
    profile: dict[str, Any],
    indicators: dict[str, Any],
    history: list[dict[str, Any]],
    current_catalog: list[dict[str, Any]],
) -> dict[str, Any]:
    recent = history[-8:]

    relevant_profile = {
        "id": profile["id"],
        "gender": profile["gender"],
        "height": profile["height"],
        "weight": profile["weight"],
        "experience_level": profile["experience_level"],
        "fitness_goal": profile["fitness_goal"],
        "preferred_workout_time": profile["preferred_workout_time"],
        "preferred_days": profile["preferred_days"],
    }

    return {
        "user": {
            "profile": relevant_profile,
            "indicators": indicators,
        },
        "recent_workouts": recent,
        "available_exercises": current_catalog,
    }
