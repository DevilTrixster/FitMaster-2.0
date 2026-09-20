import { UserWorkout } from '../../../domain/entities/workouts/UserWorkout.js';
import { UserWorkoutExercise } from '../../../domain/entities/workouts/UserWorkoutExercise.js';
import { UserWorkoutStatus } from '../../../shared/enum.js';
import {
    ExerciseNotFoundError,
    InactiveExerciseError,
    InvalidWorkoutPlanError,
    UserNotFoundError,
    WorkoutPatternNotFoundError
} from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { ICreateUserWorkoutUseCase } from '../Contracts.js';
import { CreateUserWorkoutRequest } from '../DTO.js';
import { workoutPlanSchema } from '../validation/WorkoutPlanSchema.js';

export class CreateUserWorkoutUseCase implements ICreateUserWorkoutUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: CreateUserWorkoutRequest): Promise<UserWorkout> {
        return this.database.transaction(async (repositories) => {
            const userRepository = repositories.getUserRepository();
            const patternRepository = repositories.getUserWorkoutPatternRepository();
            const exerciseRepository = repositories.getExerciseRepository();
            const userWorkoutRepository = repositories.getUserWorkoutRepository();
            const userWorkoutExerciseRepository = repositories.getUserWorkoutExerciseRepository();

            // 1. Ищем пользователя по userId из токена (req.auth.userId), а не из body
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new UserNotFoundError(userId);
            }

            const pattern = await patternRepository.findById(request.patternId);
            if (!pattern) {
                throw new WorkoutPatternNotFoundError(request.patternId);
            }

            const parsedPlan = workoutPlanSchema.safeParse(pattern.patternData);
            if (!parsedPlan.success) {
                throw new InvalidWorkoutPlanError(parsedPlan.error);
            }

            for (const exercise of parsedPlan.data.exercises) {
                const exerciseEntity = await exerciseRepository.findById(exercise.exerciseId);
                if (!exerciseEntity) {
                    throw new ExerciseNotFoundError(exercise.exerciseId);
                }
                if (!exerciseEntity.isActive) {
                    throw new InactiveExerciseError(exercise.exerciseId);
                }
            }

            const workout = new UserWorkout({
                // 2. Используем userId из аргументов (из auth), а не из request или user.id
                userId: userId,
                patternId: pattern.id!,
                status: UserWorkoutStatus.Planned,
                workoutPlan: parsedPlan.data,
                originalScheduledAt: request.scheduledAt,
                scheduledAt: request.scheduledAt
            });

            const createdWorkout = await userWorkoutRepository.create(workout);

            for (const exercise of parsedPlan.data.exercises) {
                await userWorkoutExerciseRepository.create(
                    new UserWorkoutExercise({
                        userWorkoutId: createdWorkout.id!,
                        plannedExerciseId: exercise.exerciseId,
                        exerciseId: exercise.exerciseId,
                        adaptationData: null
                    })
                );
            }

            return createdWorkout;
        });
    }
}
