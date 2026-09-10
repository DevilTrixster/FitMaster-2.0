import { z } from 'zod';

export const logoutUserRequestSchema = z.object({
    refreshToken: z.string().min(1)
});
