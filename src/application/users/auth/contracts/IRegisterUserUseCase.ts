import { AuthenticationResult } from '../dto/AuthenticationResult.js';
import { RegisterUserRequest } from '../dto/RegisterUserRequest.js';

export interface IRegisterUserUseCase {
    execute(request: RegisterUserRequest): Promise<AuthenticationResult>;
}