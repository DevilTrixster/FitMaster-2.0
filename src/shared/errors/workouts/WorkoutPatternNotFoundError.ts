import { ApplicationError } from '../ApplicationError.js';

export class WorkoutPatternNotFoundError extends ApplicationError {
    constructor(patternId: string) {
        super(`Workout pattern ${patternId} not found`, 'WORKOUT_PATTERN_NOT_FOUND');
    }
}
