import { UserWorkout } from "../entities/workouts/UserWorkout.js";

export interface IUserWorkoutRepository {
    findById(id: number): Promise<UserWorkout | null>;
    create(userWorkout: UserWorkout): Promise<UserWorkout>;
    findByIdAndUserId(id: number, userId: number): Promise<UserWorkout | null>;
}