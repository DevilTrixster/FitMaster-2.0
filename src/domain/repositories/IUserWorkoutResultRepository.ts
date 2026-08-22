import { UserWorkoutResult } from '../entities/workouts/UserWorkoutResult.js';
import { WorkoutResult } from '../types/WorkoutResult.js'

export interface IUserWorkoutResultRepository {
    findByUserWorkoutId(userWorkoutId: number): Promise<UserWorkoutResult | null>;
    create(result: UserWorkoutResult): Promise<UserWorkoutResult>;
    updateActualData(userWorkoutId: number, actualData: WorkoutResult): Promise<UserWorkoutResult | null>;
}