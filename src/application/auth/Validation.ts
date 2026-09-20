import { z } from 'zod';

import { Gender, ExperienceLevel, FitnessGoal } from '../../shared/enum.js';

export const refreshTokenRequestSchema = z.object({
    refreshToken: z.string().min(1)
});

export const logoutUserRequestSchema = z.object({
    refreshToken: z.string().min(1)
});

export const loginUserRequestSchema = z.object({
    email: z.string().trim().email().max(254),

    password: z.string().min(8).max(128)
});

export const registerUserRequestSchema = z
    .object({
        nickname: z.string().trim().min(3).max(50),

        password: z.string().min(8).max(128),

        email: z.string().trim().email().max(254),

        firstName: z.string().trim().min(1).max(50),

        lastName: z.string().trim().min(1).max(50),

        birthDate: z.iso
            .date()
            .refine(
                (date) => date <= new Date().toISOString().slice(0, 10),
                'birthDate cannot be in the future'
            ),

        gender: z.enum(Gender),

        height: z.number().int().gt(100).lt(300),

        weight: z.number().gt(30).lt(300),

        preferredWorkoutTime: z.iso.time({ precision: -1 }).default('17:00'),

        preferredDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).default([1, 3, 5]),

        experienceLevel: z.enum(ExperienceLevel).default(ExperienceLevel.Beginner),

        fitnessGoal: z.enum(FitnessGoal).default(FitnessGoal.Maintenance)
    })
    .superRefine((data, ctx) => {
        if (new Set(data.preferredDays).size !== data.preferredDays.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['preferredDays'],
                message: 'preferredDays must contain unique days'
            });
        }
    });
