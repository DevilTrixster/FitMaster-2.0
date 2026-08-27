import { Gender, ExperienceLevel, FitnessGoal } from '../../../../shared/enum.js'
export interface RegisterUserRequest {
    nickname: string;
    password: string;
    email: string;

    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: Gender;

    height: number;
    weight: number;

    preferredWorkoutTime?: string;
    preferredDays?: number[];

    experienceLevel?: ExperienceLevel;
    fitnessGoal?: FitnessGoal;
}