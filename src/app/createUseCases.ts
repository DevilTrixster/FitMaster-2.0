import { IPasswordHasher } from '../application/auth/services/IPasswordHasher.js';
import { ITokenService } from '../application/auth/services/ITokenService.js';
import { GetCurrentUserUseCase } from '../application/auth/usecases/GetCurrentUserUseCase.js';
import { LoginUserUseCase } from '../application/auth/usecases/LoginUserUseCase.js';
import { LogoutUserUseCase } from '../application/auth/usecases/LogoutUserUseCase.js';
import { RefreshTokenUseCase } from '../application/auth/usecases/RefreshTokenUseCase.js';
import { RegisterUserUseCase } from '../application/auth/usecases/RegisterUserUseCase.js';
import { IDatabase } from '../application/contracts_db/DatabaseContracts.js';
import { GetUserProfileUseCase } from '../application/profile/usecases/GetUserProfileUseCase.js';
import { CreateUserWorkoutUseCase } from '../application/workouts/CreateUserWorkoutUseCase.js';

export function createUseCases(
    database: IDatabase,
    passwordHasher: IPasswordHasher,
    tokenService: ITokenService
) {
    return {
        registerUser: new RegisterUserUseCase(
            database,
            passwordHasher,
            tokenService
        ),

        loginUser: new LoginUserUseCase(database, passwordHasher, tokenService),

        logoutUser: new LogoutUserUseCase(database, tokenService),

        refreshToken: new RefreshTokenUseCase(database, tokenService),

        getCurrentUser: new GetCurrentUserUseCase(database),

        createUserWorkout: new CreateUserWorkoutUseCase(database),

        getUserProfile: new GetUserProfileUseCase(database)
    };
}
