import { UserNotFoundError } from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IDeleteUserAccountUseCase } from '../Contracts.js';

export class DeleteUserAccountUseCase implements IDeleteUserAccountUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number): Promise<void> {
        await this.database.transaction(async (repositories) => {
            const userRepository = repositories.getUserRepository();
            const authSessionRepository = repositories.getAuthSessionRepository();

            const user = await userRepository.findById(userId);

            if (!user) {
                throw new UserNotFoundError(userId);
            }

            await authSessionRepository.revokeAllByUserId(userId);
            await userRepository.delete(userId);
        });
    }
}
