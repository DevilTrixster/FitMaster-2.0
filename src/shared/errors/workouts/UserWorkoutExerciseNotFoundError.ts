import { ApplicationError } from '../ApplicationError.js';

export class UserWorkoutExerciseNotFoundError extends ApplicationError {
    constructor(workoutId: number, plannedExerciseId: number) {
        super(
            `Planned exercise ${plannedExerciseId} not found in workout ${workoutId}`,
            'USER_WORKOUT_EXERCISE_NOT_FOUND'
        );
    }
}
