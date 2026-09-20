import { SuccessStatuses } from '../../shared/statuses/index.js';
import { Response } from 'express';
import { z } from 'zod';

import {
    ICreateUserWorkoutResultUseCase,
    ICreateUserWorkoutUseCase,
    IGetUserWorkoutExerciseUseCase,
    IGetUserWorkoutResultUseCase,
    IGetUserWorkoutUseCase,
    IRescheduleUserWorkoutUseCase,
    IUpdateUserWorkoutExerciseUseCase,
    IUpdateUserWorkoutResultUseCase,
    IUpdateUserWorkoutStatusUseCase
} from '../../application/workouts/Contracts.js';
import {
    CreateUserWorkoutRequest,
    GetUserWorkoutExerciseRequest,
    GetUserWorkoutRequest,
    GetUserWorkoutResultRequest,
    UpdateUserWorkoutExerciseRequest,
    UpdateUserWorkoutStatusRequest
} from '../../application/workouts/DTO.js';
import { createUserWorkoutRequestSchema } from '../../application/workouts/validation/CreateUserWorkoutRequestSchema.js';
import { getUserWorkoutByIdRequestSchema } from '../../application/workouts/validation/GetUserWorkoutRequestSchema.js';
import { getUserWorkoutsByDateRangeRequestSchema } from '../../application/workouts/validation/GetUserWorkoutRequestSchema.js';
import { getUserWorkoutResultRequestSchema } from '../../application/workouts/validation/GetUserWorkoutResultRequestSchema.js';
import { getUserWorkoutResultsRequestSchema } from '../../application/workouts/validation/GetUserWorkoutResultRequestSchema.js';
import { rescheduleUserWorkoutRequestSchema } from '../../application/workouts/validation/RescheduleUserWorkoutRequestSchema.js';
import { updateUserWorkoutExerciseRequestSchema } from '../../application/workouts/validation/UpdateUserWorkoutExerciseRequestSchema.js';
import { updateUserWorkoutStatusRequestSchema } from '../../application/workouts/validation/UpdateUserWorkoutStatusRequestSchema.js';
import { workoutResultSchema } from '../../application/workouts/validation/WorkoutResultSchema.js';
import {
    UserWorkoutExerciseNotFoundError,
    UserWorkoutNotFoundError,
    UserWorkoutResultNotFoundError
} from '../../shared/errors/index.js';
import { AuthenticatedRequest } from '../IAuthenticatedRequest.js';

const workoutExerciseParamsSchema = z.object({
    workoutId: z.coerce.number().int().positive(),
    plannedExerciseId: z.coerce.number().int().positive()
});

export class WorkoutController {
    constructor(
        private readonly createUserWorkoutUseCase: ICreateUserWorkoutUseCase,
        private readonly getUserWorkoutUseCase: IGetUserWorkoutUseCase,
        private readonly updateUserWorkoutStatusUseCase: IUpdateUserWorkoutStatusUseCase,
        private readonly rescheduleUserWorkoutUseCase: IRescheduleUserWorkoutUseCase,
        private readonly getUserWorkoutExerciseUseCase: IGetUserWorkoutExerciseUseCase,
        private readonly updateUserWorkoutExerciseUseCase: IUpdateUserWorkoutExerciseUseCase,
        private readonly getUserWorkoutResultUseCase: IGetUserWorkoutResultUseCase,
        private readonly createUserWorkoutResultUseCase: ICreateUserWorkoutResultUseCase,
        private readonly updateUserWorkoutResultUseCase: IUpdateUserWorkoutResultUseCase
    ) {}

    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request: CreateUserWorkoutRequest = createUserWorkoutRequestSchema.parse(req.body);
        const workout = await this.createUserWorkoutUseCase.execute(req.auth.userId, request);

        res.status(SuccessStatuses.CREATED.statusCode).json(workout);
    }

    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
        const parsed = getUserWorkoutByIdRequestSchema.parse({
            workoutId: Number(req.params.workoutId)
        });

        const workoutId = parsed.workoutId;
        const workout = await this.getUserWorkoutUseCase.execute(req.auth.userId, {
            type: 'byId',
            workoutId
        });

        if (!workout) {
            throw new UserWorkoutNotFoundError(workoutId);
        }

        res.status(SuccessStatuses.OK.statusCode).json(workout);
    }

    async getLatest(req: AuthenticatedRequest, res: Response): Promise<void> {
        const workout = await this.getUserWorkoutUseCase.execute(req.auth.userId, {
            type: 'latest'
        });

        res.status(SuccessStatuses.OK.statusCode).json(workout);
    }

    async getByDateRange(req: AuthenticatedRequest, res: Response): Promise<void> {
        const parsed = getUserWorkoutsByDateRangeRequestSchema.parse({
            from: req.query.from,
            to: req.query.to
        });

        const request: GetUserWorkoutRequest = {
            type: 'byDateRange',
            from: parsed.from,
            to: parsed.to
        };

        const workouts = await this.getUserWorkoutUseCase.execute(req.auth.userId, request);
        res.status(SuccessStatuses.OK.statusCode).json(workouts ?? []);
    }

    async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request: UpdateUserWorkoutStatusRequest = updateUserWorkoutStatusRequestSchema.parse({
            workoutId: Number(req.params.workoutId),
            status: req.body.status
        });

        const workout = await this.updateUserWorkoutStatusUseCase.execute(req.auth.userId, request);

        res.status(SuccessStatuses.OK.statusCode).json(workout);
    }

    async reschedule(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request = rescheduleUserWorkoutRequestSchema.parse({
            workoutId: Number(req.params.workoutId),
            scheduledAt: req.body.scheduledAt
        });

        const workout = await this.rescheduleUserWorkoutUseCase.execute(
            req.auth.userId,
            request.workoutId,
            request.scheduledAt
        );

        res.status(SuccessStatuses.OK.statusCode).json(workout);
    }

    async getExercises(req: AuthenticatedRequest, res: Response): Promise<void> {
        const workoutId = getUserWorkoutByIdRequestSchema.parse({
            workoutId: Number(req.params.workoutId)
        }).workoutId;
        const request: GetUserWorkoutExerciseRequest = {
            type: 'byWorkout',
            workoutId
        };

        const exercises = await this.getUserWorkoutExerciseUseCase.execute(
            req.auth.userId,
            request
        );

        res.status(SuccessStatuses.OK.statusCode).json(exercises ?? []);
    }

    async getExercise(req: AuthenticatedRequest, res: Response): Promise<void> {
        const params = workoutExerciseParamsSchema.parse({
            workoutId: req.params.workoutId,
            plannedExerciseId: req.params.plannedExerciseId
        });
        const workoutId = params.workoutId;
        const plannedExerciseId = params.plannedExerciseId;
        const request: GetUserWorkoutExerciseRequest = {
            type: 'byPlannedExercise',
            workoutId,
            plannedExerciseId
        };

        const exercise = await this.getUserWorkoutExerciseUseCase.execute(req.auth.userId, request);

        if (!exercise) {
            throw new UserWorkoutExerciseNotFoundError(workoutId, plannedExerciseId);
        }

        res.status(SuccessStatuses.OK.statusCode).json(exercise);
    }

    async updateExercise(req: AuthenticatedRequest, res: Response): Promise<void> {
        const request: UpdateUserWorkoutExerciseRequest =
            updateUserWorkoutExerciseRequestSchema.parse({
                workoutId: Number(req.params.workoutId),
                plannedExerciseId: Number(req.params.plannedExerciseId),
                exerciseId: req.body.exerciseId,
                adaptationData: req.body.adaptationData
            });

        const exercise = await this.updateUserWorkoutExerciseUseCase.execute(
            req.auth.userId,
            request
        );

        res.status(SuccessStatuses.OK.statusCode).json(exercise);
    }

    async getResult(req: AuthenticatedRequest, res: Response): Promise<void> {
        const parsed = getUserWorkoutResultRequestSchema.parse({
            workoutId: Number(req.params.workoutId)
        });

        const workoutId = parsed.workoutId;
        const result = await this.getUserWorkoutResultUseCase.execute(req.auth.userId, {
            type: 'byWorkout',
            workoutId
        });

        if (!result) {
            throw new UserWorkoutResultNotFoundError(workoutId);
        }

        res.status(SuccessStatuses.OK.statusCode).json(result);
    }

    async getResults(req: AuthenticatedRequest, res: Response): Promise<void> {
        const rawIds = Array.isArray(req.query.workoutIds)
            ? req.query.workoutIds
            : [req.query.workoutIds];

        const workoutIds = rawIds
            .flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
            .map(Number);

        const parsed = getUserWorkoutResultsRequestSchema.parse({ workoutIds });
        const request: GetUserWorkoutResultRequest = {
            type: 'byWorkouts',
            workoutIds: parsed.workoutIds
        };

        const results = await this.getUserWorkoutResultUseCase.execute(req.auth.userId, request);

        res.status(SuccessStatuses.OK.statusCode).json(results ?? []);
    }

    async createResult(req: AuthenticatedRequest, res: Response): Promise<void> {
        const workoutId = getUserWorkoutByIdRequestSchema.parse({
            workoutId: Number(req.params.workoutId)
        }).workoutId;
        const actualData = workoutResultSchema.parse(req.body);

        const result = await this.createUserWorkoutResultUseCase.execute(
            req.auth.userId,
            workoutId,
            actualData
        );

        res.status(SuccessStatuses.CREATED.statusCode).json(result);
    }

    async updateResult(req: AuthenticatedRequest, res: Response): Promise<void> {
        const workoutId = getUserWorkoutByIdRequestSchema.parse({
            workoutId: Number(req.params.workoutId)
        }).workoutId;
        const actualData = workoutResultSchema.parse(req.body);

        const result = await this.updateUserWorkoutResultUseCase.execute(
            req.auth.userId,
            workoutId,
            actualData
        );

        res.status(SuccessStatuses.OK.statusCode).json(result);
    }
}
