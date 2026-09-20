import { UserWorkoutResult } from '../entities/workouts/UserWorkoutResult.js';
import { WorkoutResult } from '../types/workouts/WorkoutResult.js';

export interface IUserWorkoutResultRepository {
    findByUserWorkoutId(userWorkoutId: number): Promise<UserWorkoutResult | null>;
    findByUserWorkoutIds(userWorkoutIds: number[]): Promise<UserWorkoutResult[]>;
    create(result: UserWorkoutResult): Promise<UserWorkoutResult>;
    updateActualData(
        userWorkoutId: number,
        actualData: WorkoutResult
    ): Promise<UserWorkoutResult | null>;
}
