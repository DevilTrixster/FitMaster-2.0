import { UserWorkoutPattern } from '../../domain/entities/workouts/UserWorkoutPattern.js';
import { WorkoutPlan } from '../../domain/types/workouts/WorkoutPlan.js';
import { WorkoutResult } from '../../domain/types/workouts/WorkoutResult.js';

export interface IAdaptationClient {
    generate(request: AdaptationGenerateClientRequest): Promise<AdaptationGenerateClientResponse>;
}

export interface AdaptationGenerateClientRequest {
    profile: AdaptationProfilePayload;
    workout: AdaptationWorkoutPayload;
    history: AdaptationWorkoutPayload[];
}

export interface AdaptationGenerateClientResponse {
    userId: number;
    model: string;
    generatedWorkout: {
        name: string;
        workoutPlan: WorkoutPlan;
        rationale: string;
    };
    indicators: Record<string, unknown>;
    generationId: number | null;
}

export interface AdaptationProfilePayload {
    id: number;
    nickname: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    height: number;
    weight: number;
    avatarUrl: string | null;
    preferredWorkoutTime: string;
    preferredDays: number[];
    experienceLevel: string;
    fitnessGoal: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdaptationWorkoutPayload {
    userId: number;
    sourceWorkoutId: number;
    patternId: string;
    status: string;
    originalScheduledAt: Date;
    scheduledAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    plannedData: WorkoutPlan;
    actualData: WorkoutResult;
    replacements: Array<{
        plannedExerciseId: number;
        exerciseId: number;
        adaptationData: unknown;
    }>;
    exerciseCatalog: Array<{
        id: number;
        name: string;
        equipmentType: string;
        muscleGroups: Array<{
            code: string;
            name: string;
            loadRatio: number;
            isPrimary: boolean;
        }>;
    }>;
}

export interface IGenerateAdaptiveWorkoutUseCase {
    execute(userId: number, workoutId: number): Promise<UserWorkoutPattern>;
}
