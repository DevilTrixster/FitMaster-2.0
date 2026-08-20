import { UserWorkoutPattern } from "../entities/workouts/UserWorkoutPattern.js";

export interface IUserWorkoutPatternRepository {
    findById(id:string): Promise<UserWorkoutPattern | null>;
}