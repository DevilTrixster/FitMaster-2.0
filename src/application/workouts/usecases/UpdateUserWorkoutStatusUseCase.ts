import { UserWorkoutStatus } from '../../../shared/enum.js';
import {
    InvalidWorkoutStatusTransitionError,
    UserWorkoutNotFoundError
} from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IUpdateUserWorkoutStatusUseCase } from '../Contracts.js';
import { UpdateUserWorkoutStatusRequest } from '../DTO.js';

export class UpdateUserWorkoutStatusUseCase implements IUpdateUserWorkoutStatusUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: UpdateUserWorkoutStatusRequest) {
        return this.database.transaction(async (repositories) => {
            const repository = repositories.getUserWorkoutRepository();
            const workout = await repository.findByIdAndUserId(request.workoutId, userId);

            if (!workout) {
                throw new UserWorkoutNotFoundError(request.workoutId);
            }

            const now = new Date();
            let startedAt = workout.startedAt;
            let completedAt = workout.completedAt;

            switch (request.status) {
                case UserWorkoutStatus.Planned:
                    if (workout.status !== UserWorkoutStatus.Planned) {
                        throw new InvalidWorkoutStatusTransitionError(
                            workout.status,
                            request.status
                        );
                    }
                    startedAt = null;
                    completedAt = null;
                    break;

                case UserWorkoutStatus.InProgress:
                    if (workout.status !== UserWorkoutStatus.Planned) {
                        throw new InvalidWorkoutStatusTransitionError(
                            workout.status,
                            request.status
                        );
                    }
                    startedAt = now;
                    completedAt = null;
                    break;

                case UserWorkoutStatus.Completed:
                    if (workout.status !== UserWorkoutStatus.InProgress) {
                        throw new InvalidWorkoutStatusTransitionError(
                            workout.status,
                            request.status
                        );
                    }
                    if (!startedAt) {
                        startedAt = now;
                    }
                    completedAt = now;
                    break;

                case UserWorkoutStatus.Cancelled:
                    if (
                        workout.status !== UserWorkoutStatus.Planned &&
                        workout.status !== UserWorkoutStatus.InProgress
                    ) {
                        throw new InvalidWorkoutStatusTransitionError(
                            workout.status,
                            request.status
                        );
                    }
                    completedAt = null;
                    break;
            }

            const updatedWorkout = await repository.updateStatus(
                request.workoutId,
                userId,
                request.status,
                startedAt,
                completedAt
            );

            if (!updatedWorkout) {
                throw new UserWorkoutNotFoundError(request.workoutId);
            }

            return updatedWorkout;
        });
    }
}
