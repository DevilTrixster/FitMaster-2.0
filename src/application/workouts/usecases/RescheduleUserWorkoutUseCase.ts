import { UserWorkoutStatus } from '../../../shared/enum.js';
import {
    InvalidWorkoutRescheduleError,
    UserWorkoutNotFoundError
} from '../../../shared/errors/index.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IRescheduleUserWorkoutUseCase } from '../Contracts.js';

export class RescheduleUserWorkoutUseCase implements IRescheduleUserWorkoutUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, workoutId: number, scheduledAt: Date) {
        return this.database.transaction(async (repositories) => {
            const repository = repositories.getUserWorkoutRepository();
            const workout = await repository.findByIdAndUserId(workoutId, userId);

            if (!workout) {
                throw new UserWorkoutNotFoundError(workoutId);
            }

            // Переносить можно только запланированную тренировку
            if (workout.status !== UserWorkoutStatus.Planned) {
                throw new InvalidWorkoutRescheduleError(workout.status);
            }

            const updatedWorkout = await repository.reschedule(workoutId, userId, scheduledAt);

            if (!updatedWorkout) {
                throw new UserWorkoutNotFoundError(workoutId);
            }

            return updatedWorkout;
        });
    }
}
