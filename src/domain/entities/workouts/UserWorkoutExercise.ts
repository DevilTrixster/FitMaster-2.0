import { UserWorkoutExerciseAdaptation } from '../../types/workouts/UserWorkoutExerciseAdaptation.js';

export class UserWorkoutExercise {
    public readonly id?: number;
    public readonly userWorkoutId: number;
    public readonly plannedExerciseId: number;
    public readonly exerciseId: number;
    public readonly adaptationData: UserWorkoutExerciseAdaptation | null;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(data: {
        id?: number;
        userWorkoutId: number;
        plannedExerciseId: number;
        exerciseId: number;
        adaptationData?: UserWorkoutExerciseAdaptation | null;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = data.id;
        this.userWorkoutId = data.userWorkoutId;
        this.plannedExerciseId = data.plannedExerciseId;
        this.exerciseId = data.exerciseId;
        this.adaptationData = data.adaptationData ?? null;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
