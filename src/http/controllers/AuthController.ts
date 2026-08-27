import { ILogoutUserUseCase } from '../../application/users/auth/contracts/ILogoutUserUseCase.js'
import { Request, Response } from 'express';
import { LogoutUserRequest } from '../../application/users/auth/dto/LogoutUserRequest.js'

export class AuthController {

    constructor(
        private readonly logoutUserUseCase: ILogoutUserUseCase,
    ) {}

    async logout(req: Request, res: Response): Promise<void> {
        const request: LogoutUserRequest = { refreshToken: req.body.refreshToken };

        await this.logoutUserUseCase.execute(request);
        
        res.status(204).send();
    }
}