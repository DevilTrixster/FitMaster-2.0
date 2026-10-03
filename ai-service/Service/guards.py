from __future__ import annotations

from fastapi import HTTPException
from Schema.output import GeneratedWorkoutOutput


def validate_generated_workout(
    generated: GeneratedWorkoutOutput,
    available_exercises: list[dict],
) -> GeneratedWorkoutOutput:
    catalog = {int(exercise["id"]): exercise for exercise in available_exercises}

    plan = generated.workout_plan

    ids = [exercise.exercise_id for exercise in plan.exercises]
    orders = [exercise.order_index for exercise in plan.exercises]

    if len(ids) != len(set(ids)):
        raise HTTPException(502, "AI generated duplicate exerciseId values")

    if len(orders) != len(set(orders)):
        raise HTTPException(502, "AI generated duplicate orderIndex values")

    if sorted(orders) != list(range(len(orders))):
        raise HTTPException(502, "AI generated non-contiguous orderIndex values")

    for item in plan.exercises:
        catalog_item = catalog.get(item.exercise_id)
        if not catalog_item:
            raise HTTPException(
                502,
                f"AI selected exercise {item.exercise_id} which is not in the active exercise catalog",
            )

        # Название — не доверяем модели. Источник истины остаётся в TS/DB.
        item.exercise_name = str(catalog_item["name"])

    if not (1 <= len(plan.exercises) <= 12):
        raise HTTPException(502, "AI generated invalid exercise count")

    return generated
