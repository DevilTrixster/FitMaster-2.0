import { UserResponse } from '../auth/DTO.js';

import { UpdateUserProfileRequest } from './DTO.js';

export interface IGetUserProfileUseCase {
    execute(request: { userId: number }): Promise<UserResponse>;
}

export interface IUpdateUserProfileUseCase {
    execute(userId: number, request: UpdateUserProfileRequest): Promise<UserResponse>;
}

export interface IDeleteUserAccountUseCase {
    execute(userId: number): Promise<void>;
}
