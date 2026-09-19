import { NextFunction, Request, Response } from 'express';

import { ITokenService } from '../../application/auth/services/ITokenService.js';
import { InvalidAccessTokenError } from '../../shared/errors/index.js';
import { AuthenticatedRequest } from '../IAuthenticatedRequest.js';

export function authenticate(tokenService: ITokenService) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith('Bearer ')) {
            throw new InvalidAccessTokenError();
        }

        const accessToken = authorization.slice('Bearer '.length).trim();

        if (!accessToken) {
            throw new InvalidAccessTokenError();
        }

        const payload = tokenService.verifyAccessToken(accessToken);

        const authenticatedRequest = req as AuthenticatedRequest;

        authenticatedRequest.auth = {
            userId: payload.userId
        };

        next();
    };
}
