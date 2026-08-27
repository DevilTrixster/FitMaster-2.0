import { ApplicationError } from '../ApplicationError.js';

export class EmailAlreadyExistsError extends ApplicationError {
    constructor() {
        super(
            'Email is already registered',
            'EMAIL_ALREADY_EXISTS'
        );
    }
}