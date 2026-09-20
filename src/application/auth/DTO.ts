import { Gender, ExperienceLevel, FitnessGoal } from '../../shared/enum.js';

export interface UserResponse {
    id: number;
    nickname: string;
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
    experienceLevel: ExperienceLevel;
    fitnessGoal: FitnessGoal;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterUserRequest {
    nickname: string;
    password: string;
    email: string;

    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;

    height: number;
    weight: number;

    preferredWorkoutTime?: string;
    preferredDays?: number[];

    experienceLevel?: ExperienceLevel;
    fitnessGoal?: FitnessGoal;
}

export interface RefreshTokenResult {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LogoutUserRequest {
    refreshToken: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface GetCurrentUserRequest {
    userId: number;
}

export interface AuthenticationResult {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
}

export interface AccessTokenPayload {
    userId: number;
}
