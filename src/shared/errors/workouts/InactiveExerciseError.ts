import { ApplicationError } from '../ApplicationError.js';

export class InactiveExerciseError extends ApplicationError {
    constructor(exerciseId: number) {
        super(
            `Exercise ${exerciseId} is inactive`,
            'EXERCISE_INACTIVE'
        );
    }
}