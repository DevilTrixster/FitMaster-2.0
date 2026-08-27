import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

export function createAuthRoutes(controller: AuthController): Router {

    const router = Router();

    router.post('/logout', controller.logout.bind(controller));

    return router;
}