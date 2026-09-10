import { QueryResultRow } from 'pg';

import { UserWorkout } from '../../../domain/entities/workouts/UserWorkout.js';
import { IUserWorkoutRepository } from '../../../domain/repositories/IUserWorkoutRepository.js';
import { IDatabaseExecutor } from '../../database/types/IDatabaseExecutor.js';

import {
    userWorkoutFindById,
    userWorkoutCreate,
    userWorkoutFindByIdAndUserId
} from './query/UserWorkoutQuery.js';

interface UserWorkoutRow extends QueryResultRow {
    id: number;
    user_id: number;
    pattern_id: string;
    status: UserWorkout['status'];
    workout_plan: UserWorkout['workoutPlan'];
    original_scheduled_at: Date;
    scheduled_at: Date;
    started_at: Date | null;
    completed_at: Date | null;
    created_at: Date;
}

export class UserWorkoutRepository implements IUserWorkoutRepository {
    constructor(private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: UserWorkoutRow): UserWorkout {
        return new UserWorkout({
            id: row.id,
            userId: row.user_id,
            patternId: row.pattern_id,
            status: row.status,
            workoutPlan: row.workout_plan,
            originalScheduledAt: row.original_scheduled_at,
            scheduledAt: row.scheduled_at,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            createdAt: row.created_at
        });
    }

    async findById(id: number): Promise<UserWorkout | null> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutFindById,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async create(userWorkout: UserWorkout): Promise<UserWorkout> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutCreate,
            [
                userWorkout.userId,
                userWorkout.patternId,
                userWorkout.status,
                userWorkout.workoutPlan,
                userWorkout.originalScheduledAt,
                userWorkout.scheduledAt,
                userWorkout.startedAt,
                userWorkout.completedAt
            ]
        );

        return this.mapToEntity(result.rows[0]);
    }

    async findByIdAndUserId(
        id: number,
        userId: number
    ): Promise<UserWorkout | null> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutFindByIdAndUserId,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }
}
