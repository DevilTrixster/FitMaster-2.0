import { QueryResultRow } from 'pg';

import { Exercise } from '../../../domain/entities/exercises/Exercise.js';
import { IExerciseRepository } from '../../../domain/repositories/IExerciseRepository.js';
import { IDatabaseExecutor } from '../../database/types/IDatabaseExecutor.js';

import {
    exerciseFindById,
    exerciseFindByName,
    exerciseFindAllActive
} from './query/ExerciseQuery.js';

interface ExerciseRow extends QueryResultRow {
    id: number;
    name: string;
    description: string | null;
    equipment_type: Exercise['equipmentType'];
    verbal_instruction: string | null;
    video: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class ExerciseRepository implements IExerciseRepository {
    constructor(private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: ExerciseRow): Exercise {
        return new Exercise({
            id: row.id,
            name: row.name,
            description: row.description,
            equipmentType: row.equipment_type,
            verbalInstruction: row.verbal_instruction,
            video: row.video,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async findById(id: number): Promise<Exercise | null> {
        const result = await this.executor.query<ExerciseRow>(
            exerciseFindById,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findByName(name: string): Promise<Exercise | null> {
        const result = await this.executor.query<ExerciseRow>(
            exerciseFindByName,
            [name]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }

    async findAllActive(): Promise<Exercise[]> {
        const result = await this.executor.query<ExerciseRow>(
            exerciseFindAllActive
        );

        return result.rows.map((row) => this.mapToEntity(row));
    }
}
