import { ApplicationError } from '../ApplicationError.js';

export class InvalidCredentialsError extends ApplicationError {
    constructor() {
        super('Invalid email or password', 'INVALID_CREDENTIALS');
    }
}
