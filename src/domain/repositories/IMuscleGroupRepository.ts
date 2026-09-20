import { Muscle } from '../../shared/enum.js';
import { MuscleGroup } from '../entities/exercises/MuscleGroup.js';

export interface IMuscleGroupRepository {
    findById(id: number): Promise<MuscleGroup | null>;
    findByCode(code: Muscle): Promise<MuscleGroup | null>;
    findAll(): Promise<MuscleGroup[]>;
    findRootGroups(): Promise<MuscleGroup[]>;
    findChildren(parentId: number): Promise<MuscleGroup[]>;
}
