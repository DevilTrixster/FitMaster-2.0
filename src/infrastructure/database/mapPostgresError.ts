import {
    EmailAlreadyExistsError,
    NicknameAlreadyExistsError,
    WorkoutResultAlreadyExistsError,
    WorkoutExerciseAlreadyExistsError
} from '../../shared/errors/index.js';

export function mapPostgresError(error: unknown): Error {
    // Проверяем, что это ошибка от pg (node-postgres)
    if (error && typeof error === 'object' && 'code' in error) {
        const pgError = error as { code: string; constraint?: string };

        // 23505 — unique_violation
        if (pgError.code === '23505' && pgError.constraint) {
            switch (pgError.constraint) {
                // --- Ограничения для пользователей ---
                case 'users_email_key':
                    return new EmailAlreadyExistsError();
                case 'users_nickname_key':
                    return new NicknameAlreadyExistsError();

                // --- Ограничения для результатов тренировок ---
                case 'user_workout_result_user_workout_id_key':
                    // workoutId неизвестен на этом уровне маппинга, передаем 0
                    return new WorkoutResultAlreadyExistsError(0);

                // --- Уникальность упражнений внутри тренировки ---
                // Создаются в миграции 1787163433215_user-workout-exercises.ts
                case 'uq_user_workout_planned_exercise':
                case 'uq_user_workout_actual_exercise':
                    // IDs неизвестны на этом уровне, передаем 0
                    return new WorkoutExerciseAlreadyExistsError(0, 0);
            }
        }
    }

    // Если это не наша ошибка, возвращаем оригинал
    return error instanceof Error ? error : new Error(String(error));
}
