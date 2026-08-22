import { MuscleGroup } from '../entities/exercises/MuscleGroup.js';

export interface IMuscleGroupRepository {

    findById(id: number): Promise<MuscleGroup | null>;

}