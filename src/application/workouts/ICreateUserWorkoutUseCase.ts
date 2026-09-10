import { UserWorkout } from '../../domain/entities/workouts/UserWorkout.js';

import { CreateUserWorkoutRequest } from './dto/CreateUserWorkoutRequest.js';

export interface ICreateUserWorkoutUseCase {
    execute(request: CreateUserWorkoutRequest): Promise<UserWorkout>;
}
