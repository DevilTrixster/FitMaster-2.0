import { WorkoutValue } from './WorkoutValue.js';

export interface WorkoutResult {
    restSeconds: number;
    wellness?: number;
    fatigue?: number;
    exercises: WorkoutExerciseResult[];
}

export interface WorkoutExerciseResult {
    exerciseId: number;
    exerciseName: string;
    orderIndex: number;
    sets: number;
    actualValues: (WorkoutValue[] | null)[];
}
