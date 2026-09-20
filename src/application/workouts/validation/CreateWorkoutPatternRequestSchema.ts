import { z } from 'zod';

import { WorkoutPatternGeneration, WorkoutPatternType } from '../../../shared/enum.js';

import { workoutPlanSchema } from './WorkoutPlanSchema.js';

export const createWorkoutPatternRequestSchema = z.object({
    parentPatternId: z.string().uuid().nullable().optional(),
    name: z.string().trim().min(1).max(100),
    type: z.enum(WorkoutPatternType),
    generationSource: z.enum(WorkoutPatternGeneration),
    patternData: workoutPlanSchema
});
