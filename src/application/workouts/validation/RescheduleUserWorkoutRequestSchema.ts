import { z } from 'zod';

export const rescheduleUserWorkoutRequestSchema = z.object({
    workoutId: z.number().int().positive(),
    scheduledAt: z.coerce.date()
});
