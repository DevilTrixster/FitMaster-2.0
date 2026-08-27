import { IDatabase } from '../../../ports/database/IDatabase.js';
import { EmailAlreadyExistsError, NicknameAlreadyExistsError } from '../../../../shared/errors/index.js';
import { User } from '../../../../domain/entities/user/User.js';
import { AuthSession } from '../../../../domain/entities/user/AuthSession.js';
import { IPasswordHasher } from '../services/IPasswordHasher.js';
import { ITokenService } from '../services/ITokenService.js';
import { RegisterUserRequest } from '../dto/RegisterUserRequest.js';
import { AuthenticationResult } from '../dto/AuthenticationResult.js';
import { IRegisterUserUseCase } from '../contracts/IRegisterUserUseCase.js';
import { toUserResponse } from '../mappers/UserResponseMapper.js'

export class RegisterUserUseCase implements IRegisterUserUseCase {

    constructor(
        private readonly database: IDatabase,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService,
    ) {}

    async execute(request: RegisterUserRequest): Promise<AuthenticationResult> {

        return this.database.transaction(async (repositories) => {

            const userRepository =
                repositories.getUserRepository();

            const authSessionRepository =
                repositories.getAuthSessionRepository();

            const existingEmail =
                await userRepository.findByEmail(request.email);

            if (existingEmail) {
                throw new EmailAlreadyExistsError();
            }

            const existingNickname =
                await userRepository.findByNickname(request.nickname);

            if (existingNickname) {
                throw new NicknameAlreadyExistsError();
            }

            const passwordHash =
                await this.passwordHasher.hash(request.password);

            const user = new User({
                nickname: request.nickname,
                passwordHash,
                email: request.email,
                firstName: request.firstName,
                lastName: request.lastName,
                birthDate: request.birthDate,
                gender: request.gender,
                height: request.height,
                weight: request.weight,
                avatarUrl: null,
                preferredWorkoutTime: request.preferredWorkoutTime ?? '17:00',
                preferredDays: request.preferredDays ?? [1, 3, 5],
                experienceLevel: request.experienceLevel,
                fitnessGoal: request.fitnessGoal,
            });

            const createdUser =
                await userRepository.createUser(user);

            const refreshToken =
                this.tokenService.generateRefreshToken();

            const refreshTokenHash =
                this.tokenService.hashRefreshToken(refreshToken);

            const session = new AuthSession({
                userId: createdUser.id!,
                refreshTokenHash,
                expiresAt:
                    this.tokenService.getRefreshTokenExpiresAt(),
                revokedAt: null,
            });

            await authSessionRepository.create(session);

            const accessToken =
                this.tokenService.generateAccessToken(
                    createdUser.id!
                );

            return {
                user: toUserResponse(createdUser),
                accessToken,
                refreshToken,
            };
        });
    }

}