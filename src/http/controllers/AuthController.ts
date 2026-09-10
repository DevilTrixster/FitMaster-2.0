import { Request, Response } from 'express';

import {
    IRegisterUserUseCase,
    IGetCurrentUserUseCase,
    IRefreshTokenUseCase,
    ILogoutUserUseCase,
    ILoginUserUseCase
} from '../../application/users/auth/Contracts.js';
import {
    RegisterUserRequest,
    LoginUserRequest,
    LogoutUserRequest,
    RefreshTokenRequest,
    GetCurrentUserRequest
} from '../../application/users/auth/DTO.js';
import { AuthenticatedRequest } from '../middleware/types/AuthenticatedRequest.js';

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

        res.status(201).json(result);
    }

    async login(req: Request, res: Response): Promise<void> {
        const request: LoginUserRequest = {
            email: req.body.email,
            password: req.body.password
        };

        const result = await this.loginUserUseCase.execute(request);

        res.status(200).json(result);
    }

    async logout(req: Request, res: Response): Promise<void> {
        const request: LogoutUserRequest = {
            refreshToken: req.body.refreshToken
        };

        await this.logoutUserUseCase.execute(request);

        res.status(204).send();
    }

    async refresh(req: Request, res: Response): Promise<void> {
        const request: RefreshTokenRequest = {
            refreshToken: req.body.refreshToken
        };

        const result = await this.refreshTokenUseCase.execute(request);

        res.status(200).json(result);
    }

    async me(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request: GetCurrentUserRequest = {
            userId: req.auth.userId
        };

        const user = await this.getCurrentUserUseCase.execute(request);

        res.status(200).json(user);
    }
}
