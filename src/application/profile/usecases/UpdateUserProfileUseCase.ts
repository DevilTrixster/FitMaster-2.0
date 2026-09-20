import { UserNotFoundError, NicknameAlreadyExistsError } from '../../../shared/errors/index.js';
import { UserResponse } from '../../auth/DTO.js';
import { toUserResponse } from '../../auth/UserResponseMapper.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IUpdateUserProfileUseCase } from '../Contracts.js';
import { UpdateUserProfileRequest } from '../DTO.js';

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: UpdateUserProfileRequest): Promise<UserResponse> {
        return this.database.transaction(async (repositories) => {
            const userRepository = repositories.getUserRepository();

            const user = await userRepository.findById(userId);

            if (!user) {
                throw new UserNotFoundError(userId);
            }

            if (request.nickname !== undefined && request.nickname !== user.nickname) {
                const existingUser = await userRepository.findByNickname(request.nickname);

                if (existingUser && existingUser.id !== userId) {
                    throw new NicknameAlreadyExistsError();
                }
            }

            const updatedUser = await userRepository.updateUserFields(userId, request);

            if (!updatedUser) {
                throw new UserNotFoundError(userId);
            }

            return toUserResponse(updatedUser);
        });
    }
}
