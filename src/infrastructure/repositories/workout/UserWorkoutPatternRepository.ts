import { QueryResultRow } from 'pg';

import { UserWorkoutPattern } from '../../../domain/entities/workouts/UserWorkoutPattern.js';
import { IUserWorkoutPatternRepository } from '../../../domain/repositories/IUserWorkoutPatternRepository.js';
import { IDatabaseExecutor } from '../../database/IDatabaseExecutor.js';

import {
    workoutPatternFindById,
    workoutPatternFindAll,
    workoutPatternFindByType,
    workoutPatternFindByParentPatternId,
    workoutPatternCreate
} from './query/UserWorkoutPatternQuery.js';

interface UserWorkoutPatternRow extends QueryResultRow {
    id: string;
    parent_pattern_id: string | null;
    name: string;
    type: UserWorkoutPattern['type'];
    generation_source: UserWorkoutPattern['generationSource'];
    workout_plan: UserWorkoutPattern['patternData'];
    created_at: Date;
}

export class UserWorkoutPatternRepository implements IUserWorkoutPatternRepository {
    constructor(private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: UserWorkoutPatternRow): UserWorkoutPattern {
        return new UserWorkoutPattern({
            id: row.id,
            parentPatternId: row.parent_pattern_id,
            name: row.name,
            type: row.type,
            generationSource: row.generation_source,
            patternData: row.workout_plan,
            createdAt: row.created_at
        });
    }

    async findById(id: string): Promise<UserWorkoutPattern | null> {
        const result = await this.executor.query<UserWorkoutPatternRow>(
            workoutPatternFindById,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findAll(): Promise<UserWorkoutPattern[]> {
        const result = await this.executor.query<UserWorkoutPatternRow>(
            workoutPatternFindAll
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findByType(
        type: UserWorkoutPattern['type']
    ): Promise<UserWorkoutPattern[]> {
        const result = await this.executor.query<UserWorkoutPatternRow>(
            workoutPatternFindByType,
            [type]
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findByParentPatternId(
        parentPatternId: string
    ): Promise<UserWorkoutPattern[]> {
        const result = await this.executor.query<UserWorkoutPatternRow>(
            workoutPatternFindByParentPatternId,
            [parentPatternId]
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async create(
        pattern: UserWorkoutPattern
    ): Promise<UserWorkoutPattern> {
        const result = await this.executor.query<UserWorkoutPatternRow>(
            workoutPatternCreate,
            [
                pattern.parentPatternId,
                pattern.name,
                pattern.type,
                pattern.generationSource,
                pattern.patternData
            ]
        );

        return this.mapToEntity(result.rows[0]);
    }
}
