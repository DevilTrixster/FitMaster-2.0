import { Router } from 'express';

import { ITokenService } from '../../application/auth/services/ITokenService.js';
import { loginUserRequestSchema } from '../../application/auth/validation/LoginUserRequestSchema.js';
import { logoutUserRequestSchema } from '../../application/auth/validation/LogoutUserRequestSchema.js';
import { refreshTokenRequestSchema } from '../../application/auth/validation/RefreshTokenRequestSchema.js';
import { registerUserRequestSchema } from '../../application/auth/validation/RegisterUserRequestSchema.js';
import { AuthController } from '../controllers/AuthController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export function createAuthRoutes(
    controller: AuthController,
    tokenService: ITokenService
): Router {
    const router = Router();

    router.post(
        '/register',
        validate(registerUserRequestSchema),
        asyncHandler(controller.register.bind(controller))
    );
    router.post(
        '/login',
        validate(loginUserRequestSchema),
        asyncHandler(controller.login.bind(controller))
    );
    router.post(
        '/logout',
        validate(logoutUserRequestSchema),
        asyncHandler(controller.logout.bind(controller))
    );
    router.post(
        '/refresh',
        validate(refreshTokenRequestSchema),
        asyncHandler(controller.refresh.bind(controller))
    );

    router.get(
        '/me',
        authenticate(tokenService),
        asyncHandler(controller.me.bind(controller))
    );

    return router;
}
