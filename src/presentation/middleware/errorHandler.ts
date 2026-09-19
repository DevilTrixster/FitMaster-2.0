import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { ApplicationError } from '../../shared/errors/ApplicationError.js';

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (error instanceof ApplicationError) {
        const status = getHttpStatus(error);

        res.status(status).json({
            code: error.code,
            message: error.message
        });

        return;
    }

    if (error instanceof ZodError) {
        res.status(422).json({
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            errors: error.issues
        });

        return;
    }

    console.error(error);

    res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
    });
}

function getHttpStatus(error: ApplicationError): number {
    switch (error.code) {
        case 'EMAIL_ALREADY_EXISTS':
        case 'NICKNAME_ALREADY_EXISTS':
            return 409;

        case 'INVALID_CREDENTIALS':
        case 'INVALID_ACCESS_TOKEN':
        case 'INVALID_REFRESH_TOKEN':
            return 401;

        case 'USER_NOT_FOUND':
            return 404;

        default:
            return 500;
    }
}
