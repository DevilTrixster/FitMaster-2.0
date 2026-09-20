import { ExerciseMuscleGroup } from '../entities/exercises/ExerciseMuscleGroup.js';

export interface IExerciseMuscleGroupRepository {
    findByExerciseId(exerciseId: number): Promise<ExerciseMuscleGroup[]>;
    findPrimaryByExerciseId(exerciseId: number): Promise<ExerciseMuscleGroup | null>;
    findByMuscleGroupId(muscleGroupId: number): Promise<ExerciseMuscleGroup[]>;
}
