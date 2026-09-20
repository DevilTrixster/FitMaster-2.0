import { QueryResultRow } from 'pg';

import { UserWorkout } from '../../../domain/entities/workouts/UserWorkout.js';
import { IUserWorkoutRepository } from '../../../domain/repositories/IUserWorkoutRepository.js';
import { UserWorkoutStatus } from '../../../shared/enum.js';
import { IDatabaseExecutor } from '../../database/IDatabaseExecutor.js';

import {
    userWorkoutFindById,
    userWorkoutCreate,
    userWorkoutFindByIdAndUserId,
    userWorkoutFindByUserIdAndDateRange,
    userWorkoutFindLatestByUserId,
    userWorkoutUpdateStatus,
    userWorkoutReschedule
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

    async findByUserIdAndDateRange(
        userId: number,
        from: Date,
        to: Date
    ): Promise<UserWorkout[]> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutFindByUserIdAndDateRange,
            [userId, from, to]
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findLatestByUserId(userId: number): Promise<UserWorkout | null> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutFindLatestByUserId,
            [userId]
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

    async updateStatus(
        id: number,
        userId: number,
        status: UserWorkoutStatus,
        startedAt: Date | null,
        completedAt: Date | null
    ): Promise<UserWorkout | null> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutUpdateStatus,
            [id, userId, status, startedAt, completedAt]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async reschedule(
        id: number,
        userId: number,
        scheduledAt: Date
    ): Promise<UserWorkout | null> {
        const result = await this.executor.query<UserWorkoutRow>(
            userWorkoutReschedule,
            [id, userId, scheduledAt]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }
}
