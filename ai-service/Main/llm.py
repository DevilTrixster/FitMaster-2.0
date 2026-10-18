from __future__ import annotations

import json
import logging
import os
import re
import time
from typing import Any

from pydantic import ValidationError

from Schema.output import GeneratedWorkoutOutput

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "openrouter/free"
MAX_COMPLETION_TOKENS = 3000


class LLMClient:
    """OpenAI-compatible client configured to use OpenRouter's free-model router."""

    def __init__(self) -> None:
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("API_KEY")
        if not self.api_key:
            raise RuntimeError("AI_API_KEY or API_KEY is not configured")

        self.base_url = os.getenv("AI_BASE_URL", "https://openrouter.ai/api/v1")
        configured_model = (os.getenv("AI_MODEL") or "").strip()
        # Keep model selection dynamic: OpenRouter chooses from the free models
        # currently available instead of pinning FitMaster to a model that may vanish.
        self.model = DEFAULT_MODEL
        if configured_model and configured_model != DEFAULT_MODEL:
            logger.warning(
                "Ignoring AI_MODEL=%s; FitMaster uses %s to keep generation free and dynamic",
                configured_model,
                DEFAULT_MODEL,
            )

        from openai import OpenAI

        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            max_retries=0,
        )

    def generate(self, context: dict[str, Any]) -> tuple[GeneratedWorkoutOutput, str]:
        system_prompt = """
Ты — движок адаптации FitMaster. Создай следующий шаблон тренировки пользователя по переданному профилю, текущей завершённой тренировке и истории.

Правила:
- Выбирай exercise_id ТОЛЬКО из available_exercises. Не придумывай ID и не добавляй упражнения вне каталога.
- Не повторяй exercise_id. order_index — целые числа подряд от 0.
- Названия упражнений можно взять из каталога; сервер всё равно заменит их точными названиями из базы.
- Учитывай fitness_goal, experience_level, нагрузку, динамику повторений и веса, фактическое выполнение подходов, замены, самочувствие и усталость. Не повышай нагрузку автоматически при плохом выполнении или высокой усталости.
- Сохраняй тип измерения: reps/count для повторений, weight/kg для веса, duration/min_sec для времени (строка MM:SS), distance/metr для дистанции.
- Каждый элемент target должен содержать type, metric и value. Для повторений значение должно быть целым числом больше 0; вес и дистанция могут быть 0 или больше.
- Количество упражнений: от 1 до 12. Количество подходов: от 1 до 20. Отдых rest_seconds: целое число от 0 до 900.
- Ответ — один JSON-объект, без markdown, reasoning, вступления и текста после JSON. Не добавляй поля вне описанной структуры.

Формат ответа:
{
  "name": "Название тренировки",
  "workout_plan": {
    "rest_seconds": 90,
    "exercises": [
      {
        "exercise_id": 123,
        "exercise_name": "название из каталога",
        "order_index": 0,
        "sets": 3,
        "target": [
          {"type": "reps", "metric": "count", "value": 8},
          {"type": "weight", "metric": "kg", "value": 40}
        ]
      }
    ]
  },
  "rationale": "Краткое объяснение на русском"
}
""".strip()

        user_prompt = (
            "Контекст пользователя, завершённой тренировки и истории. "
            "Используй только эти данные. Верни полный JSON-объект по схеме выше:\n"
            + json.dumps(context, ensure_ascii=False, separators=(",", ":"), default=str)
        )
        messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        # Retain some headroom for older .env values while allowing free models
        # enough time for a normal response and one repair attempt.
        try:
            configured_timeout = float(os.getenv("AI_GENERATION_TIMEOUT_SECONDS", "100"))
        except ValueError:
            configured_timeout = 100.0
        total_timeout = min(max(75.0, configured_timeout), 110.0)
        deadline = time.monotonic() + total_timeout

        last_error: Exception | None = None
        previous_raw = ""

        for attempt in range(2):
            remaining = deadline - time.monotonic()
            if remaining < 3:
                break

            attempt_messages = messages
            if attempt == 1:
                attempt_messages = [
                    *messages,
                    {
                        "role": "assistant",
                        "content": previous_raw[:5000]
                        if previous_raw
                        else "Предыдущая попытка не вернула пригодный JSON.",
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Предыдущая ошибка проверки: {last_error or 'неверный ответ'}. "
                            "Исправь ответ и верни только один полный JSON-объект. "
                            "Не добавляй комментарии, markdown или рассуждения. "
                            "Проверь обязательные поля и используй только exercise_id из каталога."
                        ),
                    },
                ]

            attempt_timeout = min(55.0, max(3.0, remaining - 1.0))
            try:
                completion = self._create_completion(
                    attempt_messages,
                    timeout_seconds=attempt_timeout,
                )
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "AI adaptation attempt %s failed to call the provider: %s",
                    attempt + 1,
                    str(exc)[:500],
                )
                continue

            choice = completion.choices[0] if completion.choices else None
            message = choice.message if choice else None
            raw = self._message_text(getattr(message, "content", None)) if message else ""
            used_model = getattr(completion, "model", None) or self.model
            finish_reason = getattr(choice, "finish_reason", "no_choices") if choice else "no_choices"

            if not raw.strip():
                usage = getattr(completion, "usage", None)
                completion_details = getattr(usage, "completion_tokens_details", None)
                last_error = RuntimeError(
                    "AI returned an empty response "
                    f"(model={used_model!r}, finish_reason={finish_reason!r})"
                )
                previous_raw = ""
                logger.warning(
                    "AI adaptation attempt %s returned no final text "
                    "(model=%s, finish_reason=%s, reasoning_present=%s, refusal_present=%s, "
                    "completion_tokens=%s, reasoning_tokens=%s)",
                    attempt + 1,
                    used_model,
                    finish_reason,
                    bool(getattr(message, "reasoning", None)) if message else False,
                    bool(getattr(message, "refusal", None)) if message else False,
                    getattr(usage, "completion_tokens", None),
                    getattr(completion_details, "reasoning_tokens", None),
                )
                continue

            previous_raw = raw
            try:
                payload = _normalize_generated_payload(_parse_json(raw))
                generated = GeneratedWorkoutOutput.model_validate(payload)
                self._validate_candidate(generated, context)
                return generated, str(used_model)
            except (RuntimeError, ValidationError, ValueError, TypeError) as exc:
                last_error = exc
                logger.warning(
                    "AI adaptation attempt %s returned invalid workout JSON "
                    "(model=%s, finish_reason=%s, chars=%s): %s",
                    attempt + 1,
                    used_model,
                    finish_reason,
                    len(raw),
                    str(exc)[:500],
                )

        raise RuntimeError(
            "AI failed to return a valid workout JSON object after 2 attempts. "
            f"Last error: {last_error or 'request time budget exhausted'}"
        ) from last_error

    @staticmethod
    def _validate_candidate(
        generated: GeneratedWorkoutOutput, context: dict[str, Any]
    ) -> None:
        """Catch model mistakes before returning, so the repair attempt can fix them."""
        available = context.get("available_exercises")
        if not isinstance(available, list) or not available:
            return

        allowed_ids = {
            int(item["id"])
            for item in available
            if isinstance(item, dict) and item.get("id") is not None
        }
        exercises = generated.workout_plan.exercises
        ids = [item.exercise_id for item in exercises]
        if any(exercise_id not in allowed_ids for exercise_id in ids):
            invalid_ids = sorted(set(ids) - allowed_ids)
            raise ValueError(
                f"exercise_id values {invalid_ids} are not in available_exercises; "
                f"choose only from IDs {sorted(allowed_ids)}"
            )
        if len(ids) != len(set(ids)):
            raise ValueError("exercise_id values must be unique")

        indexes = [item.order_index for item in exercises]
        if sorted(indexes) != list(range(len(exercises))):
            raise ValueError("order_index values must be unique and contiguous from 0")

    @staticmethod
    def _message_text(content: Any) -> str:
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: list[str] = []
            for part in content:
                if isinstance(part, dict):
                    text = part.get("text")
                else:
                    text = getattr(part, "text", None)
                if isinstance(text, str):
                    parts.append(text)
            return "".join(parts)
        return ""

    def _create_completion(
        self,
        messages: list[dict[str, str]],
        timeout_seconds: float | None = None,
    ):
        request = {
            "model": self.model,
            "max_tokens": MAX_COMPLETION_TOKENS,
            "timeout": timeout_seconds or 50.0,
            "messages": messages,
            "extra_headers": {
                "HTTP-Referer": os.getenv("AI_HTTP_REFERER", "http://localhost"),
                "X-Title": os.getenv("AI_APP_TITLE", "FitMaster Adaptation"),
            },
        }

        # JSON mode is a useful preference for OpenRouter's router. If an
        # OpenAI-compatible provider rejects it, retry the same request using
        # only the widely supported chat-completions parameters.
        try:
            return self.client.chat.completions.create(
                **request,
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            message = str(exc).lower()
            unsupported_markers = (
                "unsupported",
                "not support",
                "does not support",
                "not allowed",
                "invalid parameter",
                "unrecognized",
                "unknown parameter",
            )
            unsupported_json_mode = (
                "response_format" in message or "json_object" in message
            ) and any(marker in message for marker in unsupported_markers)
            if not unsupported_json_mode:
                raise

            logger.warning(
                "Provider does not support JSON mode; retrying with prompt-only JSON instructions"
            )
            return self.client.chat.completions.create(**request)

    def ping(self, prompt: str = "Скажи 'FitMaster AI готов к работе' одной фразой.") -> dict:
        """Explicit, low-cost test call. /health itself does not spend a model request."""
        start = time.perf_counter()
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты — AI-ассистент FitMaster. Отвечай кратко, по-русски.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=100,
                timeout=15.0,
                extra_headers={
                    "HTTP-Referer": os.getenv("AI_HTTP_REFERER", "http://localhost"),
                    "X-Title": os.getenv("AI_APP_TITLE", "FitMaster Adaptation"),
                },
            )
            choice = completion.choices[0] if completion.choices else None
            message = choice.message if choice else None
            reply = self._message_text(getattr(message, "content", None) if message else None).strip()
            if not reply:
                raise RuntimeError("The selected free model returned no text")

            return {
                "status": "ok",
                "reply": reply,
                "model": getattr(completion, "model", None) or self.model,
                "latency_ms": round((time.perf_counter() - start) * 1000),
                "tokens_used": getattr(completion.usage, "total_tokens", None),
            }
        except Exception as exc:
            return {
                "status": "error",
                "reply": None,
                "error": str(exc),
                "model": self.model,
                "latency_ms": round((time.perf_counter() - start) * 1000),
            }


def _parse_json(raw: str) -> dict[str, Any]:
    cleaned = raw.strip().lstrip("\ufeff")
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        value = json.loads(cleaned)
        if isinstance(value, dict):
            return value
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    parse_errors: list[str] = []
    for index, character in enumerate(cleaned):
        if character != "{":
            continue
        try:
            value, _ = decoder.raw_decode(cleaned, index)
        except json.JSONDecodeError as exc:
            parse_errors.append(str(exc))
            continue
        if isinstance(value, dict):
            return value

    if "{" not in cleaned:
        raise RuntimeError(
            f"AI response does not contain a JSON object (response length: {len(cleaned)} characters)"
        )
    detail = parse_errors[-1] if parse_errors else "no valid JSON object found"
    raise RuntimeError(f"AI returned invalid JSON: {detail}")


def _normalize_generated_payload(value: dict[str, Any]) -> dict[str, Any]:
    """Normalize common model variations before strict schema validation."""
    payload = value
    for wrapper in ("generated_workout", "generatedWorkout", "workout", "result", "data"):
        wrapped = payload.get(wrapper)
        if isinstance(wrapped, dict):
            payload = wrapped
            break

    name = _pick(payload, "name", "title", default="Адаптивная тренировка")
    rationale = _pick(
        payload,
        "rationale",
        "explanation",
        "reason",
        default="План сформирован на основе профиля и истории выполнения тренировок.",
    )

    plan = _pick(payload, "workout_plan", "workoutPlan", "plan", default=None)
    if not isinstance(plan, dict):
        if isinstance(payload.get("exercises"), list):
            plan = payload
        else:
            raise RuntimeError("AI JSON does not contain workout_plan/workoutPlan")

    exercises = _pick(plan, "exercises", "workout_exercises", "workoutExercises", default=None)
    if not isinstance(exercises, list):
        raise RuntimeError("AI workout plan does not contain an exercises array")

    normalized_exercises: list[dict[str, Any]] = []
    for index, item in enumerate(exercises):
        if not isinstance(item, dict):
            raise RuntimeError(f"AI exercise at index {index} is not a JSON object")

        exercise_id = _pick(item, "exercise_id", "exerciseId", "id")
        target = _pick(item, "target", "targets", "metrics", default=[])
        if isinstance(target, dict):
            target = [target]
        if not isinstance(target, list):
            target = []

        normalized_targets: list[dict[str, Any]] = []
        default_metrics = {
            "reps": "count",
            "weight": "kg",
            "duration": "min_sec",
            "distance": "metr",
        }
        for metric_item in target:
            if not isinstance(metric_item, dict):
                continue
            metric_type = _pick(metric_item, "type", "metric_type", "metricType")
            metric_name = _pick(metric_item, "metric", "unit", default=default_metrics.get(metric_type))
            metric_value = _pick(metric_item, "value", "target_value", "targetValue")
            if metric_type is None or metric_name is None or metric_value is None:
                continue
            normalized_targets.append(
                {"type": metric_type, "metric": metric_name, "value": metric_value}
            )

        normalized_exercises.append(
            {
                "exercise_id": exercise_id,
                # The TypeScript server replaces this placeholder with the DB name.
                "exercise_name": _pick(item, "exercise_name", "exerciseName", "name", default="Упражнение"),
                "order_index": _pick(item, "order_index", "orderIndex", "position", default=index),
                "sets": _pick(item, "sets", "set_count", "setCount", default=3),
                "target": normalized_targets,
            }
        )

    return {
        "name": name,
        "workout_plan": {
            "rest_seconds": _pick(plan, "rest_seconds", "restSeconds", default=90),
            "exercises": normalized_exercises,
        },
        "rationale": rationale,
    }


def _pick(source: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in source and source[key] is not None:
            return source[key]
    return default
