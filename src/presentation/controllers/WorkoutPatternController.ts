import { Request, Response } from 'express';

import { IGetWorkoutPatternsUseCase } from '../../application/workouts/Contracts.js';
import {
    getWorkoutPatternByIdRequestSchema,
    getWorkoutPatternChildrenRequestSchema,
    getWorkoutPatternsByTypeRequestSchema
} from '../../application/workouts/validation/GetWorkoutPatternsRequestSchema.js';
import { WorkoutPatternNotFoundError } from '../../shared/errors/index.js';
import { SuccessStatuses } from '../../shared/statuses/index.js';
import { AuthenticatedRequest } from '../IAuthenticatedRequest.js';

export class WorkoutPatternController {
    constructor(private readonly getWorkoutPatternsUseCase: IGetWorkoutPatternsUseCase) {}

    async getAll(_req: Request, res: Response): Promise<void> {
        const patterns = await this.getWorkoutPatternsUseCase.execute({ type: 'all' });
        res.status(SuccessStatuses.OK.statusCode).json(patterns ?? []);
    }

    async getById(req: Request, res: Response): Promise<void> {
        const parsed = getWorkoutPatternByIdRequestSchema.parse({
            patternId: req.params.patternId
        });

        const pattern = await this.getWorkoutPatternsUseCase.execute({
            type: 'byId',
            patternId: parsed.patternId
        });

        if (!pattern) {
            throw new WorkoutPatternNotFoundError(parsed.patternId);
        }

        res.status(SuccessStatuses.OK.statusCode).json(pattern);
    }

    async getByType(req: Request, res: Response): Promise<void> {
        const parsed = getWorkoutPatternsByTypeRequestSchema.parse({
            patternType: req.params.patternType
        });

        const patterns = await this.getWorkoutPatternsUseCase.execute({
            type: 'byType',
            patternType: parsed.patternType
        });

        res.status(SuccessStatuses.OK.statusCode).json(patterns ?? []);
    }

    async getByParent(req: Request, res: Response): Promise<void> {
        const parsed = getWorkoutPatternChildrenRequestSchema.parse({
            parentPatternId: req.params.parentPatternId
        });

        const patterns = await this.getWorkoutPatternsUseCase.execute({
            type: 'byParent',
            parentPatternId: parsed.parentPatternId
        });

        res.status(SuccessStatuses.OK.statusCode).json(patterns ?? []);
    }
}
