import {
    ExerciseNotFoundError,
    InactiveExerciseError,
    UserWorkoutNotFoundError,
    UserWorkoutExerciseNotFoundError,
    InvalidWorkoutExerciseAdaptationError
} from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IUpdateUserWorkoutExerciseUseCase } from '../Contracts.js';
import { UpdateUserWorkoutExerciseRequest } from '../DTO.js';
import { updateUserWorkoutExerciseRequestSchema } from '../validation/UpdateUserWorkoutExerciseRequestSchema.js';

export class UpdateUserWorkoutExerciseUseCase implements IUpdateUserWorkoutExerciseUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: UpdateUserWorkoutExerciseRequest) {
        const parsed = updateUserWorkoutExerciseRequestSchema.safeParse(request);

        if (!parsed.success) {
            throw new InvalidWorkoutExerciseAdaptationError(parsed.error);
        }

        return this.database.transaction(async (repositories) => {
            const workoutRepository = repositories.getUserWorkoutRepository();
            const workoutExerciseRepository = repositories.getUserWorkoutExerciseRepository();
            const exerciseRepository = repositories.getExerciseRepository();

            const workout = await workoutRepository.findByIdAndUserId(request.workoutId, userId);

            if (!workout) {
                throw new UserWorkoutNotFoundError(request.workoutId);
            }

            const exercise = await exerciseRepository.findById(request.exerciseId);

            if (!exercise) {
                throw new ExerciseNotFoundError(request.exerciseId);
            }

            if (!exercise.isActive) {
                throw new InactiveExerciseError(request.exerciseId);
            }

            const existing = await workoutExerciseRepository.findByPlannedExercise(
                request.workoutId,
                request.plannedExerciseId
            );

            if (!existing) {
                throw new UserWorkoutExerciseNotFoundError(
                    request.workoutId,
                    request.plannedExerciseId
                );
            }

            const updated = await workoutExerciseRepository.update(
                existing.id!,
                request.exerciseId,
                request.adaptationData
            );

            if (!updated) {
                throw new UserWorkoutExerciseNotFoundError(
                    request.workoutId,
                    request.plannedExerciseId
                );
            }

            return updated;
        });
    }
}
