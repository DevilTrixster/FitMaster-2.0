import { QueryResultRow } from 'pg';
import { UserWorkoutResult } from '../../../domain/entities/workouts/UserWorkoutResult.js';
import { WorkoutResult } from '../../../domain/types/WorkoutResult.js';
import { IUserWorkoutResultRepository } from '../../../domain/repositories/IUserWorkoutResultRepository.js';
import { IDatabaseExecutor } from '../../database/types/IDatabaseExecutor.js';
import { userWorkoutResultCreate, userWorkoutResultFindByUserWorkoutId, userWorkoutResultUpdateActualData } from './query/UserWorkoutResultQuery.js';

interface UserWorkoutResultRow extends QueryResultRow {
    id: number;
    user_workout_id: number;
    planned_data: UserWorkoutResult['plannedData'];
    actual_data: UserWorkoutResult['actualData'];
    created_at: Date;
}

export class UserWorkoutResultRepository implements IUserWorkoutResultRepository {

    constructor(
        private readonly executor: IDatabaseExecutor
    ) {}

    private mapToEntity(row:UserWorkoutResultRow):UserWorkoutResult {
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

    async create(result: UserWorkoutResult): Promise<UserWorkoutResult> {

        const queryResult = await this.executor.query<UserWorkoutResultRow>(
            userWorkoutResultCreate,
            [
                result.userWorkoutId,
                result.plannedData,
                result.actualData,
            ]
        );

        return this.mapToEntity(queryResult.rows[0]);
    }

    async updateActualData(userWorkoutId: number, actualData: WorkoutResult): Promise<UserWorkoutResult | null> {

        const result = await this.executor.query<UserWorkoutResultRow>(
            userWorkoutResultUpdateActualData,
            [
                userWorkoutId,
                actualData,
            ]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }
}