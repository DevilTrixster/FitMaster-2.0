import { AuthController } from '../presentation/controllers/AuthController.js';
import { ExerciseController } from '../presentation/controllers/ExerciseController.js';
import { ProfileController } from '../presentation/controllers/ProfileController.js';
import { WorkoutController } from '../presentation/controllers/WorkoutController.js';
import { WorkoutPatternController } from '../presentation/controllers/WorkoutPatternController.js';

import { createUseCases } from './createUseCases.js';

type UseCases = ReturnType<typeof createUseCases>;

export function createControllers(useCases: UseCases) {
    return {
        authController: new AuthController(
            useCases.registerUser,
            useCases.loginUser,
            useCases.logoutUser,
            useCases.refreshToken,
            useCases.getCurrentUser
        ),

        profileController: new ProfileController(
            useCases.getUserProfile,
            useCases.updateUserProfile,
            useCases.deleteUserAccount
        ),

        exerciseController: new ExerciseController(
            useCases.getExercise,
            useCases.getExerciseMuscleGroups,
            useCases.getMuscleGroups
        ),

        workoutController: new WorkoutController(
            useCases.createUserWorkout,
            useCases.ensureDefaultUserWorkouts,
            useCases.getUserWorkout,
            useCases.updateUserWorkoutStatus,
            useCases.rescheduleUserWorkout,
            useCases.getUserWorkoutExercise,
            useCases.updateUserWorkoutExercise,
            useCases.getUserWorkoutResult,
            useCases.createUserWorkoutResult,
            useCases.updateUserWorkoutResult
        ),

        workoutPatternController: new WorkoutPatternController(
            useCases.getWorkoutPatterns
        )
    };
}
