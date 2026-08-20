import { UserWorkout } from "../entities/workouts/UserWorkout.js";

export interface IUserWorkoutRepository {
    fidById(id: number): Promise<UserWorkout | null>;
    create(userWorkout: UserWorkout): Promise<UserWorkout>;
}