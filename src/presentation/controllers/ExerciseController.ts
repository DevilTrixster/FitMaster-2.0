import { Request, Response } from 'express';

import {
    IGetExerciseMuscleGroupsUseCase,
    IGetExerciseUseCase,
    IGetMuscleGroupsUseCase
} from '../../application/exercises/Contracts.js';
import {
    GetExerciseMuscleGroupsRequest,
    GetExerciseRequest,
    GetMuscleGroupsRequest
} from '../../application/exercises/DTO.js';
import {
    getExerciseByIdRequestSchema,
    getExerciseByNameRequestSchema,
    getExercisesByIdsRequestSchema,
    getMuscleGroupByCodeRequestSchema,
    getMuscleGroupByIdRequestSchema,
    getMuscleGroupChildrenRequestSchema,
    searchExercisesRequestSchema
} from '../../application/exercises/Validation.js';
import { ExerciseNotFoundError, MuscleGroupNotFoundError } from '../../shared/errors/index.js';
import { SuccessStatuses } from '../../shared/statuses/index.js';

export class ExerciseController {
    constructor(
        private readonly getExerciseUseCase: IGetExerciseUseCase,
        private readonly getExerciseMuscleGroupsUseCase: IGetExerciseMuscleGroupsUseCase,
        private readonly getMuscleGroupsUseCase: IGetMuscleGroupsUseCase
    ) {}

    async getAllActive(_req: Request, res: Response): Promise<void> {
        const exercises = await this.getExerciseUseCase.execute({ type: 'allActive' });
        res.status(SuccessStatuses.OK.statusCode).json(exercises ?? []);
    }

    async search(req: Request, res: Response): Promise<void> {
        const parsed = searchExercisesRequestSchema.parse({ search: req.query.search });
        const request: GetExerciseRequest = { type: 'search', search: parsed.search };

        const exercises = await this.getExerciseUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(exercises ?? []);
    }

    async getById(req: Request, res: Response): Promise<void> {
        const parsed = getExerciseByIdRequestSchema.parse({
            exerciseId: Number(req.params.exerciseId)
        });
        const request: GetExerciseRequest = { type: 'byId', exerciseId: parsed.exerciseId };

        const exercise = await this.getExerciseUseCase.execute(request);

        if (!exercise) {
            throw new ExerciseNotFoundError(parsed.exerciseId);
        }

        res.status(SuccessStatuses.OK.statusCode).json(exercise);
    }

    async getByName(req: Request, res: Response): Promise<void> {
        const parsed = getExerciseByNameRequestSchema.parse({ name: req.query.name });
        const request: GetExerciseRequest = { type: 'byName', name: parsed.name };

        const exercise = await this.getExerciseUseCase.execute(request);

        if (!exercise) {
            throw new ExerciseNotFoundError(parsed.name);
        }

        res.status(SuccessStatuses.OK.statusCode).json(exercise);
    }

    async getByIds(req: Request, res: Response): Promise<void> {
        const rawIds = Array.isArray(req.query.exerciseIds)
            ? req.query.exerciseIds
            : [req.query.exerciseIds];

        const exerciseIds = rawIds
            .flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
            .map(Number);

        const parsed = getExercisesByIdsRequestSchema.parse({ exerciseIds });
        const request: GetExerciseRequest = { type: 'byIds', exerciseIds: parsed.exerciseIds };

        const exercises = await this.getExerciseUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(exercises ?? []);
    }

    async getMuscleGroupsByExercise(req: Request, res: Response): Promise<void> {
        const parsed = getExerciseByIdRequestSchema.parse({
            exerciseId: Number(req.params.exerciseId)
        });

        const request: GetExerciseMuscleGroupsRequest = {
            type: 'byExercise',
            exerciseId: parsed.exerciseId
        };

        const groups = await this.getExerciseMuscleGroupsUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(groups ?? []);
    }

    async getPrimaryMuscleGroupByExercise(req: Request, res: Response): Promise<void> {
        const parsed = getExerciseByIdRequestSchema.parse({
            exerciseId: Number(req.params.exerciseId)
        });

        const request: GetExerciseMuscleGroupsRequest = {
            type: 'primaryByExercise',
            exerciseId: parsed.exerciseId
        };

        const group = await this.getExerciseMuscleGroupsUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(group);
    }

    async getExercisesByMuscleGroup(req: Request, res: Response): Promise<void> {
        const parsed = getMuscleGroupByIdRequestSchema.parse({
            muscleGroupId: Number(req.params.muscleGroupId)
        });

        const request: GetExerciseMuscleGroupsRequest = {
            type: 'byMuscleGroup',
            muscleGroupId: parsed.muscleGroupId
        };

        const exercises = await this.getExerciseMuscleGroupsUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(exercises ?? []);
    }

    async getAllMuscleGroups(_req: Request, res: Response): Promise<void> {
        const request: GetMuscleGroupsRequest = { type: 'all' };
        const groups = await this.getMuscleGroupsUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(groups ?? []);
    }

    async getRootMuscleGroups(_req: Request, res: Response): Promise<void> {
        const request: GetMuscleGroupsRequest = { type: 'root' };
        const groups = await this.getMuscleGroupsUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(groups ?? []);
    }

    async getMuscleGroupById(req: Request, res: Response): Promise<void> {
        const parsed = getMuscleGroupByIdRequestSchema.parse({
            muscleGroupId: Number(req.params.muscleGroupId)
        });
        const request: GetMuscleGroupsRequest = {
            type: 'byId',
            muscleGroupId: parsed.muscleGroupId
        };

        const group = await this.getMuscleGroupsUseCase.execute(request);

        if (!group) {
            throw new MuscleGroupNotFoundError(parsed.muscleGroupId);
        }

        res.status(SuccessStatuses.OK.statusCode).json(group);
    }

    async getMuscleGroupByCode(req: Request, res: Response): Promise<void> {
        const parsed = getMuscleGroupByCodeRequestSchema.parse({ code: req.params.code });
        const request: GetMuscleGroupsRequest = { type: 'byCode', code: parsed.code };

        const group = await this.getMuscleGroupsUseCase.execute(request);

        if (!group) {
            throw new MuscleGroupNotFoundError(parsed.code);
        }

        res.status(SuccessStatuses.OK.statusCode).json(group);
    }

    async getMuscleGroupChildren(req: Request, res: Response): Promise<void> {
        const parsed = getMuscleGroupChildrenRequestSchema.parse({
            parentId: Number(req.params.muscleGroupId)
        });
        const request: GetMuscleGroupsRequest = {
            type: 'children',
            parentId: parsed.parentId
        };

        const groups = await this.getMuscleGroupsUseCase.execute(request);
        res.status(SuccessStatuses.OK.statusCode).json(groups ?? []);
    }
}
