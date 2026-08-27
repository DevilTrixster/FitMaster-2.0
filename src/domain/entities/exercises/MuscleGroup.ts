import { Muscle } from '../../../shared/enum.js'

export class MuscleGroup {
    public readonly id?: number;
    public readonly code: Muscle;
    public readonly name: string; 
    public readonly parentId: number | null;
    public readonly createdAt: Date;

    constructor(data: {
        id?: number;
        code: Muscle;
        name: string;
        parentId: number | null;
        createdAt?: Date;

    }) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.parentId = data.parentId ?? null;
        this.createdAt = data.createdAt ?? new Date();
    }
}