import { StatusTemplate } from '../StatusTemplate.js';

export const ServerErrorStatuses = Object.freeze({
    INTERNAL_SERVER_ERROR: new StatusTemplate(
        500,
        'INTERNAL_SERVER_ERROR',
        'Internal server error'
    ),
    BAD_GATEWAY: new StatusTemplate(502, 'BAD_GATEWAY', 'Bad gateway'),
    SERVICE_UNAVAILABLE: new StatusTemplate(
        503,
        'SERVICE_UNAVAILABLE',
        'Service temporarily unavailable'
    )
});
