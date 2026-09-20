import { ZodError } from 'zod';

import { ApplicationError } from '../ApplicationError.js';

export class InvalidWorkoutExerciseAdaptationError extends ApplicationError {
    constructor(public readonly validationError: ZodError) {
        super(
            'Workout exercise adaptation data contains invalid data',
            'INVALID_WORKOUT_EXERCISE_ADAPTATION'
        );
    }
}
