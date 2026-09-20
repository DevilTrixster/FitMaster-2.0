import { WorkoutPatternType } from '../../shared/enum.js';
import { UserWorkoutPattern } from '../entities/workouts/UserWorkoutPattern.js';

export interface IUserWorkoutPatternRepository {
    findById(id: string): Promise<UserWorkoutPattern | null>;
    findAll(): Promise<UserWorkoutPattern[]>;
    findByType(type: WorkoutPatternType): Promise<UserWorkoutPattern[]>;
    findByParentPatternId(parentPatternId: string): Promise<UserWorkoutPattern[]>;
    create(pattern: UserWorkoutPattern): Promise<UserWorkoutPattern>;
}
