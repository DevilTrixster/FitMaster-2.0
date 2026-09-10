import { Exercise } from '../entities/exercises/Exercise.js';

export interface IExerciseRepository {
    findById(id: number): Promise<Exercise | null>;
    findByName(name: string): Promise<Exercise | null>;
    findAllActive(): Promise<Exercise[]>;
}
