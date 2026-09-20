import { UserWorkout } from '../../domain/entities/workouts/UserWorkout.js';
import { UserWorkoutExercise } from '../../domain/entities/workouts/UserWorkoutExercise.js';
import { UserWorkoutPattern } from '../../domain/entities/workouts/UserWorkoutPattern.js';
import { UserWorkoutResult } from '../../domain/entities/workouts/UserWorkoutResult.js';

import {
    CreateUserWorkoutRequest,
    CreateWorkoutPatternRequest,
    GetUserWorkoutExerciseRequest,
    GetUserWorkoutRequest,
    GetUserWorkoutResultRequest,
    GetWorkoutPatternsRequest,
    UpdateUserWorkoutExerciseRequest,
    UpdateUserWorkoutStatusRequest
} from './DTO.js';

export interface ICreateUserWorkoutUseCase {
    execute(userId: number, request: CreateUserWorkoutRequest): Promise<UserWorkout>;
}

export interface IGetUserWorkoutUseCase {
    execute(
        userId: number,
        request: GetUserWorkoutRequest
    ): Promise<UserWorkout | UserWorkout[] | null>;
}

export interface IUpdateUserWorkoutStatusUseCase {
    execute(userId: number, request: UpdateUserWorkoutStatusRequest): Promise<UserWorkout>;
}

export interface IRescheduleUserWorkoutUseCase {
    execute(userId: number, workoutId: number, scheduledAt: Date): Promise<UserWorkout>;
}

export interface IGetUserWorkoutExerciseUseCase {
    execute(
        userId: number,
        request: GetUserWorkoutExerciseRequest
    ): Promise<UserWorkoutExercise | UserWorkoutExercise[] | null>;
}

export interface IUpdateUserWorkoutExerciseUseCase {
    execute(
        userId: number,
        request: UpdateUserWorkoutExerciseRequest
    ): Promise<UserWorkoutExercise>;
}

export interface IGetUserWorkoutResultUseCase {
    execute(
        userId: number,
        request: GetUserWorkoutResultRequest
    ): Promise<UserWorkoutResult | UserWorkoutResult[] | null>;
}

export interface ICreateUserWorkoutResultUseCase {
    execute(
        userId: number,
        workoutId: number,
        actualData: NonNullable<UserWorkoutResult['actualData']>
    ): Promise<UserWorkoutResult>;
}

export interface IUpdateUserWorkoutResultUseCase {
    execute(
        userId: number,
        workoutId: number,
        actualData: NonNullable<UserWorkoutResult['actualData']>
    ): Promise<UserWorkoutResult>;
}

export interface IGetWorkoutPatternsUseCase {
    execute(
        request: GetWorkoutPatternsRequest
    ): Promise<UserWorkoutPattern | UserWorkoutPattern[] | null>;
}

export interface ICreateWorkoutPatternUseCase {
    execute(request: CreateWorkoutPatternRequest): Promise<UserWorkoutPattern>;
}
