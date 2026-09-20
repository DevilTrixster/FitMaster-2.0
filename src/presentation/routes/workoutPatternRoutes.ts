import { Router } from 'express';

import { ITokenService } from '../../application/auth/services/ITokenService.js';
import { WorkoutPatternController } from '../controllers/WorkoutPatternController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function createWorkoutPatternRoutes(
    controller: WorkoutPatternController,
    tokenService: ITokenService
): Router {
    const router = Router();

    router.get('/', asyncHandler(controller.getAll.bind(controller)));
    router.get('/type/:patternType', asyncHandler(controller.getByType.bind(controller)));
    router.get('/parent/:parentPatternId', asyncHandler(controller.getByParent.bind(controller)));
    router.get('/:patternId', asyncHandler(controller.getById.bind(controller)));

    return router;
}
