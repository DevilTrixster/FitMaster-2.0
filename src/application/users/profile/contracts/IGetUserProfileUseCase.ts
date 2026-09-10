import { UserResponse } from '../../auth/DTO.js';

export interface IGetUserProfileUseCase {
    execute(request: { userId: number }): Promise<UserResponse>;
}
