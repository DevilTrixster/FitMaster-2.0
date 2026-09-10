import { ApplicationError } from '../ApplicationError.js';

export class NicknameAlreadyExistsError extends ApplicationError {
    constructor() {
        super('Nickname is already taken', 'NICKNAME_ALREADY_EXISTS');
    }
}
