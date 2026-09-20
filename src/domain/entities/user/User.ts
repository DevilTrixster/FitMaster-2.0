import { Gender, ExperienceLevel, FitnessGoal } from '../../../shared/enum.js';

export class User {
    public readonly id?: number;
    public readonly nickname: string;
    public readonly passwordHash: string;
    public readonly email: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly birthDate: string;
    public readonly gender: Gender;
    public readonly height: number;
    public readonly weight: number;
    public readonly avatarUrl: string | null;
    public readonly preferredWorkoutTime: string;
    public readonly preferredDays: number[];
    public readonly experienceLevel: ExperienceLevel;
    public readonly fitnessGoal: FitnessGoal;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(data: {
        id?: number;
        nickname: string;
        passwordHash: string;
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        gender: Gender;
        height: number;
        weight: number;
        avatarUrl: string | null;
        preferredWorkoutTime: string;
        preferredDays: number[];
        experienceLevel?: ExperienceLevel;
        fitnessGoal?: FitnessGoal;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = data.id;
        this.nickname = data.nickname;
        this.passwordHash = data.passwordHash;
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.birthDate = data.birthDate;
        this.gender = data.gender;
        this.height = data.height;
        this.weight = data.weight;
        this.avatarUrl = data.avatarUrl;
        this.preferredWorkoutTime = data.preferredWorkoutTime;
        this.preferredDays = data.preferredDays;
        this.experienceLevel = data.experienceLevel ?? ExperienceLevel.Beginner;
        this.fitnessGoal = data.fitnessGoal ?? FitnessGoal.Maintenance;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}
