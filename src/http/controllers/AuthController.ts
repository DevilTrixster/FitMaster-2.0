import { Request, Response } from 'express';
import { IRegisterUserUseCase } from '../../application/users/auth/contracts/IRegisterUserUseCase.js';
import { ILoginUserUseCase } from '../../application/users/auth/contracts/ILoginUserUseCase.js';
import { ILogoutUserUseCase } from '../../application/users/auth/contracts/ILogoutUserUseCase.js';
import { IRefreshTokenUseCase } from '../../application/users/auth/contracts/IRefreshTokenUseCase.js';
import { IGetCurrentUserUseCase } from '../../application/users/auth/contracts/IGetCurrentUserUseCase.js';
import { RegisterUserRequest } from '../../application/users/auth/dto/RegisterUserRequest.js';
import { LoginUserRequest } from '../../application/users/auth/dto/LoginUserRequest.js';
import { LogoutUserRequest } from '../../application/users/auth/dto/LogoutUserRequest.js';
import { RefreshTokenRequest } from '../../application/users/auth/dto/RefreshTokenRequest.js';
import { GetCurrentUserRequest } from '../../application/users/auth/dto/GetCurrentUserRequest.js';
import { InvalidAccessTokenError } from '../../shared/errors/index.js';

export class AuthController {

    constructor(
        private readonly registerUserUseCase: IRegisterUserUseCase,
        private readonly loginUserUseCase: ILoginUserUseCase,
        private readonly logoutUserUseCase: ILogoutUserUseCase,
        private readonly refreshTokenUseCase: IRefreshTokenUseCase,
        private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
    ) {}

    async register(req: Request, res: Response): Promise<void> {
        const request: RegisterUserRequest = req.body;

        const result = await this.registerUserUseCase.execute(request);

        res.status(201).json(result);
    }

    async login(req: Request, res: Response): Promise<void> {
        const request: LoginUserRequest = {
            email: req.body.email,
            password: req.body.password,
        };

        const result = await this.loginUserUseCase.execute(request);

        res.status(200).json(result);
    }

    async logout(req: Request, res: Response): Promise<void> {
        const request: LogoutUserRequest = {
            refreshToken: req.body.refreshToken,
        };

        await this.logoutUserUseCase.execute(request);

        res.status(204).send();
    }

    async refresh(req: Request, res: Response): Promise<void> {
        const request: RefreshTokenRequest = {
            refreshToken: req.body.refreshToken,
        };

        const result = await this.refreshTokenUseCase.execute(request);

        res.status(200).json(result);
    }

    async me(req: Request, res: Response): Promise<void> {
        const accessToken = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : null;

        if (!accessToken) {
            throw new InvalidAccessTokenError();
        }

        const request: GetCurrentUserRequest = {
            accessToken,
        };

        const user =
            await this.getCurrentUserUseCase.execute(request);

        res.status(200).json(user);
    }
}