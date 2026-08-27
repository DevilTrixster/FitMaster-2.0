import { RefreshTokenRequest } from '../dto/RefreshTokenRequest.js';
import { RefreshTokenResult } from '../dto/RefreshTokenResult.js';


export interface IRefreshTokenUseCase {
    execute(request: RefreshTokenRequest): Promise<RefreshTokenResult>;
}