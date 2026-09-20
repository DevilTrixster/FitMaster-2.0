import { z } from 'zod';

export const getUserWorkoutResultRequestSchema = z.object({
    workoutId: z.number().int().positive()
});

export const getUserWorkoutResultsRequestSchema = z.object({
    workoutIds: z.array(z.number().int().positive()).min(1)
});
