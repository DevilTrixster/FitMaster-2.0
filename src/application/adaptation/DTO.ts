import { z } from 'zod';

import { workoutPlanSchema } from '../workouts/validation/WorkoutPlanSchema.js';

export const adaptationGenerateResponseSchema = z.object({
    userId: z.number().int().positive(),
    model: z.string().min(1),
    generatedWorkout: z.object({
        name: z.string().min(1).max(100),
        workoutPlan: workoutPlanSchema,
        rationale: z.string().min(1).max(2000)
    }),
    indicators: z.record(z.string(), z.unknown()),
    generationId: z.number().int().positive().nullable()
});
