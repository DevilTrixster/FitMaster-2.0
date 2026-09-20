import { UserWorkoutResult } from '../../../domain/entities/workouts/UserWorkoutResult.js';
import {
    InvalidWorkoutResultError,
    UserWorkoutNotFoundError,
    WorkoutResultAlreadyExistsError
} from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { ICreateUserWorkoutResultUseCase } from '../Contracts.js';
import { workoutResultSchema } from '../validation/WorkoutResultSchema.js';
import { validateAndNormalizeWorkoutResult } from '../validation/validateWorkoutResultAgainstWorkout.js';

export class CreateUserWorkoutResultUseCase implements ICreateUserWorkoutResultUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(
        userId: number,
        workoutId: number,
        actualData: NonNullable<UserWorkoutResult['actualData']>
    ) {
        const parsed = workoutResultSchema.safeParse(actualData);

        if (!parsed.success) {
            throw new InvalidWorkoutResultError(parsed.error);
        }

        return this.database.transaction(async (repositories) => {
            const workoutRepository = repositories.getUserWorkoutRepository();

            const workoutExerciseRepository = repositories.getUserWorkoutExerciseRepository();

            const exerciseRepository = repositories.getExerciseRepository();

            const resultRepository = repositories.getUserWorkoutResultRepository();

            const workout = await workoutRepository.findByIdAndUserId(workoutId, userId);

            if (!workout) {
                throw new UserWorkoutNotFoundError(workoutId);
            }

            const existing = await resultRepository.findByUserWorkoutId(workoutId);

            if (existing) {
                throw new WorkoutResultAlreadyExistsError(workoutId);
            }

            const workoutExercises = await workoutExerciseRepository.findByWorkoutId(workoutId);

            const effectivePlanExerciseIds = workout.workoutPlan.exercises.map(
                (exercise) => exercise.exerciseId
            );

            const workoutExerciseIds = workoutExercises.map((exercise) => exercise.exerciseId);

            const exerciseIds = [...new Set([...effectivePlanExerciseIds, ...workoutExerciseIds])];

            const exercises = await exerciseRepository.findByIds(exerciseIds);

            const normalizedActualData = validateAndNormalizeWorkoutResult(
                parsed.data,
                workout.workoutPlan,
                workoutExercises,
                exercises
            );

            const result = new UserWorkoutResult({
                userWorkoutId: workoutId,
                plannedData: workout.workoutPlan,
                actualData: normalizedActualData
            });

            return resultRepository.create(result);
        });
    }
}
