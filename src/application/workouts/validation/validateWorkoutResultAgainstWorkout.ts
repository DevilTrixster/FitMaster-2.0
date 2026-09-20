import { Exercise } from '../../../domain/entities/exercises/Exercise.js';
import { UserWorkoutExercise } from '../../../domain/entities/workouts/UserWorkoutExercise.js';
import { WorkoutPlan } from '../../../domain/types/workouts/WorkoutPlan.js';
import { WorkoutResult } from '../../../domain/types/workouts/WorkoutResult.js';
import { WorkoutResultMismatchError } from '../../../shared/errors/index.js';

export interface EffectiveExercise {
    orderIndex: number;
    exerciseId: number;
    sets: number;
}

export function buildEffectivePlan(
    workoutPlan: WorkoutPlan,
    workoutExercises: UserWorkoutExercise[]
): EffectiveExercise[] {
    const replacementsMap = new Map<number, UserWorkoutExercise>();

    for (const workoutExercise of workoutExercises) {
        replacementsMap.set(workoutExercise.plannedExerciseId, workoutExercise);
    }

    return workoutPlan.exercises.map((planExercise) => {
        const replacement = replacementsMap.get(planExercise.exerciseId);

        return {
            orderIndex: planExercise.orderIndex,
            exerciseId: replacement ? replacement.exerciseId : planExercise.exerciseId,
            sets: replacement?.adaptationData?.sets ?? planExercise.sets
        };
    });
}

export function validateAndNormalizeWorkoutResult(
    actualData: WorkoutResult,
    workoutPlan: WorkoutPlan,
    workoutExercises: UserWorkoutExercise[],
    exercises: Exercise[]
): WorkoutResult {
    const effectivePlan = buildEffectivePlan(workoutPlan, workoutExercises);

    // 1. Проверяем restSeconds
    if (actualData.restSeconds !== workoutPlan.restSeconds) {
        throw new WorkoutResultMismatchError(
            `restSeconds mismatch: expected ${workoutPlan.restSeconds}, got ${actualData.restSeconds}`
        );
    }

    // 2. Проверяем количество упражнений
    if (actualData.exercises.length !== effectivePlan.length) {
        throw new WorkoutResultMismatchError(
            `Expected ${effectivePlan.length} exercises, got ${actualData.exercises.length}`
        );
    }

    const exercisesMap = new Map(exercises.map((exercise) => [exercise.id!, exercise]));

    const actualByOrder = new Map(
        actualData.exercises.map((exercise) => [exercise.orderIndex, exercise])
    );

    // 3. Проверяем каждую позицию workout
    for (const plan of effectivePlan) {
        const actual = actualByOrder.get(plan.orderIndex);

        if (!actual) {
            throw new WorkoutResultMismatchError(
                `Missing exercise with orderIndex ${plan.orderIndex}`
            );
        }

        if (actual.exerciseId !== plan.exerciseId) {
            throw new WorkoutResultMismatchError(
                `ExerciseId mismatch for orderIndex ${plan.orderIndex}: expected ${plan.exerciseId}, got ${actual.exerciseId}`
            );
        }

        if (actual.sets !== plan.sets) {
            throw new WorkoutResultMismatchError(
                `Sets mismatch for orderIndex ${plan.orderIndex}: expected ${plan.sets}, got ${actual.sets}`
            );
        }

        const realExercise = exercisesMap.get(plan.exerciseId);

        if (!realExercise) {
            throw new WorkoutResultMismatchError(`Exercise ${plan.exerciseId} not found in DB`);
        }

        // exerciseName клиенту не доверяем
        actual.exerciseName = realExercise.name;
    }

    return actualData;
}
