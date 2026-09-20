import { ZodError } from 'zod';

import { ApplicationError } from '../ApplicationError.js';

export class ValidationError extends ApplicationError {
    constructor(public readonly validationError: ZodError) {
        super('Request validation failed', 'VALIDATION_ERROR');
    }
}
