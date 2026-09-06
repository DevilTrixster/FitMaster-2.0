import { IDatabase } from '../../../ports/database/IDatabase.js';
import { UserNotFoundError } from '../../../../shared/errors/index.js';
import { GetCurrentUserRequest, UserResponse } from '../DTO.js';
import { IGetCurrentUserUseCase } from '../Contracts.js';
import { toUserResponse } from '../mappers/UserResponseMapper.js';

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {

    constructor(
        private readonly database: IDatabase,
    ) {}

    async execute(request: GetCurrentUserRequest): Promise<UserResponse> {

        const userRepository = this.database.repositories().getUserRepository();
        const user = await userRepository.findById(request.userId);

        if (!user) {
            throw new UserNotFoundError(
                request.userId
            );
        }

        return toUserResponse(user);
    }
}