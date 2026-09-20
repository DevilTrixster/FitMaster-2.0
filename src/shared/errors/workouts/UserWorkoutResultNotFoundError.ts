import { ApplicationError } from '../ApplicationError.js';

export class UserWorkoutResultNotFoundError extends ApplicationError {
    constructor(workoutId: number) {
        super(`Workout result for workout ${workoutId} not found`, 'USER_WORKOUT_RESULT_NOT_FOUND');
    }
}
