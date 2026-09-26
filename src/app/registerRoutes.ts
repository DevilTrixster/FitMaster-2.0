import { Express } from 'express';

import { ITokenService } from '../application/auth/services/ITokenService.js';
import { createAuthRoutes } from '../presentation/routes/authRoutes.js';
import { createExerciseRoutes } from '../presentation/routes/exerciseRoutes.js';
import { createProfileRoutes } from '../presentation/routes/profileRoutes.js';
import { createWorkoutPatternRoutes } from '../presentation/routes/workoutPatternRoutes.js';
import { createWorkoutRoutes } from '../presentation/routes/workoutRoutes.js';

import { createControllers } from './createControllers.js';

type Controllers = ReturnType<typeof createControllers>;

interface Services {
    tokenService: ITokenService;
}

export function registerRoutes(app: Express, controllers: Controllers, services: Services) {
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'FitMaster 2.0' });
    });

    app.use('/api/auth', createAuthRoutes(controllers.authController, services.tokenService));
    app.use(
        '/api/profile',
        createProfileRoutes(controllers.profileController, services.tokenService)
    );
    app.use('/api/exercises', createExerciseRoutes(controllers.exerciseController));
    app.use(
        '/api/workout-patterns',
        createWorkoutPatternRoutes(controllers.workoutPatternController)
    );
    app.use(
        '/api/workouts',
        createWorkoutRoutes(controllers.workoutController, services.tokenService)
    );
}
