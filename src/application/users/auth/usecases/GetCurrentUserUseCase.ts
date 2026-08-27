import { IDatabase } from '../../../ports/database/IDatabase.js';
import { UserNotFoundError } from '../../../../shared/errors/index.js';
import { ITokenService } from '../services/ITokenService.js';
import { GetCurrentUserRequest } from '../dto/GetCurrentUserRequest.js';
import { UserResponse } from '../dto/UserResponse.js';
import { IGetCurrentUserUseCase } from '../contracts/IGetCurrentUserUseCase.js';
import { toUserResponse } from '../mappers/UserResponseMapper.js';

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {

    constructor(
        private readonly database: IDatabase,
        private readonly tokenService: ITokenService,
    ) {}

    async execute(request: GetCurrentUserRequest): Promise<UserResponse> {

        const payload = this.tokenService.verifyAccessToken(request.accessToken);
        const userRepository = this.database.repositories().getUserRepository();
        const user = await userRepository.findById(payload.userId);

        if (!user) {
            throw new UserNotFoundError(
                payload.userId
            );
        }

        return toUserResponse(user);
    }
}