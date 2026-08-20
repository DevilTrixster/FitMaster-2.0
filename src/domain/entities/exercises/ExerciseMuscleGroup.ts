export class ExerciseMuscleGroup {
    public readonly id?: number;
    public readonly exerciseId: number;
    public readonly muscleGroupId: number;
    public readonly loadRatio: number;
    public readonly isPrimary: boolean;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(data: {
        id?: number;
        exerciseId: number;
        muscleGroupId: number;
        loadRatio: number;
        isPrimary: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = data.id;
        this.exerciseId = data.exerciseId;
        this.muscleGroupId = data.muscleGroupId;
        this.loadRatio = data.loadRatio;
        this.isPrimary = data.isPrimary;
        this.createdAt = data.createdAt ?? new Date()
        this.updatedAt = data.updatedAt ?? new Date()
    }
}