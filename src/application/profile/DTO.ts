import { FitnessGoal, ExperienceLevel } from '../../shared/enum.js';

export interface UpdateUserProfileRequest {
    nickname?: string;
    firstName?: string;
    lastName?: string;
    height?: number;
    weight?: number;
    avatarUrl?: string | null;
    preferredWorkoutTime?: string;
    preferredDays?: number[];
    experienceLevel?: ExperienceLevel;
    fitnessGoal?: FitnessGoal;
}
