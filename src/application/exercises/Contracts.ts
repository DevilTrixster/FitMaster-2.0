import { Exercise } from '../../domain/entities/exercises/Exercise.js';
import { ExerciseMuscleGroup } from '../../domain/entities/exercises/ExerciseMuscleGroup.js';
import { MuscleGroup } from '../../domain/entities/exercises/MuscleGroup.js';

import {
    GetExerciseRequest,
    GetExerciseMuscleGroupsRequest,
    GetMuscleGroupsRequest
} from './DTO.js';

export interface IGetExerciseUseCase {
    execute(request: GetExerciseRequest): Promise<Exercise | Exercise[] | null>;
}

export interface IGetExerciseMuscleGroupsUseCase {
    execute(
        request: GetExerciseMuscleGroupsRequest
    ): Promise<ExerciseMuscleGroup | ExerciseMuscleGroup[] | null>;
}

export interface IGetMuscleGroupsUseCase {
    execute(request: GetMuscleGroupsRequest): Promise<MuscleGroup | MuscleGroup[] | null>;
}
