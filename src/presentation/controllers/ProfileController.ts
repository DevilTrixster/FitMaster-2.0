import { SuccessStatuses } from '../../shared/statuses/index.js';
import { Request, Response } from 'express';

import {
    IDeleteUserAccountUseCase,
    IGetUserProfileUseCase,
    IUpdateUserProfileUseCase
} from '../../application/profile/Contracts.js';
import { UpdateUserProfileRequest } from '../../application/profile/DTO.js';
import { AuthenticatedRequest } from '../IAuthenticatedRequest.js';

export class ProfileController {
    constructor(
        private readonly getUserProfileUseCase: IGetUserProfileUseCase,
        private readonly updateUserProfileUseCase: IUpdateUserProfileUseCase,
        private readonly deleteUserAccountUseCase: IDeleteUserAccountUseCase
    ) {}

    async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
        const profile = await this.getUserProfileUseCase.execute({
            userId: req.auth.userId
        });

        res.status(SuccessStatuses.OK.statusCode).json(profile);
    }

    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request: UpdateUserProfileRequest = req.body;

        const profile = await this.updateUserProfileUseCase.execute(req.auth.userId, request);

        res.status(SuccessStatuses.OK.statusCode).json(profile);
    }

    async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
        await this.deleteUserAccountUseCase.execute(req.auth.userId);

        res.status(SuccessStatuses.NO_CONTENT.statusCode).send();
    }
}
