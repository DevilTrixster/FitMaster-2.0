import express from 'express';
import { createDatabase } from './createDatabase.js';
import { createServices } from './createServices.js';
import { createUseCases } from './createUseCases.js';
import { createControllers } from './createControllers.js';
import { configureMiddleware } from './configureMiddleware.js';
import { registerRoutes } from './registerRoutes.js';
import { errorHandler } from '../http/middleware/errorHandler.js'

export function createApp() {

    const database = createDatabase();
    const services = createServices();

    const useCases = createUseCases(
        database,
        services.passwordHasher,
        services.tokenService,
    );

    const controllers = createControllers(useCases);

    const app = express();

    configureMiddleware(app);
    registerRoutes(app, controllers);
    app.use(errorHandler);

    return app;
}