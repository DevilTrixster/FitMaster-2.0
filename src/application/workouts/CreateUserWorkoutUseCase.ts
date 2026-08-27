import { IDatabase } from '../../infrastructure/database/types/IDatabase.js';
import { UserWorkout } from '../../domain/entities/workouts/UserWorkout.js';
import { UserWorkoutExercise } from '../../domain/entities/workouts/UserWorkoutExercise.js';
import { UserWorkoutStatus } from '../../shared/enum.js';
import { CreateUserWorkoutRequest } from './dto/CreateUserWorkoutRequest.js';
import { ICreateUserWorkoutUseCase } from './ICreateUserWorkoutUseCase.js';
import { workoutPlanSchema } from './validation/WorkoutPlanSchema.js';
import { ExerciseNotFoundError, InactiveExerciseError, InvalidWorkoutPlanError, UserNotFoundError, WorkoutPatternNotFoundError } from '../../shared/errors/index.js'

export class CreateUserWorkoutUseCase implements ICreateUserWorkoutUseCase {

    constructor(private readonly database: IDatabase) {}

    async execute(request: CreateUserWorkoutRequest): Promise<UserWorkout> {

        return this.database.transaction(async (repositories) => {

            const userRepository = repositories.getUserRepository();
            const patternRepository = repositories.getUserWorkoutPatternRepository();
            const exerciseRepository = repositories.getExerciseRepository();
            const userWorkoutRepository = repositories.getUserWorkoutRepository();
            const userWorkoutExerciseRepository = repositories.getUserWorkoutExerciseRepository();
            
            const user = await userRepository.findById(request.userId);

            if (!user) { 
                throw new UserNotFoundError(request.userId); 
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

            const workout =
                new UserWorkout({
                    userId: user.id!,
                    patternId: pattern.id!,
                    status: UserWorkoutStatus.Planned,
                    workoutPlan: parsedPlan.data,
                    originalScheduledAt: request.scheduledAt,
                    scheduledAt: request.scheduledAt,
                });

            const createdWorkout = await userWorkoutRepository.create(workout);

            for (const exercise of parsedPlan.data.exercises) {

                await userWorkoutExerciseRepository.create(
                    new UserWorkoutExercise({
                        userWorkoutId: createdWorkout.id!,
                        plannedExerciseId: exercise.exerciseId,
                        exerciseId: exercise.exerciseId,
                        adaptationData: null,
                    })
                );
            }

            return createdWorkout;
        });
    }
}