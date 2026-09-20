import { ApplicationError } from '../ApplicationError.js';

export class ExerciseNotFoundError extends ApplicationError {
    constructor(identifier: number | string) {
        const message =
            typeof identifier === 'number'
                ? `Exercise ${identifier} not found`
                : `Exercise with name "${identifier}" not found`;

        super(message, 'EXERCISE_NOT_FOUND');
    }
}
