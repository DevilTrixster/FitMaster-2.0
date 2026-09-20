import { z } from 'zod';
import { UserWorkoutStatus } from '../../../shared/enum.js';

export const updateUserWorkoutStatusRequestSchema = z.object({
    workoutId: z.number().int().positive(),
    status: z.enum(UserWorkoutStatus)
});
