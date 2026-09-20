import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import {
    ApplicationError,
    ValidationError,
    WorkoutResultMismatchError,
    EmailAlreadyExistsError,
    NicknameAlreadyExistsError,
    WorkoutResultAlreadyExistsError,
    WorkoutExerciseAlreadyExistsError
} from '../../shared/errors/index.js';
import { ClientErrorStatuses, ServerErrorStatuses } from '../../shared/statuses/index.js';

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const normalizedError = error instanceof ZodError ? new ValidationError(error) : error;

    if (normalizedError instanceof ApplicationError) {
        const validationError = getValidationError(normalizedError);
        const status = getHttpStatus(normalizedError);

        const response: {
            code: string;
            message: string;
            errors?: ZodError['issues'];
        } = {
            code: normalizedError.code,
            message: normalizedError.message
        };

        if (validationError) {
            response.errors = validationError.issues;
        }

        res.status(status).json(response);
        return;
    }

    if (
        error instanceof EmailAlreadyExistsError ||
        error instanceof NicknameAlreadyExistsError ||
        error instanceof WorkoutResultAlreadyExistsError ||
        error instanceof WorkoutExerciseAlreadyExistsError
    ) {
        res.status(409).json({
            error: error.name,
            message: error.message
        });
        return;
    }

    console.error(normalizedError);

    res.status(ServerErrorStatuses.INTERNAL_SERVER_ERROR.statusCode).json({
        code: ServerErrorStatuses.INTERNAL_SERVER_ERROR.synonym,
        message: ServerErrorStatuses.INTERNAL_SERVER_ERROR.message
    });
}

function getHttpStatus(error: ApplicationError): number {
    switch (error.code) {
        case 'EMAIL_ALREADY_EXISTS':
        case 'NICKNAME_ALREADY_EXISTS':
        case 'WORKOUT_RESULT_ALREADY_EXISTS':
        case 'INVALID_WORKOUT_RESCHEDULE':
        case 'INVALID_WORKOUT_STATUS_TRANSITION':
        case 'EXERCISE_INACTIVE':
            return ClientErrorStatuses.CONFLICT.statusCode;

        case 'INVALID_CREDENTIALS':
        case 'INVALID_ACCESS_TOKEN':
        case 'INVALID_REFRESH_TOKEN':
            return ClientErrorStatuses.UNAUTHORIZED.statusCode;

        case 'USER_NOT_FOUND':
        case 'EXERCISE_NOT_FOUND':
        case 'MUSCLE_GROUP_NOT_FOUND':
        case 'WORKOUT_PATTERN_NOT_FOUND':
        case 'USER_WORKOUT_NOT_FOUND':
        case 'USER_WORKOUT_EXERCISE_NOT_FOUND':
        case 'USER_WORKOUT_RESULT_NOT_FOUND':
            return ClientErrorStatuses.NOT_FOUND.statusCode;

        case 'VALIDATION_ERROR':
        case 'INVALID_WORKOUT_EXERCISE_ADAPTATION':
        case 'INVALID_WORKOUT_PLAN':
        case 'INVALID_WORKOUT_RESULT':
        case 'WORKOUT_RESULT_MISMATCH':
            return ClientErrorStatuses.UNPROCESSABLE_ENTITY.statusCode;

        default:
            return ServerErrorStatuses.INTERNAL_SERVER_ERROR.statusCode;
    }
}

function getValidationError(error: ApplicationError): ZodError | null {
    const candidate = (error as ApplicationError & { validationError?: unknown }).validationError;
    return candidate instanceof ZodError ? candidate : null;
}
