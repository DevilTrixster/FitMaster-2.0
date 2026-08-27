import { UserResponse } from '../dto/UserResponse.js';
import { GetCurrentUserRequest } from '../dto/GetCurrentUserRequest.js';

export interface IGetCurrentUserUseCase {
    execute(request: GetCurrentUserRequest): Promise<UserResponse>;
}