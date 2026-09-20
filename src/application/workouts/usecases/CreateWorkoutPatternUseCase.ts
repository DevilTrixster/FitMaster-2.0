import { UserWorkoutPattern } from '../../../domain/entities/workouts/UserWorkoutPattern.js';
import { WorkoutPlan } from '../../../domain/types/workouts/WorkoutPlan.js';
import {
    ExerciseNotFoundError,
    InactiveExerciseError,
    InvalidWorkoutPlanError,
    WorkoutPatternNotFoundError
} from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { ICreateWorkoutPatternUseCase } from '../Contracts.js';
import { CreateWorkoutPatternRequest } from '../DTO.js';
import { workoutPlanSchema } from '../validation/WorkoutPlanSchema.js';

export class CreateWorkoutPatternUseCase implements ICreateWorkoutPatternUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(request: CreateWorkoutPatternRequest) {
        return this.database.transaction(async (repositories) => {
            const patternRepository = repositories.getUserWorkoutPatternRepository();
            const exerciseRepository = repositories.getExerciseRepository();

            const parsedPlan = workoutPlanSchema.safeParse(request.patternData);

            if (!parsedPlan.success) {
                throw new InvalidWorkoutPlanError(parsedPlan.error);
            }

            if (request.parentPatternId) {
                const parent = await patternRepository.findById(request.parentPatternId);

                if (!parent) {
                    throw new WorkoutPatternNotFoundError(request.parentPatternId);
                }
            }

            const workoutPlan = parsedPlan.data as WorkoutPlan;

            const uniqueExerciseIds = [
                ...new Set(workoutPlan.exercises.map((exercise) => exercise.exerciseId))
            ];

            const exercises = await exerciseRepository.findByIds(uniqueExerciseIds);
            const exercisesById = new Map(exercises.map((exercise) => [exercise.id!, exercise]));

            for (const planExercise of workoutPlan.exercises) {
                const exercise = exercisesById.get(planExercise.exerciseId);

                if (!exercise) {
                    throw new ExerciseNotFoundError(planExercise.exerciseId);
                }

                if (!exercise.isActive) {
                    throw new InactiveExerciseError(planExercise.exerciseId);
                }

                planExercise.exerciseName = exercise.name;
            }

            const pattern = new UserWorkoutPattern({
                parentPatternId: request.parentPatternId ?? null,
                name: request.name,
                type: request.type,
                generationSource: request.generationSource,
                patternData: workoutPlan
            });

            return patternRepository.create(pattern);
        });
    }
}
