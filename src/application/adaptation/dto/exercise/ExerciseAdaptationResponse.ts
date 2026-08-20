import { UserWorkoutExerciseTarget } from '../../../../domain/types/UserWorkoutExerciseTarget.js'

export interface ExerciseAdaptationResponse {
    exerciseId: number;
    exerciseName: string;
    sets: number;
    target: UserWorkoutExerciseTarget[];
}