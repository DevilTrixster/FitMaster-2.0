import { ApplicationError } from '../ApplicationError.js';

export class WorkoutResultAlreadyExistsError extends ApplicationError {
    constructor(workoutId: number) {
        super(
            `Workout result for workout ${workoutId} already exists`,
            'WORKOUT_RESULT_ALREADY_EXISTS'
        );
    }
}
