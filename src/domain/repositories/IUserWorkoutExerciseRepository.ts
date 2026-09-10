import { UserWorkoutExercise } from '../entities/workouts/UserWorkoutExercise.js';

export interface IUserWorkoutExerciseRepository {
    findByWorkoutId(userWorkoutId: number): Promise<UserWorkoutExercise[]>;
    findByPlannedExercise(
        userWorkoutId: number,
        plannedExerciseId: number
    ): Promise<UserWorkoutExercise | null>;
    create(
        userWorkoutExercise: UserWorkoutExercise
    ): Promise<UserWorkoutExercise>;
    update(
        userWorkoutExercise: UserWorkoutExercise
    ): Promise<UserWorkoutExercise>;
}
