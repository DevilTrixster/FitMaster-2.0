import { IDatabase } from '../../../ports/database/IDatabase.js';
import { ITokenService } from '../services/ITokenService.js';
import { LogoutUserRequest } from '../dto/LogoutUserRequest.js';
import { ILogoutUserUseCase } from '../contracts/ILogoutUserUseCase.js';

export class LogoutUserUseCase implements ILogoutUserUseCase {

    constructor(
        private readonly database: IDatabase,
        private readonly tokenService: ITokenService,
    ) {}

    async execute(request: LogoutUserRequest): Promise<void> {

        await this.database.transaction(async (repositories) => {

            const authSessionRepository = repositories.getAuthSessionRepository();
            const refreshTokenHash = this.tokenService.hashRefreshToken(request.refreshToken);
            const session = await authSessionRepository.findByTokenHash(refreshTokenHash);

            if (!session) {
                return;
            }

            await authSessionRepository.revokeById(session.id!);
        });
    }
}