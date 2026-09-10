import { UserNotFoundError } from '../../../../shared/errors/index.js';
import { IDatabase } from '../../../ports/database/IDatabase.js';
import { UserResponse } from '../../auth/DTO.js';
import { toUserResponse } from '../../auth/mappers/UserResponseMapper.js';
import { IGetUserProfileUseCase } from '../contracts/IGetUserProfileUseCase.js';

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
