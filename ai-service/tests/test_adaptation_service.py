import unittest
from datetime import datetime, timezone

from Schema.input import AdaptationGenerateRequest
from Schema.output import GeneratedWorkoutOutput
from Service.adaptation import AdaptationService


class StubLLM:
    def __init__(self):
        self.seen_context = None

    def generate(self, context):
        self.seen_context = context
        output = GeneratedWorkoutOutput.model_validate({
            "name": "Следующая тренировка",
            "workout_plan": {
                "rest_seconds": 90,
                "exercises": [{
                    "exercise_id": 12,
                    "exercise_name": "Модельное имя — позже заменит TS",
                    "order_index": 0,
                    "sets": 3,
                    "target": [{"type": "reps", "metric": "count", "value": 8}],
                }],
            },
            "rationale": "Тестовая причина",
        })
        return output, "example-free-model"


class AdaptationServiceTests(unittest.TestCase):
    def test_generation_is_stateless_and_returns_pattern_payload(self):
        profile = {
            "id": 1,
            "nickname": "tester",
            "email": "tester@example.com",
            "firstName": "Test",
            "lastName": "User",
            "birthDate": "1995-01-01",
            "gender": "male",
            "height": 180,
            "weight": 80,
            "avatarUrl": None,
            "preferredWorkoutTime": "18:00",
            "preferredDays": [1, 3, 5],
            "experienceLevel": "beginner",
            "fitnessGoal": "muscle_gain",
            "createdAt": "2026-09-01T10:00:00Z",
            "updatedAt": "2026-10-01T10:00:00Z",
        }
        event = {
            "userId": 1,
            "sourceWorkoutId": 9,
            "patternId": "00000000-0000-0000-0000-000000000001",
            "status": "COMPLETED",
            "originalScheduledAt": "2026-10-12T18:00:00Z",
            "scheduledAt": "2026-10-12T18:00:00Z",
            "startedAt": "2026-10-12T18:00:00Z",
            "completedAt": "2026-10-12T18:45:00Z",
            "plannedData": {
                "restSeconds": 90,
                "exercises": [{
                    "exerciseId": 12,
                    "exerciseName": "Отжимания",
                    "orderIndex": 0,
                    "sets": 1,
                    "target": [{"type": "reps", "metric": "count", "value": 8}],
                }],
            },
            "actualData": {
                "restSeconds": 90,
                "wellness": 3,
                "fatigue": 2,
                "exercises": [{
                    "exerciseId": 12,
                    "exerciseName": "Отжимания",
                    "orderIndex": 0,
                    "sets": 1,
                    "actualValues": [[{"type": "reps", "metric": "count", "value": 7}]],
                }],
            },
            "replacements": [],
            "exerciseCatalog": [{
                "id": 12,
                "name": "Отжимания",
                "equipmentType": "bodyweight",
                "muscleGroups": [],
            }],
        }
        request = AdaptationGenerateRequest.model_validate({
            "profile": profile,
            "workout": event,
            "history": [],
        })

        llm = StubLLM()
        response = AdaptationService(llm).generate(request)

        self.assertEqual(response.user_id, 1)
        self.assertEqual(response.model, "example-free-model")
        self.assertIsNone(response.generation_id)
        self.assertEqual(response.generated_workout.workout_plan.exercises[0].exercise_id, 12)
        self.assertIn("available_exercises", llm.seen_context)
        self.assertNotIn("exercise_catalog", llm.seen_context["current_workout"])


if __name__ == "__main__":
    unittest.main()
