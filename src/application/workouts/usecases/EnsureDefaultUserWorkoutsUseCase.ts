import { UserWorkout } from '../../../domain/entities/workouts/UserWorkout.js';
import { UserWorkoutExercise } from '../../../domain/entities/workouts/UserWorkoutExercise.js';
import {
    ExerciseNotFoundError,
    InactiveExerciseError,
    InvalidWorkoutPlanError,
    UserNotFoundError,
    WorkoutPatternNotFoundError
} from '../../../shared/errors/index.js';
import { WorkoutPatternType, UserWorkoutStatus } from '../../../shared/enum.js';
import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IEnsureDefaultUserWorkoutsUseCase } from '../Contracts.js';
import { workoutPlanSchema } from '../validation/WorkoutPlanSchema.js';

const DEFAULT_PATTERN_NAMES = [
    'Default Chest',
    'Default Back',
    'Default Legs'
] as const;

function dayOfWeekMondayFirst(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day;
}

function nextOccurrence(day: number, time: string, now: Date): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const currentDay = dayOfWeekMondayFirst(now);

    let daysUntil = (day - currentDay + 7) % 7;

    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysUntil);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate <= now) {
        candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
}

export class EnsureDefaultUserWorkoutsUseCase
    implements IEnsureDefaultUserWorkoutsUseCase
{
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number): Promise<UserWorkout[]> {
        return this.database.transaction(async (repositories) => {
            const userRepository = repositories.getUserRepository();
            const patternRepository = repositories.getUserWorkoutPatternRepository();
            const exerciseRepository = repositories.getExerciseRepository();
            const userWorkoutRepository = repositories.getUserWorkoutRepository();
            const userWorkoutExerciseRepository =
                repositories.getUserWorkoutExerciseRepository();

            const user = await userRepository.findById(userId);

            if (!user) {
                throw new UserNotFoundError(userId);
            }

            // Default workouts are created only for a completely new user.
            // Existing users are left for the adaptation system.
            const latestWorkout = await userWorkoutRepository.findLatestByUserId(userId);

            if (latestWorkout) {
                return [];
            }

            const defaultPatterns = await patternRepository.findByType(
                WorkoutPatternType.Default
            );

            const patternsByName = new Map(
                defaultPatterns.map((pattern) => [pattern.name, pattern])
            );

            const selectedPatterns = DEFAULT_PATTERN_NAMES.map((name) => {
                const pattern = patternsByName.get(name);

                if (!pattern) {
                    throw new WorkoutPatternNotFoundError(name);
                }

                return pattern;
            });

            const now = new Date();

            const scheduled = user.preferredDays
                .map((day) => ({
                    day,
                    scheduledAt: nextOccurrence(
                        day,
                        user.preferredWorkoutTime,
                        now
                    )
                }))
                .sort(
                    (a, b) =>
                        a.scheduledAt.getTime() - b.scheduledAt.getTime()
                )
                .slice(0, selectedPatterns.length);

            const createdWorkouts: UserWorkout[] = [];

            for (let index = 0; index < scheduled.length; index += 1) {
                const pattern = selectedPatterns[index];
                const parsedPlan = workoutPlanSchema.safeParse(pattern.patternData);

                if (!parsedPlan.success) {
                    throw new InvalidWorkoutPlanError(parsedPlan.error);
                }

                for (const planExercise of parsedPlan.data.exercises) {
                    const exercise = await exerciseRepository.findById(
                        planExercise.exerciseId
                    );

                    if (!exercise) {
                        throw new ExerciseNotFoundError(planExercise.exerciseId);
                    }

                    if (!exercise.isActive) {
                        throw new InactiveExerciseError(planExercise.exerciseId);
                    }
                }

                const workout = new UserWorkout({
                    userId,
                    patternId: pattern.id!,
                    status: UserWorkoutStatus.Planned,
                    workoutPlan: parsedPlan.data,
                    originalScheduledAt: scheduled[index].scheduledAt,
                    scheduledAt: scheduled[index].scheduledAt
                });

                const createdWorkout =
                    await userWorkoutRepository.create(workout);

                for (const planExercise of parsedPlan.data.exercises) {
                    await userWorkoutExerciseRepository.create(
                        new UserWorkoutExercise({
                            userWorkoutId: createdWorkout.id!,
                            plannedExerciseId: planExercise.exerciseId,
                            exerciseId: planExercise.exerciseId,
                            adaptationData: null
                        })
                    );
                }

                createdWorkouts.push(createdWorkout);
            }

            return createdWorkouts;
        });
    }
}
