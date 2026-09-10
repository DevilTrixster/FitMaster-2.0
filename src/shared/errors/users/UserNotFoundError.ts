import { ApplicationError } from '../ApplicationError.js';

export class UserNotFoundError extends ApplicationError {
    constructor(userId: number) {
        super(`User ${userId} not found`, 'USER_NOT_FOUND');
    }
}
