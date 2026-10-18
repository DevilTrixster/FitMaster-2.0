import unittest
from types import SimpleNamespace
from unittest.mock import Mock

from Main.llm import (
    LLMClient,
    _normalize_generated_payload,
    _parse_json,
)


VALID_RESPONSE = '''{
  "name": "Тренировка адаптации",
  "workout_plan": {
    "rest_seconds": 90,
    "exercises": [
      {
        "exercise_id": 12,
        "exercise_name": "Упражнение",
        "order_index": 0,
        "sets": 3,
        "target": [{"type": "reps", "metric": "count", "value": 8}]
      }
    ]
  },
  "rationale": "Учтены результаты предыдущей тренировки"
}'''


def completion(content: str | None, model: str = "sample/free-model"):
    return SimpleNamespace(
        choices=[SimpleNamespace(
            message=SimpleNamespace(content=content),
            finish_reason="stop",
        )],
        model=model,
    )


class ParseJsonTests(unittest.TestCase):
    def test_parses_plain_json(self):
        self.assertEqual(_parse_json('{"name":"ok"}'), {"name": "ok"})

    def test_parses_json_inside_markdown(self):
        self.assertEqual(
            _parse_json('Вот результат:\n```json\n{"name":"ok"}\n```'),
            {"name": "ok"},
        )

    def test_reports_missing_object(self):
        with self.assertRaisesRegex(RuntimeError, "does not contain a JSON object"):
            _parse_json("I cannot generate the requested object.")

    def test_normalizes_camel_case_and_extra_fields(self):
        normalized = _normalize_generated_payload({
            "title": "Адаптация",
            "workoutPlan": {
                "restSeconds": 60,
                "extraModelComment": "ignored",
                "exercises": [{
                    "exerciseId": "12",
                    "name": "Жим",
                    "sets": 3,
                    "targets": [{"type": "reps", "value": 8, "extra": True}],
                }],
            },
        })
        self.assertEqual(normalized["name"], "Адаптация")
        self.assertEqual(normalized["workout_plan"]["rest_seconds"], 60)
        self.assertEqual(normalized["workout_plan"]["exercises"][0]["order_index"], 0)
        self.assertEqual(
            normalized["workout_plan"]["exercises"][0]["target"],
            [{"type": "reps", "metric": "count", "value": 8}],
        )


class LLMRetryTests(unittest.TestCase):
    def test_retries_after_non_json_response_and_reports_actual_model(self):
        client = LLMClient.__new__(LLMClient)
        client.model = "openrouter/free"
        client._create_completion = Mock(side_effect=[
            completion("I will think about the workout now.", "model-one:free"),
            completion(VALID_RESPONSE, "model-two:free"),
        ])

        result, model = client.generate({"current_workout": {"status": "COMPLETED"}})

        self.assertEqual(result.name, "Тренировка адаптации")
        self.assertEqual(model, "model-two:free")
        self.assertEqual(client._create_completion.call_count, 2)

    def test_retries_when_model_selects_exercise_outside_catalog(self):
        client = LLMClient.__new__(LLMClient)
        client.model = "openrouter/free"
        invalid = VALID_RESPONSE.replace("\"exercise_id\": 12", "\"exercise_id\": 999")
        client._create_completion = Mock(side_effect=[
            completion(invalid, "model-one:free"),
            completion(VALID_RESPONSE, "model-two:free"),
        ])

        result, model = client.generate({
            "available_exercises": [{"id": 12, "name": "Упражнение"}],
            "current_workout": {"status": "COMPLETED"},
        })

        self.assertEqual(result.workout_plan.exercises[0].exercise_id, 12)
        self.assertEqual(model, "model-two:free")
        self.assertEqual(client._create_completion.call_count, 2)

    def test_empty_response_is_retried_and_diagnosed(self):
        client = LLMClient.__new__(LLMClient)
        client.model = "openrouter/free"
        empty = SimpleNamespace(
            choices=[SimpleNamespace(
                message=SimpleNamespace(content=None, reasoning="reasoning only", refusal=None),
                finish_reason="stop",
                native_finish_reason="stop",
            )],
            model="model-one:free",
            id="gen-test",
            usage=SimpleNamespace(
                completion_tokens=80,
                completion_tokens_details=SimpleNamespace(reasoning_tokens=80),
            ),
        )
        client._create_completion = Mock(side_effect=[empty, completion(VALID_RESPONSE)])
        result, _ = client.generate({"current_workout": {"status": "COMPLETED"}})
        self.assertEqual(result.name, "Тренировка адаптации")
        self.assertEqual(client._create_completion.call_count, 2)
        self.assertNotIn("reasoning", result.model_dump_json().lower())

    def test_falls_back_when_provider_rejects_json_mode(self):
        client = LLMClient.__new__(LLMClient)
        client.model = "openrouter/free"
        create = Mock(side_effect=[
            RuntimeError("response_format json_object is not supported by this model"),
            completion('{"ok": true}'),
        ])
        client.client = SimpleNamespace(
            chat=SimpleNamespace(completions=SimpleNamespace(create=create))
        )

        result = client._create_completion(
            [{"role": "user", "content": "JSON"}], timeout_seconds=5
        )

        self.assertEqual(result.choices[0].message.content, '{"ok": true}')
        self.assertEqual(create.call_count, 2)
        self.assertEqual(
            create.call_args_list[0].kwargs["response_format"],
            {"type": "json_object"},
        )
        self.assertNotIn("response_format", create.call_args_list[1].kwargs)
        self.assertNotIn("extra_body", create.call_args_list[0].kwargs)


if __name__ == "__main__":
    unittest.main()
