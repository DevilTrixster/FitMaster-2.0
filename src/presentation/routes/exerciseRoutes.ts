import { Router } from 'express';

import { ExerciseController } from '../controllers/ExerciseController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export function createExerciseRoutes(controller: ExerciseController): Router {
    const router = Router();

    router.get('/', asyncHandler(controller.getAllActive.bind(controller)));
    router.get('/search', asyncHandler(controller.search.bind(controller)));
    router.get('/by-name', asyncHandler(controller.getByName.bind(controller)));
    router.get('/by-ids', asyncHandler(controller.getByIds.bind(controller)));

    router.get('/muscle-groups', asyncHandler(controller.getAllMuscleGroups.bind(controller)));
    router.get(
        '/muscle-groups/root',
        asyncHandler(controller.getRootMuscleGroups.bind(controller))
    );
    router.get(
        '/muscle-groups/code/:code',
        asyncHandler(controller.getMuscleGroupByCode.bind(controller))
    );
    router.get(
        '/muscle-groups/:muscleGroupId/children',
        asyncHandler(controller.getMuscleGroupChildren.bind(controller))
    );
    router.get(
        '/muscle-groups/:muscleGroupId/exercises',
        asyncHandler(controller.getExercisesByMuscleGroup.bind(controller))
    );
    router.get(
        '/muscle-groups/:muscleGroupId',
        asyncHandler(controller.getMuscleGroupById.bind(controller))
    );

    router.get(
        '/:exerciseId/muscle-groups/primary',
        asyncHandler(controller.getPrimaryMuscleGroupByExercise.bind(controller))
    );
    router.get(
        '/:exerciseId/muscle-groups',
        asyncHandler(controller.getMuscleGroupsByExercise.bind(controller))
    );
    router.get('/:exerciseId', asyncHandler(controller.getById.bind(controller)));

    return router;
}
