import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js'

import { registerUserRequestSchema } from '../../application/users/auth/validation/RegisterUserRequestSchema.js';
import { loginUserRequestSchema } from '../../application/users/auth/validation/LoginUserRequestSchema.js';
import { logoutUserRequestSchema } from '../../application/users/auth/validation/LogoutUserRequestSchema.js';
import { refreshTokenRequestSchema } from '../../application/users/auth/validation/RefreshTokenRequestSchema.js';

export function createAuthRoutes(controller: AuthController): Router {

    const router = Router();

    router.post('/register', validate(registerUserRequestSchema), asyncHandler(controller.register.bind(controller)));
    router.post('/login', validate(loginUserRequestSchema), asyncHandler(controller.login.bind(controller)));
    router.post('/logout', validate(logoutUserRequestSchema), asyncHandler(controller.logout.bind(controller)));
    router.post('/refresh', validate(refreshTokenRequestSchema), asyncHandler(controller.refresh.bind(controller)));
    
    router.get('/me', asyncHandler(controller.me.bind(controller)));

    return router;
}