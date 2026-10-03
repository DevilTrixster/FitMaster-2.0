from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from math import sqrt
from statistics import mean, pstdev
from typing import Any


# All calculated user indicators live in this module.
# Values are deterministic: the LLM receives them as facts and does not calculate them itself.
INDICATOR_CATALOG: tuple[dict[str, str], ...] = (
    {"key": "age_years", "group": "profile", "description": "Полный возраст пользователя в годах."},
    {"key": "height_cm", "group": "body", "description": "Текущий рост в сантиметрах."},
    {"key": "weight_kg", "group": "body", "description": "Текущий вес в килограммах."},
    {"key": "bmi", "group": "body", "description": "Индекс массы тела."},
    {"key": "bmr_kcal", "group": "nutrition", "description": "Расчётный базовый обмен по Mifflin-St Jeor."},
    {"key": "activity_factor", "group": "nutrition", "description": "Коэффициент активности по частоте тренировок."},
    {"key": "maintenance_calories_kcal", "group": "nutrition", "description": "Расчётная калорийность поддержания."},
    {"key": "target_calories_kcal", "group": "nutrition", "description": "Расчётная калорийность с поправкой на цель; эвристика."},
    {"key": "protein_target_g_day", "group": "nutrition", "description": "Эвристический диапазон/цель белка в граммах в сутки."},
    {"key": "water_target_ml_day", "group": "nutrition", "description": "Эвристическая суточная потребность в воде по массе тела."},
    {"key": "preferred_days_count", "group": "schedule", "description": "Количество выбранных дней недели."},
    {"key": "preferred_workout_time", "group": "schedule", "description": "Предпочтительное время тренировки."},
    {"key": "completed_workouts", "group": "training", "description": "Всего завершённых тренировок в AI-истории."},
    {"key": "workouts_last_7_days", "group": "training", "description": "Количество завершённых тренировок за 7 дней."},
    {"key": "workouts_last_28_days", "group": "training", "description": "Количество завершённых тренировок за 28 дней."},
    {"key": "workouts_last_84_days", "group": "training", "description": "Количество завершённых тренировок за 84 дня."},
    {"key": "average_sessions_per_week_28d", "group": "training", "description": "Средняя частота тренировок в неделю за 28 дней."},
    {"key": "average_sessions_per_week_84d", "group": "training", "description": "Средняя частота тренировок в неделю за 84 дня."},
    {"key": "days_since_last_workout", "group": "training", "description": "Количество дней с последней завершённой тренировки."},
    {"key": "average_workout_duration_minutes", "group": "training", "description": "Средняя длительность тренировки."},
    {"key": "average_exercises_per_workout", "group": "training", "description": "Среднее количество упражнений за тренировку."},
    {"key": "unique_exercises_used", "group": "training", "description": "Количество различных использованных упражнений."},
    {"key": "total_workout_volume_kg", "group": "load", "description": "Суммарный вес×повторения по истории."},
    {"key": "average_workout_volume_kg", "group": "load", "description": "Средний объём тренировки."},
    {"key": "average_volume_last_4_workouts_kg", "group": "load", "description": "Средний объём последних 4 тренировок."},
    {"key": "volume_last_28d_kg", "group": "load", "description": "Общий объём за последние 28 дней."},
    {"key": "volume_previous_28d_kg", "group": "load", "description": "Общий объём за предыдущие 28 дней."},
    {"key": "volume_change_28d_percent", "group": "load", "description": "Изменение недель/месячного объёма относительно предыдущих 28 дней."},
    {"key": "average_rest_seconds", "group": "load", "description": "Средний заявленный отдых между подходами."},
    {"key": "average_wellness", "group": "recovery", "description": "Средняя субъективная оценка состояния 1–5."},
    {"key": "average_fatigue", "group": "recovery", "description": "Средняя субъективная оценка усталости 1–5."},
    {"key": "readiness_score", "group": "recovery", "description": "Эвристический индекс готовности 0–100 на основе wellness/fatigue."},
    {"key": "set_completion_rate", "group": "execution", "description": "Доля заполненных/выполненных подходов."},
    {"key": "average_rep_attainment", "group": "execution", "description": "Среднее фактическое количество повторений относительно плана."},
    {"key": "average_weight_attainment", "group": "execution", "description": "Средний фактический вес относительно плана."},
    {"key": "replacement_count", "group": "replacements", "description": "Общее число сохранённых замен упражнений."},
    {"key": "replacement_rate_per_workout", "group": "replacements", "description": "Среднее количество замен на завершённую тренировку."},
    {"key": "distinct_replaced_exercises", "group": "replacements", "description": "Количество разных заменённых позиций."},
    {"key": "recent_replacements_28d", "group": "replacements", "description": "Количество замен за последние 28 дней."},
    {"key": "exercise_metrics", "group": "exercise", "description": "Набор индивидуальных метрик каждого упражнения."},
    {"key": "muscle_group_metrics", "group": "muscles", "description": "Объём и доля нагрузки по мышечным группам."},
    {"key": "workout_volume_trend", "group": "trend", "description": "Последовательность объёмов завершённых тренировок."},
    {"key": "exercise_progression", "group": "trend", "description": "Изменение веса, повторений, объёма и оценочного 1RM по упражнениям."},
)


def _value_by_type(values: list[dict[str, Any]] | None, value_type: str) -> float | None:
    if not values:
        return None
    for item in values:
        if item.get("type") == value_type:
            raw = item.get("value")
            if isinstance(raw, (int, float)):
                return float(raw)
    return None


def _parse_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if not isinstance(value, str):
        return None
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return result if result.tzinfo else result.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _age_from_birth_date(birth_date: str, now: datetime) -> int | None:
    try:
        birthday = datetime.strptime(birth_date, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None
    today = now.date()
    return max(today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day)), 0)


def _duration_minutes(started_at: Any, completed_at: Any) -> float | None:
    start = _parse_datetime(started_at)
    end = _parse_datetime(completed_at)
    if not start or not end:
        return None
    seconds = (end - start).total_seconds()
    return seconds / 60 if seconds >= 0 else None


def _exercise_volume(exercise: dict[str, Any]) -> float:
    total = 0.0
    for set_values in exercise.get("actual_values", []):
        if set_values is None:
            continue
        reps = _value_by_type(set_values, "reps")
        weight = _value_by_type(set_values, "weight")
        if reps is not None and weight is not None:
            total += reps * weight
    return total


def _workout_volume(workout: dict[str, Any]) -> float:
    return sum(_exercise_volume(exercise) for exercise in workout.get("actual_data", {}).get("exercises", []))


def _safe_percent(current: float | None, previous: float | None) -> float | None:
    if current is None or previous in (None, 0):
        return None
    return round(((current - previous) / previous) * 100, 2)


def _activity_factor(sessions_per_week: float) -> float:
    if sessions_per_week <= 0:
        return 1.2
    if sessions_per_week < 2:
        return 1.375
    if sessions_per_week < 5:
        return 1.55
    if sessions_per_week < 7:
        return 1.725
    return 1.9


def _goal_calorie_adjustment(goal: str) -> float:
    return {
        "weight_loss": -0.15,
        "recomposition": -0.05,
        "muscle_gain": 0.10,
        "strength": 0.05,
        "endurance": 0.05,
        "maintenance": 0.0,
        "aesthetics": 0.0,
        "mobility": 0.0,
        "rehabilitation": 0.0,
        "sports": 0.05,
        "event": -0.05,
        "stress_relief": 0.0,
        "energy": 0.0,
        "competition": 0.05,
        "posture": 0.0,
        "healthy_aging": 0.0,
    }.get(goal, 0.0)


def _protein_multiplier(goal: str, experience: str) -> float:
    if goal in {"muscle_gain", "strength", "recomposition"}:
        base = 1.8
    elif goal == "weight_loss":
        base = 1.7
    else:
        base = 1.4
    if experience in {"advanced", "master"}:
        base += 0.1
    return base


def _readiness_score(wellness_values: list[float], fatigue_values: list[float]) -> float | None:
    if not wellness_values and not fatigue_values:
        return None
    wellness_score = (mean(wellness_values) - 1) / 4 if wellness_values else 0.5
    fatigue_score = 1 - ((mean(fatigue_values) - 1) / 4) if fatigue_values else 0.5
    return round(max(0.0, min(1.0, (wellness_score * 0.6) + (fatigue_score * 0.4))) * 100, 2)


def _trend(values: list[float]) -> dict[str, float | None]:
    if not values:
        return {"first": None, "last": None, "delta": None, "delta_percent": None, "slope_per_session": None}
    if len(values) == 1:
        return {"first": round(values[0], 2), "last": round(values[0], 2), "delta": 0.0, "delta_percent": 0.0, "slope_per_session": 0.0}
    first = values[0]
    last = values[-1]
    return {
        "first": round(first, 2),
        "last": round(last, 2),
        "delta": round(last - first, 2),
        "delta_percent": _safe_percent(last, first),
        "slope_per_session": round((last - first) / (len(values) - 1), 4),
    }


def build_indicators(profile: dict[str, Any], history: list[dict[str, Any]]) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    completed = [row for row in history if row.get("status") == "COMPLETED" and isinstance(row.get("actual_data"), dict)]
    completed_sorted = sorted(completed, key=lambda row: _parse_datetime(row.get("completed_at")) or datetime.min.replace(tzinfo=timezone.utc))

    dates = [d for row in completed_sorted if (d := _parse_datetime(row.get("completed_at"))) is not None]
    recent_7_cutoff = now - timedelta(days=7)
    recent_28_cutoff = now - timedelta(days=28)
    previous_28_cutoff = now - timedelta(days=56)
    recent_84_cutoff = now - timedelta(days=84)

    recent_7 = [row for row in completed_sorted if (_parse_datetime(row.get("completed_at")) or datetime.min.replace(tzinfo=timezone.utc)) >= recent_7_cutoff]
    recent_28 = [row for row in completed_sorted if (_parse_datetime(row.get("completed_at")) or datetime.min.replace(tzinfo=timezone.utc)) >= recent_28_cutoff]
    previous_28 = [
        row for row in completed_sorted
        if previous_28_cutoff <= (_parse_datetime(row.get("completed_at")) or datetime.min.replace(tzinfo=timezone.utc)) < recent_28_cutoff
    ]
    recent_84 = [row for row in completed_sorted if (_parse_datetime(row.get("completed_at")) or datetime.min.replace(tzinfo=timezone.utc)) >= recent_84_cutoff]

    sessions_per_week_28 = len(recent_28) / 4
    sessions_per_week_84 = len(recent_84) / 12
    age = _age_from_birth_date(profile.get("birth_date", ""), now)

    height = float(profile.get("height", 0) or 0)
    weight = float(profile.get("weight", 0) or 0)
    bmi = round(weight / ((height / 100) ** 2), 2) if height > 0 else None

    bmr: float | None = None
    if age is not None and weight > 0 and height > 0 and profile.get("gender") in {"male", "female"}:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + (5 if profile["gender"] == "male" else -161)
    activity = _activity_factor(sessions_per_week_28)
    maintenance = round(bmr * activity, 0) if bmr is not None else None
    calorie_adjustment = _goal_calorie_adjustment(str(profile.get("fitness_goal", "maintenance")))
    target_calories = round(maintenance * (1 + calorie_adjustment), 0) if maintenance is not None else None
    protein_target = round(weight * _protein_multiplier(str(profile.get("fitness_goal", "maintenance")), str(profile.get("experience_level", "beginner"))), 1) if weight > 0 else None
    water_target = round(weight * 32, 0) if weight > 0 else None

    durations = [value for row in completed_sorted if (value := _duration_minutes(row.get("started_at"), row.get("completed_at"))) is not None]
    wellness = [float(row["actual_data"]["wellness"]) for row in completed_sorted if isinstance(row.get("actual_data", {}).get("wellness"), (int, float))]
    fatigue = [float(row["actual_data"]["fatigue"]) for row in completed_sorted if isinstance(row.get("actual_data", {}).get("fatigue"), (int, float))]
    rests = [float(row["actual_data"]["rest_seconds"]) for row in completed_sorted if isinstance(row.get("actual_data", {}).get("rest_seconds"), (int, float))]

    session_volumes = [_workout_volume(row) for row in completed_sorted]
    last_4_volumes = session_volumes[-4:]
    volume_28 = sum(_workout_volume(row) for row in recent_28)
    volume_previous_28 = sum(_workout_volume(row) for row in previous_28)

    exercise_stats: dict[int, dict[str, Any]] = defaultdict(lambda: {
        "sessions": 0,
        "total_sets": 0,
        "successful_sets": 0,
        "reps": [],
        "weights": [],
        "volumes": [],
        "estimated_1rm": [],
        "observations": [],
    })
    muscle_volume: dict[str, float] = defaultdict(float)
    muscle_sets: dict[str, float] = defaultdict(float)

    replacement_count = 0
    replacement_rate_workouts: list[int] = []
    distinct_replaced: set[int] = set()
    recent_replacements_28d = 0
    total_set_count = 0
    successful_set_count = 0
    rep_attainment_values: list[float] = []
    weight_attainment_values: list[float] = []

    for row in completed_sorted:
        replacements = row.get("replacements") if isinstance(row.get("replacements"), list) else []
        replacement_count += len(replacements)
        replacement_rate_workouts.append(len(replacements))
        completed_at = _parse_datetime(row.get("completed_at"))
        if completed_at and completed_at >= recent_28_cutoff:
            recent_replacements_28d += len(replacements)
        for replacement in replacements:
            if isinstance(replacement, dict) and replacement.get("planned_exercise_id") is not None:
                distinct_replaced.add(int(replacement["planned_exercise_id"]))

        actual = row.get("actual_data", {})
        planned_map = {
            int(item["exercise_id"]): item
            for item in row.get("planned_data", {}).get("exercises", [])
            if isinstance(item, dict) and item.get("exercise_id") is not None
        }
        catalog = {
            int(item["id"]): item
            for item in row.get("exercise_catalog", [])
            if isinstance(item, dict) and item.get("id") is not None
        }

        for exercise in actual.get("exercises", []):
            exercise_id = int(exercise["exercise_id"])
            stat = exercise_stats[exercise_id]
            stat["sessions"] += 1
            set_values_list = exercise.get("actual_values", [])
            stat["total_sets"] += len(set_values_list)
            total_set_count += len(set_values_list)

            session_reps: list[float] = []
            session_weights: list[float] = []
            session_volume = 0.0
            session_1rm: list[float] = []

            for set_values in set_values_list:
                if set_values is None:
                    continue
                successful_set_count += 1
                stat["successful_sets"] += 1
                reps = _value_by_type(set_values, "reps")
                set_weight = _value_by_type(set_values, "weight")
                if reps is not None:
                    stat["reps"].append(reps)
                    session_reps.append(reps)
                if set_weight is not None:
                    stat["weights"].append(set_weight)
                    session_weights.append(set_weight)
                if reps is not None and set_weight is not None:
                    volume = reps * set_weight
                    session_volume += volume
                    stat["volumes"].append(volume)
                    if 1 <= reps <= 30:
                        estimated = set_weight * (1 + reps / 30)
                        stat["estimated_1rm"].append(estimated)
                        session_1rm.append(estimated)

            planned = planned_map.get(exercise_id, {})
            planned_targets = planned.get("target", [])
            target_reps = _value_by_type(planned_targets, "reps")
            target_weight = _value_by_type(planned_targets, "weight")
            actual_avg_reps = mean(session_reps) if session_reps else None
            actual_avg_weight = mean(session_weights) if session_weights else None
            if target_reps and actual_avg_reps is not None:
                rep_attainment_values.append(actual_avg_reps / target_reps)
            if target_weight and actual_avg_weight is not None:
                weight_attainment_values.append(actual_avg_weight / target_weight)

            stat["observations"].append({
                "timestamp": completed_at.isoformat() if completed_at else None,
                "avg_reps": round(actual_avg_reps, 2) if actual_avg_reps is not None else None,
                "avg_weight_kg": round(actual_avg_weight, 2) if actual_avg_weight is not None else None,
                "target_reps": target_reps,
                "target_weight_kg": target_weight,
                "rep_attainment": round(actual_avg_reps / target_reps, 3) if actual_avg_reps is not None and target_reps else None,
                "weight_attainment": round(actual_avg_weight / target_weight, 3) if actual_avg_weight is not None and target_weight else None,
                "volume_kg": round(session_volume, 2),
                "estimated_1rm_kg": round(max(session_1rm), 2) if session_1rm else None,
            })

            for muscle in catalog.get(exercise_id, {}).get("muscle_groups", []):
                code = muscle.get("code")
                ratio = float(muscle.get("load_ratio", 0) or 0)
                if code:
                    muscle_volume[code] += session_volume * ratio
                    muscle_sets[code] += len(set_values_list) * ratio

    exercise_metrics: dict[str, Any] = {}
    for exercise_id, stat in exercise_stats.items():
        weights = stat["weights"]
        reps = stat["reps"]
        volumes = stat["volumes"]
        e1rm = stat["estimated_1rm"]
        latest = stat["observations"][-1] if stat["observations"] else None
        previous = stat["observations"][-2] if len(stat["observations"]) >= 2 else None
        average_weight = mean(weights) if weights else None
        average_reps = mean(reps) if reps else None
        average_volume = mean(volumes) if volumes else 0.0
        best_weight = max(weights) if weights else None
        best_1rm = max(e1rm) if e1rm else None
        completion_rate = stat["successful_sets"] / stat["total_sets"] if stat["total_sets"] else 0.0
        exercise_metrics[str(exercise_id)] = {
            "sessions": stat["sessions"],
            "total_sets": stat["total_sets"],
            "successful_sets": stat["successful_sets"],
            "set_completion_rate": round(completion_rate, 3),
            "average_reps": round(average_reps, 2) if average_reps is not None else None,
            "average_weight_kg": round(average_weight, 2) if average_weight is not None else None,
            "best_weight_kg": round(best_weight, 2) if best_weight is not None else None,
            "average_set_volume_kg": round(average_volume, 2),
            "best_estimated_1rm_kg": round(best_1rm, 2) if best_1rm is not None else None,
            "weight_consistency_cv": round(pstdev(weights) / average_weight, 3) if len(weights) > 1 and average_weight else None,
            "last": latest,
            "weight_progression": _trend([x.get("avg_weight_kg") for x in stat["observations"] if x.get("avg_weight_kg") is not None]),
            "reps_progression": _trend([x.get("avg_reps") for x in stat["observations"] if x.get("avg_reps") is not None]),
            "volume_progression": _trend([x.get("volume_kg") for x in stat["observations"] if x.get("volume_kg") is not None]),
            "estimated_1rm_progression": _trend([x.get("estimated_1rm_kg") for x in stat["observations"] if x.get("estimated_1rm_kg") is not None]),
        }

    total_muscle_volume = sum(muscle_volume.values())
    muscle_metrics = {
        code: {
            "volume_kg": round(volume, 2),
            "sets": round(muscle_sets.get(code, 0.0), 2),
            "volume_share": round(volume / total_muscle_volume, 3) if total_muscle_volume else 0.0,
        }
        for code, volume in sorted(muscle_volume.items(), key=lambda item: item[1], reverse=True)
    }

    readiness = _readiness_score(wellness, fatigue)
    result: dict[str, Any] = {
        "catalog": list(INDICATOR_CATALOG),
        "profile": {
            "age_years": age,
            "height_cm": height,
            "weight_kg": weight,
            "bmi": bmi,
            "gender": profile.get("gender"),
            "fitness_goal": profile.get("fitness_goal"),
            "experience_level": profile.get("experience_level"),
            "preferred_days": profile.get("preferred_days", []),
            "preferred_days_count": len(profile.get("preferred_days", [])),
            "preferred_workout_time": profile.get("preferred_workout_time"),
        },
        "nutrition": {
            "bmr_kcal": round(bmr, 0) if bmr is not None else None,
            "activity_factor": activity,
            "maintenance_calories_kcal": maintenance,
            "target_calories_kcal": target_calories,
            "protein_target_g_day": protein_target,
            "water_target_ml_day": water_target,
            "calorie_adjustment_percent": round(calorie_adjustment * 100, 2),
        },
        "training": {
            "completed_workouts": len(completed_sorted),
            "workouts_last_7_days": len(recent_7),
            "workouts_last_28_days": len(recent_28),
            "workouts_last_84_days": len(recent_84),
            "average_sessions_per_week_28d": round(sessions_per_week_28, 2),
            "average_sessions_per_week_84d": round(sessions_per_week_84, 2),
            "days_since_last_workout": max(0, (now - dates[-1]).days) if dates else None,
            "latest_completed_at": dates[-1].isoformat() if dates else None,
            "unique_exercises_used": len(exercise_stats),
            "average_exercises_per_workout": round(mean([len(row.get("actual_data", {}).get("exercises", [])) for row in completed_sorted]), 2) if completed_sorted else 0.0,
            "average_workout_duration_minutes": round(mean(durations), 2) if durations else None,
        },
        "load": {
            "total_workout_volume_kg": round(sum(session_volumes), 2),
            "average_workout_volume_kg": round(mean(session_volumes), 2) if session_volumes else 0.0,
            "average_volume_last_4_workouts_kg": round(mean(last_4_volumes), 2) if last_4_volumes else 0.0,
            "volume_last_28d_kg": round(volume_28, 2),
            "volume_previous_28d_kg": round(volume_previous_28, 2),
            "volume_change_28d_percent": _safe_percent(volume_28, volume_previous_28),
            "average_rest_seconds": round(mean(rests), 2) if rests else None,
            "workout_volume_trend": _trend(session_volumes[-8:]),
        },
        "recovery": {
            "average_wellness": round(mean(wellness), 2) if wellness else None,
            "average_fatigue": round(mean(fatigue), 2) if fatigue else None,
            "readiness_score": readiness,
        },
        "execution": {
            "set_completion_rate": round(successful_set_count / total_set_count, 3) if total_set_count else 0.0,
            "average_rep_attainment": round(mean(rep_attainment_values), 3) if rep_attainment_values else None,
            "average_weight_attainment": round(mean(weight_attainment_values), 3) if weight_attainment_values else None,
        },
        "replacements": {
            "replacement_count": replacement_count,
            "replacement_rate_per_workout": round(mean(replacement_rate_workouts), 2) if replacement_rate_workouts else 0.0,
            "distinct_replaced_exercises": len(distinct_replaced),
            "recent_replacements_28d": recent_replacements_28d,
        },
        "exercise_metrics": exercise_metrics,
        "muscle_group_metrics": muscle_metrics,
    }
    return result
