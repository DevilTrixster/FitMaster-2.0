import { ApplicationError } from '../ApplicationError.js';

export class InvalidRefreshTokenError extends ApplicationError {
    constructor() {
        super('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
}
