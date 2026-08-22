import { User } from '../entities/user/User.js';

export interface UserUpdateFields {
    nickname?: string;
    firstName?: string;
    lastName?: string;
    height?: number;
    weight?: number;
    avatarUrl?: string | null;
    preferredWorkoutTime?: string;
    preferredDays?: number[];
    experienceLevel?: User['experienceLevel'];
    fitnessGoal?: User['fitnessGoal'];
}