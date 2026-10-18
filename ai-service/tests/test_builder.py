from __future__ import annotations

import unittest

from Service.builder import build_ai_context


class BuildAIContextTests(unittest.TestCase):
    def test_prompt_context_keeps_only_candidate_exercise_metrics(self) -> None:
        profile = {
            "id": 1,
            "gender": "unspecified",
            "height": 180,
            "weight": 80,
            "experience_level": "intermediate",
            "fitness_goal": "strength",
            "preferred_workout_time": "18:00",
            "preferred_days": [1, 3, 5],
        }
        indicators = {
            "catalog": [{"id": "internal-indicator-description"}],
            "profile": {"fitness_goal": "strength"},
            "exercise_metrics": {
                "12": {"sessions": 4, "average_weight_kg": 50, "unused_large_field": "x" * 1000},
                "99": {"sessions": 20},
            },
            "muscle_group_metrics": {"chest": {"sets": 12}},
        }
        workout = {
            "source_workout_id": 7,
            "status": "COMPLETED",
            "exercise_catalog": [{"id": 12}],
            "planned_data": {"exercises": []},
        }

        context = build_ai_context(
            profile=profile,
            indicators=indicators,
            history=[workout],
            current_workout=workout,
            current_catalog=[{"id": 12, "name": "Bench press"}],
        )

        prompt_indicators = context["user"]["indicators"]
        self.assertNotIn("catalog", prompt_indicators)
        self.assertEqual(set(prompt_indicators["exercise_metrics"]), {"12"})
        self.assertNotIn("unused_large_field", prompt_indicators["exercise_metrics"]["12"])
        self.assertNotIn("exercise_catalog", context["current_workout"])
        self.assertEqual(context["available_exercises"][0]["id"], 12)


if __name__ == "__main__":
    unittest.main()
