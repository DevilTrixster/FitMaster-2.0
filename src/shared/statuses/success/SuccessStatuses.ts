import { StatusTemplate } from '../StatusTemplate.js';

export const SuccessStatuses = Object.freeze({
    OK: new StatusTemplate(200, 'OK', 'Request completed successfully'),
    CREATED: new StatusTemplate(201, 'CREATED', 'Resource created successfully'),
    NO_CONTENT: new StatusTemplate(204, 'NO_CONTENT', 'Request completed successfully')
});
