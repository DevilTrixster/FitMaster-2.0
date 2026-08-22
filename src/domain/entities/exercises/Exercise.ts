import { EquipmentType } from "../../../enum.js";

export class Exercise {
    public readonly id?: number;
    public readonly name: string;
    public readonly description: string | null;
    public readonly equipmentType: EquipmentType;
    public readonly verbalInstruction: string | null;
    public readonly video: string | null;
    public readonly isActive: boolean;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(data: {
        id?: number;
        name: string;
        description: string | null;
        equipmentType: EquipmentType;
        verbalInstruction: string | null;
        video?: string | null;
        isActive: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description ?? null;
        this.equipmentType = data.equipmentType;
        this.verbalInstruction = data.verbalInstruction ?? null;
        this.video = data.video ?? null;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}