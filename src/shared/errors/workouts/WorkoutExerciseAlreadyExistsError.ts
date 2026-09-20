export class WorkoutExerciseAlreadyExistsError extends Error {
    constructor(workoutId: number, exerciseId: number) {
        super(`Exercise ${exerciseId} already exists in workout ${workoutId}`);
        this.name = 'WorkoutExerciseAlreadyExistsError';
        Object.setPrototypeOf(this, WorkoutExerciseAlreadyExistsError.prototype);
    }
}
