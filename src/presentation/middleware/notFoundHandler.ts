import { ClientErrorStatuses } from '../../shared/statuses/index.js';
import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
    res.status(ClientErrorStatuses.NOT_FOUND.statusCode).json({
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
}
