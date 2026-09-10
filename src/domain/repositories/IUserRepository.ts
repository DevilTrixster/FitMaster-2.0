import { User } from '../entities/user/User.js';
import { UserUpdateFields } from '../types/UserUpdateFields.js';

export interface IUserRepository {
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByNickname(nickname: string): Promise<User | null>;
    createUser(user: User): Promise<User>;
    updateUserFields(
        userId: number,
        fields: UserUpdateFields
    ): Promise<User | null>;
    delete(id: number): Promise<void>;
}
