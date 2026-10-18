from __future__ import annotations

from typing import Any


def build_ai_context(
    profile: dict[str, Any],
    indicators: dict[str, Any],
    history: list[dict[str, Any]],
    current_workout: dict[str, Any],
    current_catalog: list[dict[str, Any]],
) -> dict[str, Any]:
    current_workout_id = current_workout["source_workout_id"]
    completed_history = [
        item
        for item in history
        if item.get("status") == "COMPLETED"
        and item.get("source_workout_id") != current_workout_id
    ]
    # Keep the prompt modest enough for the range of free models selected by
    # OpenRouter. Indicators above are still calculated from the full event list
    # supplied by TypeScript; this only limits the raw workout examples in text.
    recent = completed_history[-5:]

    def without_catalog(event: dict[str, Any]) -> dict[str, Any]:
        # The available catalog is passed once below. Duplicating it inside each
        # workout event needlessly multiplies the prompt size.
        return {key: value for key, value in event.items() if key != "exercise_catalog"}

    def compact_indicators(source: dict[str, Any]) -> dict[str, Any]:
        # Full indicators are returned to the TypeScript application, but the
        # model only needs metrics for exercises it may actually choose. This
        # avoids growing prompts indefinitely as a user builds workout history.
        compact = {
            key: value
            for key, value in source.items()
            if key not in {"catalog", "exercise_metrics"}
        }
        allowed_ids = {
            str(item.get("id"))
            for item in current_catalog
            if item.get("id") is not None
        }
        metrics = source.get("exercise_metrics", {})
        useful_fields = (
            "sessions",
            "total_sets",
            "successful_sets",
            "set_completion_rate",
            "average_reps",
            "average_weight_kg",
            "best_weight_kg",
            "best_estimated_1rm_kg",
            "last",
            "weight_progression",
            "reps_progression",
            "volume_progression",
        )
        if isinstance(metrics, dict):
            compact["exercise_metrics"] = {
                exercise_id: {
                    key: metrics[exercise_id][key]
                    for key in useful_fields
                    if key in metrics[exercise_id]
                }
                for exercise_id in allowed_ids
                if exercise_id in metrics and isinstance(metrics[exercise_id], dict)
            }
        return compact

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
            "indicators": compact_indicators(indicators),
        },
        "current_workout": without_catalog(current_workout),
        "recent_workouts": [without_catalog(item) for item in recent],
        "available_exercises": current_catalog,
    }
