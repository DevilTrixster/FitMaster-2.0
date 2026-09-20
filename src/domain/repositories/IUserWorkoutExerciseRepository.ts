import { UserWorkoutExercise } from '../entities/workouts/UserWorkoutExercise.js';
import { UserWorkoutExerciseAdaptation } from '../types/workouts/UserWorkoutExerciseAdaptation.js';

export interface IUserWorkoutExerciseRepository {
    findByWorkoutId(userWorkoutId: number): Promise<UserWorkoutExercise[]>;
    findByPlannedExercise(
        userWorkoutId: number,
        plannedExerciseId: number
    ): Promise<UserWorkoutExercise | null>;
    create(userWorkoutExercise: UserWorkoutExercise): Promise<UserWorkoutExercise>;
    update(
        id: number,
        exerciseId: number,
        adaptationData: UserWorkoutExerciseAdaptation | null
    ): Promise<UserWorkoutExercise | null>;
}
