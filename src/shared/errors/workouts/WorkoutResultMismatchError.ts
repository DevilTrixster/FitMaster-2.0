import { ApplicationError } from '../ApplicationError.js';

export class WorkoutResultMismatchError extends ApplicationError {
    constructor(message: string) {
        super(message, 'WORKOUT_RESULT_MISMATCH');
    }
}
