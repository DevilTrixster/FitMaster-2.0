import { z } from 'zod';

import { WorkoutPatternType } from '../../../shared/enum.js';

export const getWorkoutPatternByIdRequestSchema = z.object({
    patternId: z.string().uuid()
});

export const getWorkoutPatternsByTypeRequestSchema = z.object({
    patternType: z.enum(WorkoutPatternType)
});

export const getWorkoutPatternChildrenRequestSchema = z.object({
    parentPatternId: z.string().uuid()
});
