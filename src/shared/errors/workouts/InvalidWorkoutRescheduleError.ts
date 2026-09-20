import { UserWorkoutStatus } from '../../enum.js';
import { ApplicationError } from '../ApplicationError.js';

export class InvalidWorkoutRescheduleError extends ApplicationError {
    constructor(status: UserWorkoutStatus) {
        super(`Workout with status ${status} cannot be rescheduled`, 'INVALID_WORKOUT_RESCHEDULE');
    }
}
