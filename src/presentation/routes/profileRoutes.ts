import { Router } from 'express';

import { ITokenService } from '../../application/auth/services/ITokenService.js';
import { updateUserProfileRequestSchema } from '../../application/profile/Validation.js';
import { ProfileController } from '../controllers/ProfileController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export function createProfileRoutes(
    controller: ProfileController,
    tokenService: ITokenService
): Router {
    const router = Router();

    router.use(authenticate(tokenService));

    router.get('/me', asyncHandler(controller.getMe.bind(controller)));
    router.patch(
        '/me',
        validate(updateUserProfileRequestSchema),
        asyncHandler(controller.update.bind(controller))
    );
    router.delete('/me', asyncHandler(controller.remove.bind(controller)));

    return router;
}
