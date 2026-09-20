import { z } from 'zod';

import { ExperienceLevel, FitnessGoal } from '../../shared/enum.js';

import { UpdateUserProfileRequest } from './DTO.js';

export const updateUserProfileRequestSchema = z
    .object({
        nickname: z.string().trim().min(3).max(50).optional(),
        firstName: z.string().trim().min(1).max(50).optional(),
        lastName: z.string().trim().min(1).max(50).optional(),
        height: z.number().int().gt(100).lt(300).optional(),
        weight: z.number().gt(30).lt(300).optional(),
        avatarUrl: z.string().trim().max(2048).nullable().optional(),
        preferredWorkoutTime: z.iso.time({ precision: -1 }).optional(),
        preferredDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).optional(),
        experienceLevel: z.enum(ExperienceLevel).optional(),
        fitnessGoal: z.enum(FitnessGoal).optional()
    })
    .superRefine((data: UpdateUserProfileRequest, ctx: any) => {
        if (data.preferredDays && new Set(data.preferredDays).size !== data.preferredDays.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['preferredDays'],
                message: 'preferredDays must contain unique days'
            });
        }

        if (Object.keys(data).length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'At least one field must be provided'
            });
        }
    });
