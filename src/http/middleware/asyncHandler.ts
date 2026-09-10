import { NextFunction, Request, Response, RequestHandler } from 'express';

export function asyncHandler<TRequest extends Request = Request>(
    handler: (req: TRequest, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(handler(req as TRequest, res, next)).catch(next);
    };
}
