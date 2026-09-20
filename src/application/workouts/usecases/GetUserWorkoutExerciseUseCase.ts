import { UserWorkoutNotFoundError } from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetUserWorkoutExerciseUseCase } from '../Contracts.js';
import { GetUserWorkoutExerciseRequest } from '../DTO.js';

export class GetUserWorkoutExerciseUseCase implements IGetUserWorkoutExerciseUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: GetUserWorkoutExerciseRequest) {
        return this.database.transaction(async (repositories) => {
            const workoutRepository = repositories.getUserWorkoutRepository();
            const exerciseRepository = repositories.getUserWorkoutExerciseRepository();

            const workout = await workoutRepository.findByIdAndUserId(request.workoutId, userId);

            if (!workout) {
                throw new UserWorkoutNotFoundError(request.workoutId);
            }

            if (request.type === 'byWorkout') {
                return exerciseRepository.findByWorkoutId(request.workoutId);
            }

            return exerciseRepository.findByPlannedExercise(
                request.workoutId,
                request.plannedExerciseId
            );
        });
    }
}
