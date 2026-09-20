import { UserNotFoundError } from '../../../shared/errors/index.js';
import { UserResponse } from '../../auth/DTO.js';
import { toUserResponse } from '../../auth/UserResponseMapper.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetUserProfileUseCase } from '../Contracts.js';

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(request: { userId: number }): Promise<UserResponse> {
        const userRepository = this.database.repositories().getUserRepository();
        const user = await userRepository.findById(request.userId);

        if (!user) {
            throw new UserNotFoundError(request.userId);
        }

        return toUserResponse(user);
    }
}
