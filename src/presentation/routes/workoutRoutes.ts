import { Router } from 'express';

import { ITokenService } from '../../application/auth/services/ITokenService.js';
import { WorkoutController } from '../controllers/WorkoutController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';

export function createWorkoutRoutes(
    controller: WorkoutController,
    tokenService: ITokenService
): Router {
    const router = Router();

    router.use(authenticate(tokenService));

    router.get('/latest', asyncHandler(controller.getLatest.bind(controller)));
    router.get('/results', asyncHandler(controller.getResults.bind(controller)));
    router.get('/history', asyncHandler(controller.getHistoryByDateRange.bind(controller)));
    router.get('/', asyncHandler(controller.getByDateRange.bind(controller)));
    router.post('/', asyncHandler(controller.create.bind(controller)));

    router.post('/defaults', asyncHandler(controller.initializeDefaults.bind(controller)));

    router.get(
        '/:workoutId/exercises/:plannedExerciseId',
        asyncHandler(controller.getExercise.bind(controller))
    );
    router.patch(
        '/:workoutId/exercises/:plannedExerciseId',
        asyncHandler(controller.updateExercise.bind(controller))
    );
    router.get('/:workoutId/exercises', asyncHandler(controller.getExercises.bind(controller)));

    router.get('/:workoutId/result', asyncHandler(controller.getResult.bind(controller)));
    router.post('/:workoutId/result', asyncHandler(controller.createResult.bind(controller)));
    router.patch('/:workoutId/result', asyncHandler(controller.updateResult.bind(controller)));

    router.patch('/:workoutId/status', asyncHandler(controller.updateStatus.bind(controller)));
    router.patch('/:workoutId/schedule', asyncHandler(controller.reschedule.bind(controller)));

    router.get('/:workoutId', asyncHandler(controller.getById.bind(controller)));

    return router;
}
