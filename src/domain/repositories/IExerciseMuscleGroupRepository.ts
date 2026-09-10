import { ExerciseMuscleGroup } from '../entities/exercises/ExerciseMuscleGroup.js';

export interface IExerciseMuscleGroupRepository {
    findByExerciseId(exerciseId: number): Promise<ExerciseMuscleGroup[]>;
    findByMuscleGroupId(muscleGroupId: number): Promise<ExerciseMuscleGroup[]>;
}
