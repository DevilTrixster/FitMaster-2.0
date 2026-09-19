import { QueryResultRow } from 'pg';

import { ExerciseMuscleGroup } from '../../../domain/entities/exercises/ExerciseMuscleGroup.js';
import { IExerciseMuscleGroupRepository } from '../../../domain/repositories/IExerciseMuscleGroupRepository.js';
import { IDatabaseExecutor } from '../../database/IDatabaseExecutor.js';

import {
    exerciseMuscleGroupFindByExerciseId,
    exerciseMuscleGroupFindByMuscleGroupId
} from './query/ExerciseMuscleGroupQuery.js';

interface ExerciseMuscleGroupRow extends QueryResultRow {
    id: number;
    exercise_id: number;
    muscle_group_id: number;
    load_ratio: string;
    is_primary: boolean;
    created_at: Date;
    updated_at: Date;
}

export class ExerciseMuscleGroupRepository implements IExerciseMuscleGroupRepository {
    constructor(private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: ExerciseMuscleGroupRow): ExerciseMuscleGroup {
        return new ExerciseMuscleGroup({
            id: row.id,
            exerciseId: row.exercise_id,
            muscleGroupId: row.muscle_group_id,
            loadRatio: Number(row.load_ratio),
            isPrimary: row.is_primary,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async findByExerciseId(exerciseId: number): Promise<ExerciseMuscleGroup[]> {
        const result = await this.executor.query<ExerciseMuscleGroupRow>(
            exerciseMuscleGroupFindByExerciseId,
            [exerciseId]
        );
        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findByMuscleGroupId(
        muscleGroupId: number
    ): Promise<ExerciseMuscleGroup[]> {
        const result = await this.executor.query<ExerciseMuscleGroupRow>(
            exerciseMuscleGroupFindByMuscleGroupId,
            [muscleGroupId]
        );
        return result.rows.map((row) => this.mapToEntity(row));
    }
}
