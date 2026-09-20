import { UserWorkoutNotFoundError } from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetUserWorkoutResultUseCase } from '../Contracts.js';
import { GetUserWorkoutResultRequest } from '../DTO.js';

export class GetUserWorkoutResultUseCase implements IGetUserWorkoutResultUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: GetUserWorkoutResultRequest) {
        return this.database.transaction(async (repositories) => {
            const workoutRepository = repositories.getUserWorkoutRepository();
            const resultRepository = repositories.getUserWorkoutResultRepository();

            if (request.type === 'byWorkout') {
                const workout = await workoutRepository.findByIdAndUserId(
                    request.workoutId,
                    userId
                );

                if (!workout) {
                    throw new UserWorkoutNotFoundError(request.workoutId);
                }

                return resultRepository.findByUserWorkoutId(request.workoutId);
            }

            if (request.workoutIds.length === 0) {
                return [];
            }

            for (const workoutId of request.workoutIds) {
                const workout = await workoutRepository.findByIdAndUserId(workoutId, userId);

                if (!workout) {
                    throw new UserWorkoutNotFoundError(workoutId);
                }
            }

            return resultRepository.findByUserWorkoutIds(request.workoutIds);
        });
    }
}
