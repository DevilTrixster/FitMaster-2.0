import { QueryResultRow } from 'pg';
import { UserWorkoutExercise } from '../../../domain/entities/workouts/UserWorkoutExercise.js';
import { IUserWorkoutExerciseRepository } from '../../../domain/repositories/IUserWorkoutExerciseRepository.js';
import { IDatabaseExecutor } from '../types/IDatabaseExecutor.js';
import { userWorkoutExerciseFindByWorkoutId, userWorkoutExerciseFindByPlannedExercise, userWorkoutExerciseCreate, userWorkoutExerciseUpdate } from './query/UserWorkoutExerciseQuery.js';

interface UserWorkoutExerciseRow extends QueryResultRow {
    id: number;
    user_workout_id: number;
    planned_exercise_id: number;
    exercise_id: number;
    adaptation_data: UserWorkoutExercise['adaptationData'];
    created_at: Date;
    updated_at: Date;
}

export class UserWorkoutExerciseRepository implements IUserWorkoutExerciseRepository {

    constructor(
        private readonly executor: IDatabaseExecutor
    ) {}

    private mapToEntity(row:UserWorkoutExerciseRow):UserWorkoutExercise {
        return new UserWorkoutExercise({
            id: row.id,
            userWorkoutId: row.user_workout_id,
            plannedExerciseId: row.planned_exercise_id,
            exerciseId: row.exercise_id,
            adaptationData: row.adaptation_data,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async findByWorkoutId(userWorkoutId: number): Promise<UserWorkoutExercise[]> {
        const result = await this.executor.query<UserWorkoutExerciseRow>(userWorkoutExerciseFindByWorkoutId, [userWorkoutId]);
        return result.rows.map(row => this.mapToEntity(row));
    }

    async findByPlannedExercise(userWorkoutId: number, plannedExerciseId: number): Promise<UserWorkoutExercise | null> {
        const result = await this.executor.query<UserWorkoutExerciseRow>(userWorkoutExerciseFindByPlannedExercise,[userWorkoutId, plannedExerciseId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async create(userWorkoutExercise: UserWorkoutExercise): Promise<UserWorkoutExercise> {

        const result = await this.executor.query<UserWorkoutExerciseRow>(
            userWorkoutExerciseCreate,
            [
                userWorkoutExercise.userWorkoutId,
                userWorkoutExercise.plannedExerciseId,
                userWorkoutExercise.exerciseId,
                userWorkoutExercise.adaptationData,
            ]
        );

        return this.mapToEntity(result.rows[0]);
    }

    async update(userWorkoutExercise: UserWorkoutExercise): Promise<UserWorkoutExercise> {

        const result = await this.executor.query<UserWorkoutExerciseRow>(
            userWorkoutExerciseUpdate,
            [
                userWorkoutExercise.id,
                userWorkoutExercise.exerciseId,
                userWorkoutExercise.adaptationData,
            ]
        );

        return this.mapToEntity(result.rows[0]);
    }
}