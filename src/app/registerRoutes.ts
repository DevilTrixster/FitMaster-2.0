import { Express } from 'express';
import { AuthController } from '../http/controllers/AuthController.js';
import { createAuthRoutes } from '../http/routes/authRoutes.js';


interface Controllers {
    authController: AuthController;
}

export function registerRoutes(app: Express, controllers: Controllers) {
    // Тестовый
    app.get('/health', (_req, res) => {res.json({status: 'ok', service: 'FitMaster 2.0'})});

    app.use('/api/auth', createAuthRoutes(controllers.authController));
}