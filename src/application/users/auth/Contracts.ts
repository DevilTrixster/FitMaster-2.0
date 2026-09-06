import { UserResponse, GetCurrentUserRequest, AuthenticationResult, LoginUserRequest,
    LogoutUserRequest, RefreshTokenRequest, RefreshTokenResult, RegisterUserRequest
} from './DTO.js';


export interface IGetCurrentUserUseCase {
    execute(request: GetCurrentUserRequest): Promise<UserResponse>;
}

export interface ILoginUserUseCase {
    execute(request: LoginUserRequest): Promise<AuthenticationResult>;
}

export interface ILogoutUserUseCase {
    execute(request: LogoutUserRequest): Promise<void>;
}

export interface IRefreshTokenUseCase {
    execute(request: RefreshTokenRequest): Promise<RefreshTokenResult>;
}

export interface IRegisterUserUseCase {
    execute(request: RegisterUserRequest): Promise<AuthenticationResult>;
}