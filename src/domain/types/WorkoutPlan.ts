import { WorkoutValue } from './WorkoutValue.js'

// Интерфес json-плана
export interface WorkoutPlan {
    exercises: WorkoutExercisePlan[];
    restSeconds: number;
}

// Интерфес для упражнения
export interface WorkoutExercisePlan {
    exerciseId: number;
    exerciseName: string;
    orderIndex: number;
    sets: number;
    target: WorkoutValue[];
}