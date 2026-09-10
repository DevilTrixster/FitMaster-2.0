import { UserWorkoutStatus } from '../../../shared/enum.js';
import { WorkoutPlan } from '../../types/WorkoutPlan.js';

export class UserWorkout {
    public readonly id?: number;
    public readonly userId: number;
    public readonly patternId: string;
    public readonly status: UserWorkoutStatus;
    public readonly workoutPlan: WorkoutPlan;
    public readonly originalScheduledAt: Date;
    public readonly scheduledAt: Date;
    public readonly startedAt: Date | null;
    public readonly completedAt: Date | null;
    public readonly createdAt: Date;

    constructor(data: {
        id?: number;
        userId: number;
        patternId: string;
        status: UserWorkoutStatus;
        workoutPlan: WorkoutPlan;
        originalScheduledAt: Date;
        scheduledAt: Date;
        startedAt?: Date | null;
        completedAt?: Date | null;
        createdAt?: Date;
    }) {
        this.id = data.id;
        this.userId = data.userId;
        this.patternId = data.patternId;
        this.status = data.status;
        this.workoutPlan = data.workoutPlan;
        this.originalScheduledAt = data.originalScheduledAt;
        this.scheduledAt = data.scheduledAt;
        this.startedAt = data.startedAt ?? null;
        this.completedAt = data.completedAt ?? null;
        this.createdAt = data.createdAt ?? new Date();
    }
}
