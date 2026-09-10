import { ApplicationError } from '../ApplicationError.js';

export class InvalidAccessTokenError extends ApplicationError {
    constructor() {
        super('Invalid access token', 'INVALID_ACCESS_TOKEN');
    }
}
