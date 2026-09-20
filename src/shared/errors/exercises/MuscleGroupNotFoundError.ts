import { ApplicationError } from '../ApplicationError.js';

export class MuscleGroupNotFoundError extends ApplicationError {
    constructor(identifier: number | string) {
        const message =
            typeof identifier === 'number'
                ? `Muscle group ${identifier} not found`
                : `Muscle group with code ${identifier} not found`;

        super(message, 'MUSCLE_GROUP_NOT_FOUND');
    }
}
