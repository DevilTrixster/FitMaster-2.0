import { AuthenticationResult } from '../dto/AuthenticationResult.js';
import { LoginUserRequest } from '../dto/LoginUserRequest.js';

export interface ILoginUserUseCase {
    execute(request: LoginUserRequest): Promise<AuthenticationResult>;
}