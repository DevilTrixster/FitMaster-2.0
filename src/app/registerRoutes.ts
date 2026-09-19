import { Express } from 'express';

import { ITokenService } from '../application/auth/services/ITokenService.js';
import { AuthController } from '../presentation/controllers/AuthController.js';
import { createAuthRoutes } from '../presentation/routes/authRoutes.js';

interface Controllers {
    authController: AuthController;
}

interface Services {
    tokenService: ITokenService;
}

export function registerRoutes(
    app: Express,
    controllers: Controllers,
    services: Services
) {
    // Тестовый
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'FitMaster 2.0' });
    });

    app.use(
        '/api/auth',
        createAuthRoutes(controllers.authController, services.tokenService)
    );
}
