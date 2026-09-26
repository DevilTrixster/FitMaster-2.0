import { z } from 'zod';

import { MetricType, MetricValueType } from '../../../shared/enum.js';

const workoutValueSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal(MetricType.Reps),
        metric: z.literal(MetricValueType.Count),
        value: z.number().int().nonnegative()
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

const actualSetSchema = z
    .union([
        workoutValueSchema,
        z.array(workoutValueSchema).min(1),
        z.null()
    ])
    .transform((value) => {
        if (value === null) return null;
        return Array.isArray(value) ? value : [value];
    });

const actualExerciseSchema = z.object({
    exerciseId: z.number().int().positive(),
    exerciseName: z.string().min(1).max(100),
    orderIndex: z.number().int().nonnegative(),
    sets: z.number().int().positive(),
    actualValues: z.array(actualSetSchema)
});

export const workoutResultSchema = z
    .object({
        restSeconds: z.number().int().nonnegative(),
        wellness: z.number().int().min(1).max(5).optional(),
        fatigue: z.number().int().min(1).max(5).optional(),
        exercises: z.array(actualExerciseSchema).min(1)
    })
    .superRefine((result, ctx) => {
        // 1. Проверка уникальности orderIndex
        const indexes = result.exercises.map((exercise) => exercise.orderIndex);
        if (new Set(indexes).size !== indexes.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'orderIndex values must be unique',
                path: ['exercises']
            });
        }

        // 2. Проверка соответствия количества фактических подходов заявленным
        result.exercises.forEach((exercise, index) => {
            if (exercise.actualValues.length !== exercise.sets) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'actualValues length must equal sets',
                    path: ['exercises', index, 'actualValues']
                });
            }
        });
    });
