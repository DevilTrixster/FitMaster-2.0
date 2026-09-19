import { UserWorkout } from '../../domain/entities/workouts/UserWorkout.js';

import { CreateUserWorkoutRequest } from './dto/CreateUserWorkoutRequest.js';

export interface ICreateUserWorkoutUseCase {
    execute(userId: number, request: CreateUserWorkoutRequest): Promise<UserWorkout>;
}
