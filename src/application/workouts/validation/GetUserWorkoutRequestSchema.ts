import { z } from 'zod';

export const getUserWorkoutByIdRequestSchema = z.object({
    workoutId: z.number().int().positive()
});

export const getUserWorkoutsByDateRangeRequestSchema = z
    .object({
        from: z.coerce.date(),
        to: z.coerce.date()
    })
    .superRefine((data, ctx) => {
        if (data.from >= data.to) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['to'],
                message: 'Date "to" must be later than date "from"'
            });
        }
    });
