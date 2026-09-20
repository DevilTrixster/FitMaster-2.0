import { QueryResultRow } from 'pg';

import { UserWorkoutResult } from '../../../domain/entities/workouts/UserWorkoutResult.js';
import { IUserWorkoutResultRepository } from '../../../domain/repositories/IUserWorkoutResultRepository.js';
import { WorkoutResult } from '../../../domain/types/workouts/WorkoutResult.js';
import { IDatabaseExecutor } from '../../database/IDatabaseExecutor.js';

import {
    userWorkoutResultCreate,
    userWorkoutResultFindByUserWorkoutId,
    userWorkoutResultFindByUserWorkoutIds,
    userWorkoutResultUpdateActualData
} from './query/UserWorkoutResultQuery.js';

interface UserWorkoutResultRow extends QueryResultRow {
    id: number;
    user_workout_id: number;
    planned_data: UserWorkoutResult['plannedData'];
    actual_data: UserWorkoutResult['actualData'];
    created_at: Date;
}

export class UserWorkoutResultRepository implements IUserWorkoutResultRepository {
    constructor(private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: UserWorkoutResultRow): UserWorkoutResult {
        return new UserWorkoutResult({
            id: row.id,
            userWorkoutId: row.user_workout_id,
            plannedData: row.planned_data,
            actualData: row.actual_data,
            createdAt: row.created_at
        });
    }

    async findByUserWorkoutId(userWorkoutId: number): Promise<UserWorkoutResult | null> {
        const result = await this.executor.query<UserWorkoutResultRow>(
            userWorkoutResultFindByUserWorkoutId,
            [userWorkoutId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findByUserWorkoutIds(userWorkoutIds: number[]): Promise<UserWorkoutResult[]> {
        if (userWorkoutIds.length === 0) {
            return [];
        }

        const result = await this.executor.query<UserWorkoutResultRow>(
            userWorkoutResultFindByUserWorkoutIds,
            [userWorkoutIds]
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async create(result: UserWorkoutResult): Promise<UserWorkoutResult> {
        const queryResult = await this.executor.query<UserWorkoutResultRow>(
            userWorkoutResultCreate,
            [result.userWorkoutId, result.plannedData, result.actualData]
        );

        return this.mapToEntity(queryResult.rows[0]);
    }

    async updateActualData(
        userWorkoutId: number,
        actualData: WorkoutResult
    ): Promise<UserWorkoutResult | null> {
        const result = await this.executor.query<UserWorkoutResultRow>(
            userWorkoutResultUpdateActualData,
            [userWorkoutId, actualData]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }
}
