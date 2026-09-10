import { UserWorkoutExerciseTarget } from '../../../../domain/types/UserWorkoutExerciseTarget.js';

export interface ExerciseAdaptationRequest {
    userId: number;
    exerciseId: number;
    sets: number;
    target: UserWorkoutExerciseTarget[];
}
