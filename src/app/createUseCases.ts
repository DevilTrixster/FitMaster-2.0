import { IDatabase } from '../application/ports/database/IDatabase.js';
import { IPasswordHasher } from '../application/users/auth/services/IPasswordHasher.js';
import { ITokenService } from '../application/users/auth/services/ITokenService.js';
import { GetCurrentUserUseCase } from '../application/users/auth/usecases/GetCurrentUserUseCase.js';
import { LoginUserUseCase } from '../application/users/auth/usecases/LoginUserUseCase.js';
import { LogoutUserUseCase } from '../application/users/auth/usecases/LogoutUserUseCase.js';
import { RefreshTokenUseCase } from '../application/users/auth/usecases/RefreshTokenUseCase.js';
import { RegisterUserUseCase } from '../application/users/auth/usecases/RegisterUserUseCase.js';
import { GetUserProfileUseCase } from '../application/users/profile/usecases/GetUserProfileUseCase.js';
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
