import { UserResponse } from './UserResponse.js';

export interface AuthenticationResult {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
}