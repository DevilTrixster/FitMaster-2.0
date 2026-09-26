import { IPasswordHasher } from '../application/auth/services/IPasswordHasher.js';
import { ITokenService } from '../application/auth/services/ITokenService.js';
import { GetCurrentUserUseCase } from '../application/auth/usecases/GetCurrentUserUseCase.js';
import { LoginUserUseCase } from '../application/auth/usecases/LoginUserUseCase.js';
import { LogoutUserUseCase } from '../application/auth/usecases/LogoutUserUseCase.js';
import { RefreshTokenUseCase } from '../application/auth/usecases/RefreshTokenUseCase.js';
import { RegisterUserUseCase } from '../application/auth/usecases/RegisterUserUseCase.js';
import { IDatabase } from '../application/contracts_db/DatabaseContracts.js';
import { GetExerciseMuscleGroupsUseCase } from '../application/exercises/usecases/GetExerciseMuscleGroupsUseCase.js';
import { GetExerciseUseCase } from '../application/exercises/usecases/GetExerciseUseCase.js';
import { GetMuscleGroupsUseCase } from '../application/exercises/usecases/GetMuscleGroupsUseCase.js';
import { DeleteUserAccountUseCase } from '../application/profile/usecases/DeleteUserAccountUseCase.js';
import { GetUserProfileUseCase } from '../application/profile/usecases/GetUserProfileUseCase.js';
import { UpdateUserProfileUseCase } from '../application/profile/usecases/UpdateUserProfileUseCase.js';
import { CreateUserWorkoutResultUseCase } from '../application/workouts/usecases/CreateUserWorkoutResultUseCase.js';
import { CreateUserWorkoutUseCase } from '../application/workouts/usecases/CreateUserWorkoutUseCase.js';
import { EnsureDefaultUserWorkoutsUseCase } from '../application/workouts/usecases/EnsureDefaultUserWorkoutsUseCase.js';
import { CreateWorkoutPatternUseCase } from '../application/workouts/usecases/CreateWorkoutPatternUseCase.js';
import { GetUserWorkoutExerciseUseCase } from '../application/workouts/usecases/GetUserWorkoutExerciseUseCase.js';
import { GetUserWorkoutResultUseCase } from '../application/workouts/usecases/GetUserWorkoutResultUseCase.js';
import { GetUserWorkoutUseCase } from '../application/workouts/usecases/GetUserWorkoutUseCase.js';
import { GetWorkoutPatternsUseCase } from '../application/workouts/usecases/GetWorkoutPatternsUseCase.js';
import { RescheduleUserWorkoutUseCase } from '../application/workouts/usecases/RescheduleUserWorkoutUseCase.js';
import { UpdateUserWorkoutExerciseUseCase } from '../application/workouts/usecases/UpdateUserWorkoutExerciseUseCase.js';
import { UpdateUserWorkoutResultUseCase } from '../application/workouts/usecases/UpdateUserWorkoutResultUseCase.js';
import { UpdateUserWorkoutStatusUseCase } from '../application/workouts/usecases/UpdateUserWorkoutStatusUseCase.js';

export function createUseCases(
    database: IDatabase,
    passwordHasher: IPasswordHasher,
    tokenService: ITokenService
) {
    return {
        // Auth
        registerUser: new RegisterUserUseCase(database, passwordHasher, tokenService),
        loginUser: new LoginUserUseCase(database, passwordHasher, tokenService),
        logoutUser: new LogoutUserUseCase(database, tokenService),
        refreshToken: new RefreshTokenUseCase(database, tokenService),
        getCurrentUser: new GetCurrentUserUseCase(database),

        // Profile
        getUserProfile: new GetUserProfileUseCase(database),
        updateUserProfile: new UpdateUserProfileUseCase(database),
        deleteUserAccount: new DeleteUserAccountUseCase(database),

        // Exercises
        getExercise: new GetExerciseUseCase(database),
        getExerciseMuscleGroups: new GetExerciseMuscleGroupsUseCase(database),
        getMuscleGroups: new GetMuscleGroupsUseCase(database),

        // Workouts
        createUserWorkout: new CreateUserWorkoutUseCase(database),
        ensureDefaultUserWorkouts: new EnsureDefaultUserWorkoutsUseCase(database),
        getUserWorkout: new GetUserWorkoutUseCase(database),
        updateUserWorkoutStatus: new UpdateUserWorkoutStatusUseCase(database),
        rescheduleUserWorkout: new RescheduleUserWorkoutUseCase(database),

        getUserWorkoutExercise: new GetUserWorkoutExerciseUseCase(database),
        updateUserWorkoutExercise: new UpdateUserWorkoutExerciseUseCase(database),

        getUserWorkoutResult: new GetUserWorkoutResultUseCase(database),
        createUserWorkoutResult: new CreateUserWorkoutResultUseCase(database),
        updateUserWorkoutResult: new UpdateUserWorkoutResultUseCase(database),

        getWorkoutPatterns: new GetWorkoutPatternsUseCase(database),
        createWorkoutPattern: new CreateWorkoutPatternUseCase(database)
    };
}
