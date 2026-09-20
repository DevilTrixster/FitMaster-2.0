import { z } from 'zod';

import { Muscle } from '../../shared/enum.js';

export const getExerciseByIdRequestSchema = z.object({
    exerciseId: z.number().int().positive()
});

export const getExercisesByIdsRequestSchema = z.object({
    exerciseIds: z.array(z.number().int().positive()).min(1)
});

export const getExerciseByNameRequestSchema = z.object({
    name: z.string().trim().min(1).max(100)
});

export const searchExercisesRequestSchema = z.object({
    search: z.string().trim().min(1).max(100)
});

export const getMuscleGroupByIdRequestSchema = z.object({
    muscleGroupId: z.number().int().positive()
});

export const getMuscleGroupByCodeRequestSchema = z.object({
    code: z.enum(Muscle)
});

export const getMuscleGroupChildrenRequestSchema = z.object({
    parentId: z.number().int().positive()
});
