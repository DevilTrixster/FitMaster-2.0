import unittest

from pydantic import ValidationError

from Schema.input import WorkoutPlanInput, WorkoutResultInput


class WorkoutValueValidationTests(unittest.TestCase):
    def test_actual_repetitions_can_be_zero(self):
        result = WorkoutResultInput.model_validate({
            "restSeconds": 90,
            "wellness": 3,
            "fatigue": 4,
            "exercises": [{
                "exerciseId": 12,
                "exerciseName": "Отжимания",
                "orderIndex": 0,
                "sets": 1,
                "actualValues": [[{
                    "type": "reps", "metric": "count", "value": 0
                }]],
            }],
        })
        self.assertEqual(result.exercises[0].actual_values[0][0].value, 0)

    def test_planned_repetitions_must_remain_positive(self):
        with self.assertRaises(ValidationError):
            WorkoutPlanInput.model_validate({
                "restSeconds": 90,
                "exercises": [{
                    "exerciseId": 12,
                    "exerciseName": "Отжимания",
                    "orderIndex": 0,
                    "sets": 1,
                    "target": [{
                        "type": "reps", "metric": "count", "value": 0
                    }],
                }],
            })


if __name__ == "__main__":
    unittest.main()
