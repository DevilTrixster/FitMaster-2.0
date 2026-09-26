import { UserWorkoutExerciseAdaptation } from '../../domain/types/workouts/UserWorkoutExerciseAdaptation.js';
import { WorkoutPlan } from '../../domain/types/workouts/WorkoutPlan.js';
import { WorkoutResult } from '../../domain/types/workouts/WorkoutResult.js';
import {
    Muscle,
    UserWorkoutStatus,
    WorkoutPatternGeneration,
    WorkoutPatternType
} from '../../shared/enum.js';

export interface CreateUserWorkoutRequest {
    patternId: string;
    scheduledAt: Date;
}

export type GetUserWorkoutRequest =
    | { type: 'byId'; workoutId: number }
    | { type: 'byDateRange'; from: Date; to: Date }
    | { type: 'completedByDateRange'; from: Date; to: Date }
    | { type: 'latest' };

export interface UpdateUserWorkoutStatusRequest {
    workoutId: number;
    status: UserWorkoutStatus;
}

export type GetUserWorkoutExerciseRequest =
    | { type: 'byWorkout'; workoutId: number }
    | { type: 'byPlannedExercise'; workoutId: number; plannedExerciseId: number };

export interface UpdateUserWorkoutExerciseRequest {
    workoutId: number;
    plannedExerciseId: number;
    exerciseId: number;
    adaptationData: UserWorkoutExerciseAdaptation | null;
}

export type GetUserWorkoutResultRequest =
    { type: 'byWorkout'; workoutId: number } | { type: 'byWorkouts'; workoutIds: number[] };

export type GetWorkoutPatternsRequest =
    | { type: 'byId'; patternId: string }
    | { type: 'all' }
    | { type: 'byType'; patternType: WorkoutPatternType }
    | { type: 'byParent'; parentPatternId: string };

export interface CreateWorkoutPatternRequest {
    parentPatternId?: string | null;
    name: string;
    type: WorkoutPatternType;
    generationSource: WorkoutPatternGeneration;
    patternData: WorkoutPlan;
}
