import express from 'express';
import { createDatabase } from './createDatabase.js';
import { createServices } from './createServices.js';
import { createUseCases } from './createUseCases.js';
import { createControllers } from './createControllers.js';
import { configureMiddleware } from './configureMiddleware.js';
import { registerRoutes } from './registerRoutes.js';

export function CreateApp() {

    const database = createDatabase();
    const services = createServices();

    const useCases = createUseCases(
        database,
        services.tokenService,
    );

    const controllers = createControllers(useCases);

    const app = express();

    configureMiddleware(app);
    registerRoutes(app, controllers);

    return app;
}