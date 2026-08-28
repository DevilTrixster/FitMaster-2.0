import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { ApplicationError } from '../../shared/errors/ApplicationError.js';
import { AppStatus } from '../../shared/AppStatus.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof ApplicationError) {
        const status = getStatusForApplicationError(error);

        res.status(status.statusCode).json({
            code: error.code,
            message: error.message,
        });

        return;
    }

    if (error instanceof ZodError) {
        res.status(AppStatus.UNPROCESSABLE_CONTENT.statusCode).json({
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            errors: error.issues,
        });

        return;
    }

    console.error(error);
    res
        .status(AppStatus.INTERNAL_SERVER_ERROR.statusCode)
        .json({
            code: 'INTERNAL_SERVER_ERROR',
            message: AppStatus.INTERNAL_SERVER_ERROR.message,
        });
}

function getStatusForApplicationError(error: ApplicationError) {
    switch (error.code) {
        case 'EMAIL_ALREADY_EXISTS':
        case 'NICKNAME_ALREADY_EXISTS':
            return AppStatus.CONFLICT;

        case 'INVALID_CREDENTIALS':
        case 'INVALID_ACCESS_TOKEN':
        case 'INVALID_REFRESH_TOKEN':
            return AppStatus.UNAUTHORIZED;

        case 'USER_NOT_FOUND':
            return AppStatus.NOT_FOUND;

        default:
            return AppStatus.INTERNAL_SERVER_ERROR;
    }
}