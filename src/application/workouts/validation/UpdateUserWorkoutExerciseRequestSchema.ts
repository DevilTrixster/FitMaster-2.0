import { z } from 'zod';

import { MetricType } from '../../../shared/enum.js';

const adaptationTargetSchema = z.discriminatedUnion('metric', [
    z.object({ metric: z.literal(MetricType.Reps), value: z.number().int().positive() }),
    z.object({ metric: z.literal(MetricType.Weight), value: z.number().nonnegative() }),
    z.object({
        metric: z.literal(MetricType.Duration),
        value: z.string().regex(/^\d{2}:[0-5]\d$/)
    }),
    z.object({ metric: z.literal(MetricType.Distance), value: z.number().nonnegative() })
]);

const adaptationSchema = z.object({
    sets: z.number().int().positive(),
    target: z.array(adaptationTargetSchema).min(1)
});

export const updateUserWorkoutExerciseRequestSchema = z.object({
    workoutId: z.number().int().positive(),
    plannedExerciseId: z.number().int().positive(),
    exerciseId: z.number().int().positive(),
    adaptationData: adaptationSchema.nullable()
});
