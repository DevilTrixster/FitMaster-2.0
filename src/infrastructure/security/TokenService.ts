import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import crypto from 'node:crypto';

import { AccessTokenPayload } from '../../application/users/auth/DTO.js';
import { ITokenService } from '../../application/users/auth/services/ITokenService.js';
import { InvalidAccessTokenError } from '../../shared/errors/index.js';

export interface JwtTokenConfig {
    accessSecret: string;
    accessExpiresIn: StringValue | number;
    refreshExpiresIn: number;
    issuer: string;
    audience: string;
}

export class JwtTokenService implements ITokenService {
    constructor(private readonly config: JwtTokenConfig) {}

    generateRefreshToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    hashRefreshToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    generateAccessToken(userId: number): string {
        return jwt.sign(
            {
                type: 'access'
            },
            this.config.accessSecret,
            {
                algorithm: 'HS256',
                subject: String(userId),
                expiresIn: this.config.accessExpiresIn,
                issuer: this.config.issuer,
                audience: this.config.audience
            }
        );
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        try {
            const payload = jwt.verify(token, this.config.accessSecret, {
                algorithms: ['HS256'],
                issuer: this.config.issuer,
                audience: this.config.audience
            });

            if (typeof payload === 'string') {
                throw new InvalidAccessTokenError();
            }

            const userId = Number(payload.sub);

            if (!Number.isInteger(userId) || userId <= 0) {
                throw new InvalidAccessTokenError();
            }

            if (payload.type !== 'access') {
                throw new InvalidAccessTokenError();
            }

            return {
                userId
            };
        } catch (error) {
            if (error instanceof InvalidAccessTokenError) {
                throw error;
            }

            throw new InvalidAccessTokenError();
        }
    }

    getRefreshTokenExpiresAt(): Date {
        return new Date(Date.now() + this.config.refreshExpiresIn);
    }
}
