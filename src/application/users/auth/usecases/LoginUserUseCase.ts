import { IDatabase } from '../../../ports/database/IDatabase.js';
import { InvalidCredentialsError } from '../../../../shared/errors/index.js';
import { AuthSession } from '../../../../domain/entities/user/AuthSession.js';
import { IPasswordHasher } from '../services/IPasswordHasher.js';
import { ITokenService } from '../services/ITokenService.js';
import { LoginUserRequest } from '../dto/LoginUserRequest.js';
import { AuthenticationResult } from '../dto/AuthenticationResult.js';
import { ILoginUserUseCase } from '../contracts/ILoginUserUseCase.js';
import { toUserResponse } from '../mappers/UserResponseMapper.js';

export class LoginUserUseCase implements ILoginUserUseCase {

    constructor(
        private readonly database: IDatabase,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService,
    ) {}

    async execute(request: LoginUserRequest): Promise<AuthenticationResult> {

        return this.database.transaction(async (repositories) => {

            const userRepository =
                repositories.getUserRepository();

            const authSessionRepository =
                repositories.getAuthSessionRepository();

            const user =
                await userRepository.findByEmail(request.email);

            if (!user) {
                throw new InvalidCredentialsError();
            }

            const passwordValid =
                await this.passwordHasher.verify(
                    request.password,
                    user.passwordHash
                );

            if (!passwordValid) {
                throw new InvalidCredentialsError();
            }

            const refreshToken =
                this.tokenService.generateRefreshToken();

            const refreshTokenHash =
                this.tokenService.hashRefreshToken(refreshToken);

            const session = new AuthSession({
                userId: user.id!,
                refreshTokenHash,
                expiresAt:
                    this.tokenService.getRefreshTokenExpiresAt(),
                revokedAt: null,
            });

            await authSessionRepository.create(session);

            const accessToken =
                this.tokenService.generateAccessToken(
                    user.id!
                );

            return {
                user: toUserResponse(user),
                accessToken,
                refreshToken,
            };
        });
    }
}