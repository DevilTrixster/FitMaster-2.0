import { User } from "./User.js";

export interface IUserRepository {
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    createUser(user: User): Promise<User>;
    updateUserFields(
        userId: number,
        fields: {
            nickname?: string;
            firstName?: string;
            lastName?: string;
            height?: number;
            weight?: number;
            avatarUrl?: string | null;
            preferredWorkoutTime?: string;
            preferredDays?: number[];
        }): Promise<void>;
    delete(id: number): Promise<void>;
}