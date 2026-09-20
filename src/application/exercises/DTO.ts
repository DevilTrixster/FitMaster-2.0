import { Muscle } from '../../shared/enum.js';

export type GetExerciseRequest =
    | { type: 'byId'; exerciseId: number }
    | { type: 'byIds'; exerciseIds: number[] }
    | { type: 'byName'; name: string }
    | { type: 'search'; search: string }
    | { type: 'allActive' };

export type GetExerciseMuscleGroupsRequest =
    | { type: 'byExercise'; exerciseId: number }
    | { type: 'primaryByExercise'; exerciseId: number }
    | { type: 'byMuscleGroup'; muscleGroupId: number };

export type GetMuscleGroupsRequest =
    | { type: 'byId'; muscleGroupId: number }
    | { type: 'byCode'; code: Muscle }
    | { type: 'all' }
    | { type: 'root' }
    | { type: 'children'; parentId: number };
