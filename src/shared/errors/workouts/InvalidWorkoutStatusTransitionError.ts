import { UserWorkoutStatus } from '../../enum.js';
import { ApplicationError } from '../ApplicationError.js';

export class InvalidWorkoutStatusTransitionError extends ApplicationError {
    constructor(from: UserWorkoutStatus, to: UserWorkoutStatus) {
        super(
            `Cannot change workout status from ${from} to ${to}`,
            'INVALID_WORKOUT_STATUS_TRANSITION'
        );
    }
}
