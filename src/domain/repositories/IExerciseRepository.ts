import { Exercise } from '../entities/exercises/Exercise.js';

export interface IExerciseRepository {
    findById(id: number): Promise<Exercise | null>;
    findByIds(ids: number[]): Promise<Exercise[]>;
    findByName(name: string): Promise<Exercise | null>;
    searchActiveByName(search: string): Promise<Exercise[]>;
    findAllActive(): Promise<Exercise[]>;
}
