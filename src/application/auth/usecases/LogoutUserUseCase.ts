import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { ILogoutUserUseCase } from '../Contracts.js';
import { LogoutUserRequest } from '../DTO.js';
import { ITokenService } from '../services/ITokenService.js';

export class LogoutUserUseCase implements ILogoutUserUseCase {
    constructor(
        private readonly database: IDatabase,
        private readonly tokenService: ITokenService
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
