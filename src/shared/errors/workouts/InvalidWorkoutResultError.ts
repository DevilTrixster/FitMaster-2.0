import { ZodError } from 'zod';

import { ApplicationError } from '../ApplicationError.js';

export class InvalidWorkoutResultError extends ApplicationError {
    constructor(public readonly validationError: ZodError) {
        super('Workout result contains invalid data', 'INVALID_WORKOUT_RESULT');
    }
}
