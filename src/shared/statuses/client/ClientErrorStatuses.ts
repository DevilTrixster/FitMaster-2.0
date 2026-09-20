import { StatusTemplate } from '../StatusTemplate.js';

export const ClientErrorStatuses = Object.freeze({
    BAD_REQUEST: new StatusTemplate(400, 'BAD_REQUEST', 'The request is invalid'),
    UNAUTHORIZED: new StatusTemplate(401, 'UNAUTHORIZED', 'Authentication is required'),
    FORBIDDEN: new StatusTemplate(403, 'FORBIDDEN', 'Access to this resource is forbidden'),
    NOT_FOUND: new StatusTemplate(404, 'NOT_FOUND', 'The requested resource was not found'),
    CONFLICT: new StatusTemplate(
        409,
        'CONFLICT',
        'The request conflicts with the current resource state'
    ),
    UNPROCESSABLE_ENTITY: new StatusTemplate(
        422,
        'UNPROCESSABLE_ENTITY',
        'The request contains semantically invalid data'
    )
});
