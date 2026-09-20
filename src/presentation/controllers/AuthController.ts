import { Request, Response } from 'express';

import {
    IRegisterUserUseCase,
    IGetCurrentUserUseCase,
    IRefreshTokenUseCase,
    ILogoutUserUseCase,
    ILoginUserUseCase
} from '../../application/auth/Contracts.js';
import {
    RegisterUserRequest,
    LoginUserRequest,
    LogoutUserRequest,
    RefreshTokenRequest,
    GetCurrentUserRequest
} from '../../application/auth/DTO.js';
import { SuccessStatuses } from '../../shared/statuses/index.js';
import { AuthenticatedRequest } from '../IAuthenticatedRequest.js';

export class AuthController {
    constructor(
        private readonly registerUserUseCase: IRegisterUserUseCase,
        private readonly loginUserUseCase: ILoginUserUseCase,
        private readonly logoutUserUseCase: ILogoutUserUseCase,
        private readonly refreshTokenUseCase: IRefreshTokenUseCase,
        private readonly getCurrentUserUseCase: IGetCurrentUserUseCase
    ) {}

    async register(req: Request, res: Response): Promise<void> {
        const request: RegisterUserRequest = req.body;

        const result = await this.registerUserUseCase.execute(request);

        res.status(SuccessStatuses.CREATED.statusCode).json(result);
    }

    async login(req: Request, res: Response): Promise<void> {
        const request: LoginUserRequest = {
            email: req.body.email,
            password: req.body.password
        };

        const result = await this.loginUserUseCase.execute(request);

        res.status(SuccessStatuses.OK.statusCode).json(result);
    }

    async logout(req: Request, res: Response): Promise<void> {
        const request: LogoutUserRequest = {
            refreshToken: req.body.refreshToken
        };

        await this.logoutUserUseCase.execute(request);

        res.status(SuccessStatuses.NO_CONTENT.statusCode).send();
    }

    async refresh(req: Request, res: Response): Promise<void> {
        const request: RefreshTokenRequest = {
            refreshToken: req.body.refreshToken
        };

        const result = await this.refreshTokenUseCase.execute(request);

        res.status(SuccessStatuses.OK.statusCode).json(result);
    }

    async me(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request: GetCurrentUserRequest = {
            userId: req.auth.userId
        };

        const user = await this.getCurrentUserUseCase.execute(request);

        res.status(SuccessStatuses.OK.statusCode).json(user);
    }
}
