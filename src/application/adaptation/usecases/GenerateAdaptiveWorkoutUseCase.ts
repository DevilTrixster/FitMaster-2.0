import { IExerciseMuscleGroupRepository } from '../../../domain/repositories/IExerciseMuscleGroupRepository.js';
import { UserWorkout } from '../../../domain/entities/workouts/UserWorkout.js';
import { UserWorkoutExercise } from '../../../domain/entities/workouts/UserWorkoutExercise.js';
import { UserWorkoutPattern } from '../../../domain/entities/workouts/UserWorkoutPattern.js';
import { UserWorkoutResult } from '../../../domain/entities/workouts/UserWorkoutResult.js';
import {
    UserWorkoutStatus,
    WorkoutPatternGeneration,
    WorkoutPatternType
} from '../../../shared/enum.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { ICreateUserWorkoutUseCase, ICreateWorkoutPatternUseCase } from '../../workouts/Contracts.js';
import { CreateUserWorkoutRequest, CreateWorkoutPatternRequest } from '../../workouts/DTO.js';
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
        private readonly createWorkoutPatternUseCase: ICreateWorkoutPatternUseCase,
        private readonly createUserWorkoutUseCase: ICreateUserWorkoutUseCase
    ) {}

    async execute(userId: number, workoutId: number): Promise<UserWorkoutPattern> {
        const payload = await this.buildRequest(userId, workoutId);
        const response = await this.adaptationClient.generate(payload);

        if (response.userId !== userId) {
            throw new Error('AI service returned an unexpected userId');
        }

        const scheduledAt = await this.findNextAdaptiveWorkoutDate(
            userId,
            payload.profile.preferredDays,
            payload.profile.preferredWorkoutTime
        );

        const patternRequest: CreateWorkoutPatternRequest = {
            parentPatternId: payload.workout.patternId,
            name: response.generatedWorkout.name,
            type: WorkoutPatternType.Adaptive,
            generationSource: WorkoutPatternGeneration.Adaptation,
            patternData: response.generatedWorkout.workoutPlan
        };

        const pattern = await this.createWorkoutPatternUseCase.execute(patternRequest);
        if (!pattern.id) {
            throw new Error('Adaptive workout pattern was saved without an id');
        }

        const workoutRequest: CreateUserWorkoutRequest = {
            patternId: pattern.id,
            scheduledAt
        };
        await this.createUserWorkoutUseCase.execute(userId, workoutRequest);

        return pattern;
    }

    private async findNextAdaptiveWorkoutDate(
        userId: number,
        preferredDays: number[],
        preferredWorkoutTime: string
    ): Promise<Date> {
        if (preferredDays.length === 0) {
            throw new Error(`User ${userId} has no preferred workout days`);
        }

        const [hours, minutes] = preferredWorkoutTime.split(':').map(Number);
        if (
            !Number.isInteger(hours) ||
            !Number.isInteger(minutes) ||
            hours < 0 || hours > 23 || minutes < 0 || minutes > 59
        ) {
            throw new Error(`Invalid preferred workout time: ${preferredWorkoutTime}`);
        }

        const now = new Date();
        const rangeStart = new Date(now);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeEnd.getDate() + 366);

        const scheduledWorkouts = await this.database.transaction((repositories) =>
            repositories
                .getUserWorkoutRepository()
                .findByUserIdAndDateRange(userId, rangeStart, rangeEnd)
        );

        // A date already shown in the calendar is reserved even if its workout was cancelled.
        // This avoids putting two workout cards on the same calendar day.
        const occupiedDays = new Set(
            scheduledWorkouts.map((workout) => {
                const date = new Date(workout.scheduledAt);
                return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            })
        );

        for (let offset = 0; offset <= 366; offset += 1) {
            const candidate = new Date(rangeStart);
            candidate.setDate(candidate.getDate() + offset);

            const weekday = candidate.getDay() === 0 ? 7 : candidate.getDay();
            if (!preferredDays.includes(weekday)) continue;

            candidate.setHours(hours, minutes, 0, 0);
            if (candidate <= now) continue;

            const dayKey = `${candidate.getFullYear()}-${candidate.getMonth()}-${candidate.getDate()}`;
            if (occupiedDays.has(dayKey)) continue;

            return candidate;
        }

        throw new Error(`Could not find a free preferred workout day for user ${userId}`);
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
            if (workout.status !== UserWorkoutStatus.Completed) {
                throw new Error(`Workout ${workoutId} must be completed before adaptation`);
            }

            const currentResult = await resultRepository.findByUserWorkoutId(workoutId);
            if (!currentResult?.actualData) {
                throw new Error(`Workout result for ${workoutId} is not available for adaptation`);
            }

            const from = new Date(user.createdAt);
            const to = new Date();
            const allCompletedWorkouts = await workoutRepository.findCompletedByUserIdAndDateRange(
                userId,
                from,
                to
            );
            // The AI uses recent history; sending every workout since registration
            // only grows the request and delays generation. Keep the latest 9,
            // including the workout just completed (up to 8 previous sessions).
            const completedWorkouts = [...allCompletedWorkouts]
                .sort((a, b) => {
                    const dateA = new Date(a.completedAt ?? a.scheduledAt).getTime();
                    const dateB = new Date(b.completedAt ?? b.scheduledAt).getTime();
                    return dateB - dateA;
                })
                .slice(0, 9)
                .sort((a, b) => {
                    const dateA = new Date(a.completedAt ?? a.scheduledAt).getTime();
                    const dateB = new Date(b.completedAt ?? b.scheduledAt).getTime();
                    return dateA - dateB;
                });
            const completedWorkoutIds = completedWorkouts
                .map((item) => item.id)
                .filter((id): id is number => id !== undefined);
            const historicalResults = await resultRepository.findByUserWorkoutIds(completedWorkoutIds);
            const resultsByWorkoutId = new Map(
                historicalResults.map((item) => [item.userWorkoutId, item])
            );

            // All repositories in this transaction share one PoolClient. Do not run
            // queries concurrently on that client; pg queues them and emits a warning.
            const workoutExercisesByWorkoutId = new Map<
                number,
                Awaited<ReturnType<typeof workoutExerciseRepository.findByWorkoutId>>
            >();
            for (const id of completedWorkoutIds) {
                const exercises = await workoutExerciseRepository.findByWorkoutId(id);
                workoutExercisesByWorkoutId.set(id, exercises);
            }

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
            // Give the model alternatives for the same target muscles instead of
            // sending the entire active exercise catalog on every generation.
            currentWorkout.exerciseCatalog = this.selectRelevantCatalog(
                currentWorkout,
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

    private selectRelevantCatalog(
        workout: AdaptationWorkoutPayload,
        catalog: CatalogItem[]
    ): CatalogItem[] {
        const workoutExerciseIds = new Set<number>([
            ...workout.plannedData.exercises.map((item) => item.exerciseId),
            ...workout.actualData.exercises.map((item) => item.exerciseId),
            ...workout.replacements.map((item) => item.exerciseId)
        ]);

        const targetMuscles = new Set<string>();
        for (const item of catalog) {
            if (!workoutExerciseIds.has(item.id)) continue;
            for (const muscle of item.muscleGroups) {
                if (muscle.isPrimary || muscle.loadRatio >= 0.25) {
                    targetMuscles.add(muscle.code);
                }
            }
        }

        const scored = catalog
            .map((item) => {
                const muscleScore = item.muscleGroups.reduce((score, muscle) => {
                    if (!targetMuscles.has(muscle.code)) return score;
                    return score + muscle.loadRatio + (muscle.isPrimary ? 1.5 : 0);
                }, 0);
                const alreadyUsed = workoutExerciseIds.has(item.id);
                return {
                    item,
                    score: muscleScore + (alreadyUsed ? 100 : 0)
                };
            })
            .filter((entry) => entry.score > 0)
            .sort((a, b) => b.score - a.score || a.item.id - b.item.id);

        // Preserve every exercise from the source/result even if its muscle
        // metadata is incomplete, then cap the alternatives sent to the model so the prompt fits common free-model context limits.
        const selected = scored.slice(0, 24).map((entry) => entry.item);
        if (selected.length === 0) {
            // Keep the request valid if old/inactive exercises have no current
            // muscle metadata in the active catalog.
            selected.push(...catalog.slice(0, 24));
        }
        const selectedIds = new Set(selected.map((item) => item.id));
        for (const item of catalog) {
            if (workoutExerciseIds.has(item.id) && !selectedIds.has(item.id)) {
                selected.push(item);
                selectedIds.add(item.id);
            }
        }

        return selected;
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
        // The repository belongs to the same transaction-bound PoolClient, so
        // queries must be sequential rather than issued via Promise.all.
        const rows = new Map<
            number,
            Awaited<ReturnType<IExerciseMuscleGroupRepository['findByExerciseId']>>
        >();
        for (const exerciseId of exerciseIds) {
            rows.set(exerciseId, await repository.findByExerciseId(exerciseId));
        }
        return rows;
    }
}
