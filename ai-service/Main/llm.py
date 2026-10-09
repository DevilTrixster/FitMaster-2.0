from __future__ import annotations

import json
import os
import re
import time

from Schema.output import GeneratedWorkoutOutput


class LLMClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("API_KEY")
        if not self.api_key:
            raise RuntimeError("AI_API_KEY or API_KEY is not configured")

        self.base_url = os.getenv(
            "AI_BASE_URL",
            "https://openrouter.ai/api/v1",
        )
        self.model = os.getenv(
            "AI_MODEL",
            "qwen/qwen3.8-27b:free",
        )

        from openai import OpenAI

        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
        )

    def generate(self, context: dict) -> GeneratedWorkoutOutput:
        system_prompt = """
Ты — движок адаптации FitMaster.

Твоя задача — создавать следующий шаблон тренировки конкретного пользователя.
Используй только данные из переданного контекста.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Никогда не придумывай exerciseId. Выбирай только id из available_exercises.
2. Не придумывай названия упражнений: после генерации сервер сам заменит их на названия каталога.
3. Не добавляй упражнения, которых нет в available_exercises.
4. Не повторяй exerciseId в одной тренировке.
5. orderIndex начинается с 0 и идёт без пропусков.
6. Учитывай fitness_goal, experience_level, текущие показатели профиля и историю выполнения.
7. Учитывай текущие нагрузки и прогресс по упражнениям. Не повышай нагрузку только потому, что "так принято":
   изменение веса/повторов должно опираться на историю пользователя.
8. Учитывай wellness/fatigue, если эти поля есть.
9. Учитывай замены упражнений и не возвращай упражнение, которое пользователь заменил в последней тренировке, без причины.
10. Генерируй только JSON-объект указанного формата. Никакого markdown и пояснений вокруг JSON.

Формат:
{
  "name": "строка",
  "workout_plan": {
    "rest_seconds": 90,
    "exercises": [
      {
        "exercise_id": 123,
        "exercise_name": "будет заменено сервером",
        "order_index": 0,
        "sets": 3,
        "target": [
          {"type": "reps", "metric": "count", "value": 8},
          {"type": "weight", "metric": "kg", "value": 40}
        ]
      }
    ]
  },
  "rationale": "краткое объяснение на русском"
}
""".strip()

        user_prompt = "Контекст пользователя и тренировочной истории:\n" + json.dumps(
            context, ensure_ascii=False, indent=2, default=str
        )

        completion = self.client.chat.completions.create(
            model=self.model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            extra_headers={
                "HTTP-Referer": os.getenv("AI_HTTP_REFERER", "http://localhost"),
                "X-Title": os.getenv("AI_APP_TITLE", "FitMaster Adaptation"),
            },
        )

        raw = completion.choices[0].message.content
        if not raw:
            raise RuntimeError("AI returned an empty response")

        return GeneratedWorkoutOutput.model_validate(_parse_json(raw))

    def ping(self, prompt: str = "Скажи 'FitMaster AI готов к работе' одной фразой.") -> dict:
        """Делает лёгкий тестовый запрос к нейросети для проверки работоспособности."""
        start = time.perf_counter()
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                temperature=0.3,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты — AI-ассистент FitMaster. Отвечай кратко, по-русски.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=150,
                timeout=15.0,
            )
            latency_ms = round((time.perf_counter() - start) * 1000)
            raw = completion.choices[0].message.content or ""
            return {
                "status": "ok",
                "reply": raw.strip(),
                "model": self.model,
                "latency_ms": latency_ms,
                "tokens_used": getattr(completion.usage, "total_tokens", None),
            }
        except Exception as exc:
            latency_ms = round((time.perf_counter() - start) * 1000)
            return {
                "status": "error",
                "reply": None,
                "error": str(exc),
                "latency_ms": latency_ms,
            }


def _parse_json(raw: str) -> dict:
    cleaned = raw.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise RuntimeError("AI response does not contain a JSON object")

    try:
        value = json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"AI returned invalid JSON: {exc}") from exc

    if not isinstance(value, dict):
        raise RuntimeError("AI response root must be a JSON object")

    return value
