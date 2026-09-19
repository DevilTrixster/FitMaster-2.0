import express from 'express';

import { errorHandler } from '../presentation/middleware/errorHandler.js';

import { configureMiddleware } from './configureMiddleware.js';
import { createControllers } from './createControllers.js';
import { createDatabase } from './createDatabase.js';
import { createServices } from './createServices.js';
import { createUseCases } from './createUseCases.js';
import { registerRoutes } from './registerRoutes.js';

export function createApp() {
    const database = createDatabase();
    const services = createServices();

    const useCases = createUseCases(
        database,
        services.passwordHasher,
        services.tokenService
    );

    const controllers = createControllers(useCases);

    const app = express();

    configureMiddleware(app);
    registerRoutes(app, controllers, services);
    app.use(errorHandler);

    return app;
}
