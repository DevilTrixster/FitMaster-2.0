import { z } from 'zod';

import { MetricType, MetricValueType } from '../../../shared/enum.js';

const workoutValueSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal(MetricType.Reps),
        metric: z.literal(MetricValueType.Count),
        value: z.number().int().positive()
    }),

    z.object({
        type: z.literal(MetricType.Weight),
        metric: z.literal(MetricValueType.Kg),
        value: z.number().nonnegative()
    }),

    z.object({
        type: z.literal(MetricType.Duration),
        metric: z.literal(MetricValueType.MinSec),
        value: z.string().regex(/^\d{2}:[0-5]\d$/)
    }),

    z.object({
        type: z.literal(MetricType.Distance),
        metric: z.literal(MetricValueType.Metr),
        value: z.number().nonnegative()
    })
]);

const workoutExercisePlanSchema = z.object({
    exerciseId: z.number().int().positive(),
    exerciseName: z.string().min(1).max(100),
    orderIndex: z.number().int().nonnegative(),
    sets: z.number().int().positive(),
    target: z.array(workoutValueSchema).min(1)
});

export const workoutPlanSchema = z
    .object({
        exercises: z.array(workoutExercisePlanSchema).min(1),
        restSeconds: z.number().int().nonnegative()
    })
    .superRefine((plan, ctx) => {
        // 1. Проверка уникальности orderIndex
        const indexes = plan.exercises.map((exercise) => exercise.orderIndex);
        if (new Set(indexes).size !== indexes.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'orderIndex values must be unique',
                path: ['exercises']
            });
        }

        // 2. Проверка уникальности exerciseId
        const exerciseIds = plan.exercises.map((exercise) => exercise.exerciseId);
        if (new Set(exerciseIds).size !== exerciseIds.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'exerciseId values must be unique',
                path: ['exercises']
            });
        }
    });
