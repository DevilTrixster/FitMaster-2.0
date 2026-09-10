import { z } from 'zod';

export const createUserWorkoutRequestSchema = z.object({
    userId: z.number().int().positive(),
    patternId: z.string().uuid(),
    scheduledAt: z.coerce.date()
});
