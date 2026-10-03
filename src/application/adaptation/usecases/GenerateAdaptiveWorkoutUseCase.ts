import { IExerciseMuscleGroupRepository } from '../../../domain/repositories/IExerciseMuscleGroupRepository.js';
import { UserWorkout } from '../../../domain/entities/workouts/UserWorkout.js';
import { UserWorkoutExercise } from '../../../domain/entities/workouts/UserWorkoutExercise.js';
import { UserWorkoutPattern } from '../../../domain/entities/workouts/UserWorkoutPattern.js';
import { UserWorkoutResult } from '../../../domain/entities/workouts/UserWorkoutResult.js';
import { WorkoutPatternGeneration, WorkoutPatternType } from '../../../shared/enum.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { ICreateWorkoutPatternUseCase } from '../../workouts/Contracts.js';
import { CreateWorkoutPatternRequest } from '../../workouts/DTO.js';
import {
    AdaptationGenerateClientRequest,
    AdaptationProfilePayload,
    AdaptationWorkoutPayload,
    IAdaptationClient,
    IGenerateAdaptiveWorkoutUseCase
} from '../Contracts.js';

interface CatalogItem {
    id: number;
    name: string;
    equipmentType: string;
    muscleGroups: Array<{
        code: string;
        name: string;
        loadRatio: number;
        isPrimary: boolean;
    }>;
}

export class GenerateAdaptiveWorkoutUseCase implements IGenerateAdaptiveWorkoutUseCase {
    constructor(
        private readonly database: IDatabase,
        private readonly adaptationClient: IAdaptationClient,
        private readonly createWorkoutPatternUseCase: ICreateWorkoutPatternUseCase
    ) {}

    async execute(userId: number, workoutId: number): Promise<UserWorkoutPattern> {
        const payload = await this.buildRequest(userId, workoutId);
        const response = await this.adaptationClient.generate(payload);

        if (response.userId !== userId) {
            throw new Error('AI service returned an unexpected userId');
        }

        const patternRequest: CreateWorkoutPatternRequest = {
            parentPatternId: payload.workout.patternId,
            name: response.generatedWorkout.name,
            type: WorkoutPatternType.Adaptive,
            generationSource: WorkoutPatternGeneration.Adaptation,
            patternData: response.generatedWorkout.workoutPlan
        };

        return this.createWorkoutPatternUseCase.execute(patternRequest);
    }

    private async buildRequest(
        userId: number,
        workoutId: number
    ): Promise<AdaptationGenerateClientRequest> {
        return this.database.transaction(async (repositories) => {
            const userRepository = repositories.getUserRepository();
            const workoutRepository = repositories.getUserWorkoutRepository();
            const workoutExerciseRepository = repositories.getUserWorkoutExerciseRepository();
            const resultRepository = repositories.getUserWorkoutResultRepository();
            const exerciseRepository = repositories.getExerciseRepository();
            const exerciseMuscleGroupRepository = repositories.getExerciseMuscleGroupRepository();
            const muscleGroupRepository = repositories.getMuscleGroupRepository();

            const user = await userRepository.findById(userId);
            if (!user) throw new Error(`User ${userId} not found for adaptation`);

            const workout = await workoutRepository.findByIdAndUserId(workoutId, userId);
            if (!workout) throw new Error(`Workout ${workoutId} not found for adaptation`);

            const currentResult = await resultRepository.findByUserWorkoutId(workoutId);
            if (!currentResult?.actualData) {
                throw new Error(`Workout result for ${workoutId} is not available for adaptation`);
            }

            const from = new Date(user.createdAt);
            const to = new Date();
            const completedWorkouts = await workoutRepository.findCompletedByUserIdAndDateRange(
                userId,
                from,
                to
            );
            const completedWorkoutIds = completedWorkouts
                .map((item) => item.id)
                .filter((id): id is number => id !== undefined);
            const historicalResults = await resultRepository.findByUserWorkoutIds(completedWorkoutIds);
            const resultsByWorkoutId = new Map(
                historicalResults.map((item) => [item.userWorkoutId, item])
            );

            const workoutExerciseEntries = await Promise.all(
                completedWorkoutIds.map(async (id) => [
                    id,
                    await workoutExerciseRepository.findByWorkoutId(id)
                ] as const)
            );
            const workoutExercisesByWorkoutId = new Map(workoutExerciseEntries);

            const historicalExerciseIds = new Set<number>();
            for (const historicalWorkout of completedWorkouts) {
                for (const item of historicalWorkout.workoutPlan.exercises) {
                    historicalExerciseIds.add(item.exerciseId);
                }
                const historicalResult = resultsByWorkoutId.get(historicalWorkout.id!);
                for (const item of historicalResult?.actualData?.exercises ?? []) {
                    historicalExerciseIds.add(item.exerciseId);
                }
                for (const item of workoutExercisesByWorkoutId.get(historicalWorkout.id!) ?? []) {
                    historicalExerciseIds.add(item.exerciseId);
                    historicalExerciseIds.add(item.plannedExerciseId);
                }
            }

            for (const item of workout.workoutPlan.exercises) {
                historicalExerciseIds.add(item.exerciseId);
            }
            for (const item of currentResult.actualData.exercises) {
                historicalExerciseIds.add(item.exerciseId);
            }

            const activeExercises = await exerciseRepository.findAllActive();
            for (const item of activeExercises) historicalExerciseIds.add(item.id!);

            const catalogExercises = await exerciseRepository.findByIds([...historicalExerciseIds]);
            const muscleGroups = await muscleGroupRepository.findAll();
            const muscleGroupsById = new Map(muscleGroups.map((group) => [group.id!, group]));
            const exerciseMuscleGroups = await this.loadMuscleGroups(
                exerciseMuscleGroupRepository,
                [...historicalExerciseIds]
            );
            const catalogById = this.buildCatalog(
                catalogExercises,
                exerciseMuscleGroups,
                muscleGroupsById
            );

            const activeCatalog = activeExercises
                .map((exercise) => catalogById.get(exercise.id!))
                .filter((item): item is CatalogItem => Boolean(item));

            const profile = this.buildProfile(user);
            const currentWorkout = this.buildWorkoutPayload(
                workout,
                currentResult,
                await workoutExerciseRepository.findByWorkoutId(workoutId),
                activeCatalog
            );

            const history = completedWorkouts
                .filter((item) => item.id !== workoutId)
                .map((historicalWorkout) => {
                    const result = resultsByWorkoutId.get(historicalWorkout.id!);
                    if (!result?.actualData) return null;
                    const catalog = this.buildHistoricalCatalog(
                        historicalWorkout,
                        result,
                        workoutExercisesByWorkoutId.get(historicalWorkout.id!) ?? [],
                        catalogById
                    );
                    return this.buildWorkoutPayload(
                        historicalWorkout,
                        result,
                        workoutExercisesByWorkoutId.get(historicalWorkout.id!) ?? [],
                        catalog
                    );
                })
                .filter((item): item is AdaptationWorkoutPayload => item !== null);

            return {
                profile,
                workout: currentWorkout,
                history
            };
        });
    }

    private buildProfile(user: {
        id?: number;
        nickname: string;
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        gender: string;
        height: number;
        weight: number;
        avatarUrl: string | null;
        preferredWorkoutTime: string;
        preferredDays: number[];
        experienceLevel: string;
        fitnessGoal: string;
        createdAt: Date;
        updatedAt: Date;
    }): AdaptationProfilePayload {
        return {
            id: user.id!,
            nickname: user.nickname,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            avatarUrl: user.avatarUrl,
            preferredWorkoutTime: user.preferredWorkoutTime,
            preferredDays: user.preferredDays,
            experienceLevel: user.experienceLevel,
            fitnessGoal: user.fitnessGoal,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    private buildWorkoutPayload(
        workout: UserWorkout,
        result: UserWorkoutResult,
        workoutExercises: UserWorkoutExercise[],
        exerciseCatalog: CatalogItem[]
    ): AdaptationWorkoutPayload {
        if (!workout.id || !result.actualData) {
            throw new Error('Workout payload requires persisted workout and result');
        }

        return {
            userId: workout.userId,
            sourceWorkoutId: workout.id,
            patternId: workout.patternId,
            status: workout.status,
            originalScheduledAt: workout.originalScheduledAt,
            scheduledAt: workout.scheduledAt,
            startedAt: workout.startedAt,
            completedAt: workout.completedAt,
            plannedData: workout.workoutPlan,
            actualData: result.actualData,
            replacements: workoutExercises.map((item) => ({
                plannedExerciseId: item.plannedExerciseId,
                exerciseId: item.exerciseId,
                adaptationData: item.adaptationData
            })),
            exerciseCatalog
        };
    }

    private buildHistoricalCatalog(
        workout: UserWorkout,
        result: UserWorkoutResult,
        workoutExercises: UserWorkoutExercise[],
        catalogById: Map<number, CatalogItem>
    ): CatalogItem[] {
        const ids = new Set<number>();
        for (const item of workout.workoutPlan.exercises) ids.add(item.exerciseId);
        for (const item of result.actualData?.exercises ?? []) ids.add(item.exerciseId);
        for (const item of workoutExercises) {
            ids.add(item.plannedExerciseId);
            ids.add(item.exerciseId);
        }
        return [...ids]
            .map((id) => catalogById.get(id))
            .filter((item): item is CatalogItem => Boolean(item));
    }

    private buildCatalog(
        exercises: Array<{
            id?: number;
            name: string;
            equipmentType: string;
        }>,
        relationsByExerciseId: Map<number, Awaited<ReturnType<IExerciseMuscleGroupRepository['findByExerciseId']>>>,
        muscleGroupsById: Map<number, { id?: number; code: string; name: string }>
    ): Map<number, CatalogItem> {
        return new Map(
            exercises.map((exercise) => [
                exercise.id!,
                {
                    id: exercise.id!,
                    name: exercise.name,
                    equipmentType: exercise.equipmentType,
                    muscleGroups: (relationsByExerciseId.get(exercise.id!) ?? [])
                        .map((relation) => {
                            const group = muscleGroupsById.get(relation.muscleGroupId);
                            if (!group) return null;
                            return {
                                code: group.code,
                                name: group.name,
                                loadRatio: relation.loadRatio,
                                isPrimary: relation.isPrimary
                            };
                        })
                        .filter((value): value is NonNullable<typeof value> => value !== null)
                }
            ] as const)
        );
    }

    private async loadMuscleGroups(
        repository: IExerciseMuscleGroupRepository,
        exerciseIds: number[]
    ): Promise<
        Map<number, Awaited<ReturnType<IExerciseMuscleGroupRepository['findByExerciseId']>>>
    > {
        const rows = await Promise.all(
            exerciseIds.map(async (exerciseId) => {
                return [exerciseId, await repository.findByExerciseId(exerciseId)] as const;
            })
        );
        return new Map(rows);
    }
}
