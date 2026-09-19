import { z } from 'zod';

export const createUserWorkoutRequestSchema = z.object({
    patternId: z.string().uuid(),
    scheduledAt: z.coerce.date()
});
