import { ApplicationError } from '../ApplicationError.js';

export class UserWorkoutNotFoundError extends ApplicationError {
    constructor(workoutId: number) {
        super(`Workout ${workoutId} not found`, 'USER_WORKOUT_NOT_FOUND');
    }
}
