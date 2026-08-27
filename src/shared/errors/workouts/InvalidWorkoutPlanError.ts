import { ZodError } from 'zod';
import { ApplicationError } from '../ApplicationError.js';

export class InvalidWorkoutPlanError extends ApplicationError {
    constructor(
        public readonly validationError: ZodError
    ) {
        super(
            'Workout pattern contains invalid workout plan',
            'INVALID_WORKOUT_PLAN'
        );
    }
}