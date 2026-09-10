import { WorkoutPlan } from '../../types/WorkoutPlan.js';
import { WorkoutResult } from '../../types/WorkoutResult.js';

export class UserWorkoutResult {
    public readonly id?: number;
    public readonly userWorkoutId: number;
    public readonly plannedData: WorkoutPlan;
    public readonly actualData: WorkoutResult | null;
    public readonly createdAt: Date;

    constructor(data: {
        id?: number;
        userWorkoutId: number;
        plannedData: WorkoutPlan;
        actualData?: WorkoutResult | null;
        createdAt?: Date;
    }) {
        this.id = data.id;
        this.userWorkoutId = data.userWorkoutId;
        this.plannedData = data.plannedData;
        this.actualData = data.actualData ?? null;
        this.createdAt = data.createdAt ?? new Date();
    }
}
