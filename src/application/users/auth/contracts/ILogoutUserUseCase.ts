import { LogoutUserRequest } from '../dto/LogoutUserRequest.js';

export interface ILogoutUserUseCase {
    execute(request: LogoutUserRequest): Promise<void>;
}