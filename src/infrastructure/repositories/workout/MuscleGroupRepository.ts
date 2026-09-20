import { QueryResultRow } from 'pg';

import { Muscle } from '../../../shared/enum.js';
import { MuscleGroup } from '../../../domain/entities/exercises/MuscleGroup.js';
import { IMuscleGroupRepository } from '../../../domain/repositories/IMuscleGroupRepository.js';
import { IDatabaseExecutor } from '../../database/IDatabaseExecutor.js';

import {
    muscleGroupFindById,
    muscleGroupFindByCode,
    muscleGroupFindAll,
    muscleGroupFindRootGroups,
    muscleGroupFindChildren
} from './query/MuscleGroupQuery.js';

interface MuscleGroupRow extends QueryResultRow {
    id: number;
    code: Muscle;
    name: string;
    parent_id: number | null;
    created_at: Date;
}

export class MuscleGroupRepository implements IMuscleGroupRepository {
    constructor(private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: MuscleGroupRow): MuscleGroup {
        return new MuscleGroup({
            id: row.id,
            code: row.code,
            name: row.name,
            parentId: row.parent_id,
            createdAt: row.created_at
        });
    }

    async findById(id: number): Promise<MuscleGroup | null> {
        const result = await this.executor.query<MuscleGroupRow>(
            muscleGroupFindById,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findByCode(code: Muscle): Promise<MuscleGroup | null> {
        const result = await this.executor.query<MuscleGroupRow>(
            muscleGroupFindByCode,
            [code]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findAll(): Promise<MuscleGroup[]> {
        const result = await this.executor.query<MuscleGroupRow>(
            muscleGroupFindAll
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findRootGroups(): Promise<MuscleGroup[]> {
        const result = await this.executor.query<MuscleGroupRow>(
            muscleGroupFindRootGroups
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }

    async findChildren(parentId: number): Promise<MuscleGroup[]> {
        const result = await this.executor.query<MuscleGroupRow>(
            muscleGroupFindChildren,
            [parentId]
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }
}
