import { QueryResultRow } from 'pg';
import { User } from '../../../domain/entities/user/User.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { UserUpdateFields } from '../../../domain/types/UserUpdateFields.js'
import { IDatabaseExecutor } from '../types/IDatabaseExecutor.js';
import { userFindById, userFindByEmail, userCreate, userDelete } from './query/UserQuery.js';

const userUpdateColumns = {
    nickname: 'nickname',
    firstName: 'first_name',
    lastName: 'last_name',
    height: 'height',
    weight: 'weight',
    avatarUrl: 'avatar_url',
    preferredWorkoutTime: 'preferred_workout_time',
    preferredDays: 'preferred_days',
    experienceLevel: 'experience_level',
    fitnessGoal: 'fitness_goal',
} as const;

interface UserRow extends QueryResultRow {
    id: number;
    nickname: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date: Date;
    gender: User['gender'];
    height: number;
    weight: string;
    avatar_url: string | null;
    preferred_workout_time: string;
    preferred_days: number[];
    experience_level: User['experienceLevel'];
    fitness_goal: User['fitnessGoal'];
    created_at: Date;
    updated_at: Date;
}

export class UserRepository implements IUserRepository {

    constructor(
        private readonly executor: IDatabaseExecutor
    ) {}

    private mapToEntity(row: UserRow): User {
        return new User({
            id: row.id,
            nickname: row.nickname,
            password: row.password,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            birthDate: row.birth_date,
            gender: row.gender,
            height: row.height,
            weight: Number(row.weight),
            avatarUrl: row.avatar_url,
            preferredWorkoutTime: row.preferred_workout_time,
            preferredDays: row.preferred_days,
            experienceLevel: row.experience_level,
            fitnessGoal: row.fitness_goal,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    async findById(id: number): Promise<User | null> {
        const result = await this.executor.query<UserRow>(userFindById, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.executor.query<UserRow>(userFindByEmail, [email]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async createUser(user: User): Promise<User> {
        const result = await this.executor.query<UserRow>(
            userCreate,
            [
                user.nickname,
                user.password,
                user.email,
                user.firstName,
                user.lastName,
                user.birthDate,
                user.gender,
                user.height,
                user.weight,
                user.avatarUrl,
                user.preferredWorkoutTime,
                user.preferredDays,
                user.experienceLevel,
                user.fitnessGoal,
            ]
        );

        return this.mapToEntity(result.rows[0]);
    }

    async updateUserFields(userId: number, fields: UserUpdateFields): Promise<User | null> {

        const entries = Object.entries(fields);

        if (entries.length === 0) {
            return this.findById(userId);
        }

        const setClauses: string[] = [];
        const values: unknown[] = [userId];

        for (const [field, value] of entries) {
            if (value === undefined) {
                continue;
            }

            const column = userUpdateColumns[
                field as keyof typeof userUpdateColumns
            ];

            if (!column) {
                continue;
            }

            values.push(value);

            setClauses.push(
                `${column} = $${values.length}`
            );
        }
        
        const query = `
            UPDATE users
            SET ${setClauses.join(', ')}
            WHERE id = $1
            RETURNING
                id,
                nickname,
                password,
                email,
                first_name,
                last_name,
                birth_date,
                gender,
                height,
                weight,
                avatar_url,
                preferred_workout_time,
                preferred_days,
                experience_level,
                fitness_goal,
                created_at,
                updated_at
        `;

        const result = await this.executor.query<UserRow>(
            query,
            values
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async delete(id: number): Promise<void> {
        await this.executor.query(
            userDelete,
            [id]
        );
    }
}