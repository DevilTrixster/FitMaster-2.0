import { ApplicationError } from '../ApplicationError.js';

export class ExerciseNotFoundError extends ApplicationError {
    constructor(exerciseId: number) {
        super(`Exercise ${exerciseId} not found`, 'EXERCISE_NOT_FOUND');
    }
}
