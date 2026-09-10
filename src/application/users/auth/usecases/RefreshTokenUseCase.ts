import { AuthSession } from '../../../../domain/entities/user/AuthSession.js';
import { InvalidRefreshTokenError } from '../../../../shared/errors/index.js';
import { IDatabase } from '../../../ports/database/IDatabase.js';
import { IRefreshTokenUseCase } from '../Contracts.js';
import { RefreshTokenRequest, RefreshTokenResult } from '../DTO.js';
import { ITokenService } from '../services/ITokenService.js';

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(
        private readonly database: IDatabase,
        private readonly tokenService: ITokenService
    ) {}

    async execute(request: RefreshTokenRequest): Promise<RefreshTokenResult> {
        return this.database.transaction(async (repositories) => {
            const authSessionRepository =
                repositories.getAuthSessionRepository();

            const refreshTokenHash = this.tokenService.hashRefreshToken(
                request.refreshToken
            );

            const session =
                await authSessionRepository.findByTokenHashForUpdate(
                    refreshTokenHash
                );

            if (!session) {
                throw new InvalidRefreshTokenError();
            }

            if (session.revokedAt !== null) {
                throw new InvalidRefreshTokenError();
            }

            if (session.expiresAt <= new Date()) {
                throw new InvalidRefreshTokenError();
            }

            const newRefreshToken = this.tokenService.generateRefreshToken();

            const newRefreshTokenHash =
                this.tokenService.hashRefreshToken(newRefreshToken);

            await authSessionRepository.revokeById(session.id!);

            const newSession = new AuthSession({
                userId: session.userId,
                refreshTokenHash: newRefreshTokenHash,
                expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
                revokedAt: null
            });

            await authSessionRepository.create(newSession);

            const accessToken = this.tokenService.generateAccessToken(
                session.userId
            );

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        });
    }
}
