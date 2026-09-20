import { UserWorkoutStatus } from '../../shared/enum.js';
import { UserWorkout } from '../entities/workouts/UserWorkout.js';

export interface IUserWorkoutRepository {
    findById(id: number): Promise<UserWorkout | null>;
    findByIdAndUserId(id: number, userId: number): Promise<UserWorkout | null>;
    findByUserIdAndDateRange(userId: number, from: Date, to: Date): Promise<UserWorkout[]>;
    findLatestByUserId(userId: number): Promise<UserWorkout | null>;
    create(userWorkout: UserWorkout): Promise<UserWorkout>;
    updateStatus(
        id: number,
        userId: number,
        status: UserWorkoutStatus,
        startedAt: Date | null,
        completedAt: Date | null
    ): Promise<UserWorkout | null>;
    reschedule(id: number, userId: number, scheduledAt: Date): Promise<UserWorkout | null>;
}
