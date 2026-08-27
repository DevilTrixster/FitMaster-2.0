import { Gender, ExperienceLevel, FitnessGoal } from '../../../../shared/enum.js';
export interface UserResponse {
    id: number;
    nickname: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: Gender;
    height: number;
    weight: number;
    avatarUrl: string | null;
    preferredWorkoutTime: string;
    preferredDays: number[];
    experienceLevel: ExperienceLevel;
    fitnessGoal: FitnessGoal;
    createdAt: Date;
    updatedAt: Date;
}
