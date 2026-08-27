import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';

import { ITokenService } from '../../application/users/auth/services/ITokenService.js';
import { AccessTokenPayload } from '../../application/users/auth/dto/AccessTokenPayload.js';

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
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    generateAccessToken(userId: number): string {
        return jwt.sign(
            {
                type: 'access',
            },
            this.config.accessSecret,
            {
                algorithm: 'HS256',
                subject: String(userId),
                expiresIn: this.config.accessExpiresIn,
                issuer: this.config.issuer,
                audience: this.config.audience,
            }
        );
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        const payload = jwt.verify(
            token,
            this.config.accessSecret,
            {
                algorithms: ['HS256'],
                issuer: this.config.issuer,
                audience: this.config.audience,
            }
        );

        if (typeof payload === 'string') {
            throw new Error('Invalid access token payload');
        }

        const userId = Number(payload.sub);

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error('Invalid access token subject');
        }

        if (payload.type !== 'access') {
            throw new Error('Invalid access token type');
        }

        return {
            userId,
        };
    }

    getRefreshTokenExpiresAt(): Date {
        return new Date(
            Date.now() + this.config.refreshExpiresIn
        );
    }
}