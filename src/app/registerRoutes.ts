import { Express } from 'express';
import { AuthController } from '../http/controllers/AuthController.js';
import { createAuthRoutes } from '../http/routes/authRoutes.js';
import { ITokenService } from '../application/users/auth/services/ITokenService.js';


interface Controllers {
    authController: AuthController;
}

interface Services {
    tokenService: ITokenService;
}

export function registerRoutes(app: Express, controllers: Controllers, services: Services) {
    // Тестовый
    app.get('/health', (_req, res) => {res.json({status: 'ok', service: 'FitMaster 2.0'})});

    app.use('/api/auth', createAuthRoutes(controllers.authController, services.tokenService));
}