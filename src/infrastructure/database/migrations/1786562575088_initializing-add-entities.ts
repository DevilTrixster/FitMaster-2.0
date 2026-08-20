import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    // Расширения
    pgm.sql(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto; 
        CREATE EXTENSION IF NOT EXISTS citext
    `)


    // ENUM

    // Гендер -- мужчина и женщина
    pgm.createType('gender_type', [
        'male',
        'female',
    ]);

    // Реакция -- лайк, дизлайк, нет реакции
    pgm.createType('reaction', [
        'like',
        'dislike',
        'neutral',
    ]);

    // Статус тренировки -- в прогрессе, завершена и тд.
    pgm.createType('user_workout_status', [
        'PLANNED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
    ]);

    // Типы адаптации -- увеличение веса, уменьшение и тд.
    pgm.createType('adaptation_type', [
        'increase_weight', // увеличение веса
        'decrease_weight', // уменьшение веса
        'increase_reps',
        'decrease_reps',
        'increase_time',
        'decrease_time',
        'no_change', // без изменений
        'substitution', // замена
    ]);

    // Варианты метрик -- повторения, вес, расстояние и тд.
    pgm.createType('metric_type', [
        'reps', // повторения
        'weight', // вес
        'duration', // продолжительность
        'distance', // расстояние
    ]);

    // Единицы измерения метрик -- кг, метры, секунды и тд.
    pgm.createType('metric', [
        'kg',
        'km',
        'metr',
        'sm',
        'min',
        'sec',
        'count',
        'min_sec',
    ]);

    // Варианты упражнений -- со своим весом, кардио, тренажер и тд
    pgm.createType('equipment_type', [
        'barbell', // упражнения со штангой/грифом
        'dumbbell', // гантели
        'bodyweight', // с собственным весом
        'cardio', // кардио
        'machine', // тренажёр
        'plyometric', // упражнения с динамическим циклом
    ]);

    // Уровень пользователя
    pgm.createType('level', [
        'beginner', // Начинающий
        'novice', // Новичок
        'intermediate', // Знающий
        'advanced', // Опытный
        'master', // Мастер
    ]);

    // Цели пользователя
    pgm.createType('goal', [
        'weight_loss', 
        'muscle_gain',
        'strength',
        'maintenance',
        'endurance',
        'aesthetics',
        'recomposition',
        'mobility',
        'rehabilitation',
        'sports',
        'event',
        'stress_relief',
        'energy',
        'competition',
        'posture',
        'healthy_aging',
    ]);

    // Варианты мышц для muscle_groups и exercises_muscle_groups
    pgm.createType('muscle', [
        // ОСНОВНЫЕ
        'LEGS', // ноги
        'CHEST', // грудь
        'BACK', // спина
        'SHOULDERS', // плечи
        'ARMS', // руки
        'CORE', // кор

        // ПОБОЧНЫЕ 
        'QUADRICEPS', // квадрицепсы
        'GLUTES', // ягодичные
        'HAMSTRINGS', // бицепс бедра
        'ADDUCTORS', // приводящие
        'CALVES', // икры

        'UPPER_CHEST', // верх груди
        'MID_CHEST', // средняя часть груди
        'LOWER_CHEST', // нижняя часть груди

        'LATS', // широчайшие
        'TRAPS', // трапеция
        'RHOMBOIDS', // робмовидная
        'TERES_MAJOR', // большая круглая
        'SPINAL_ERECTORS', // разгибатели спины

        'FRONT_DELTS', // передняя дельта
        'SIDE_DELTS', // средняя дельта
        'REAR_DELTS', // задняя дельта

        'BICEPS', // бицепс
        'TRICEPS', // трицепс
        'BRACHIALIS', // плечевые мышцы (брахиалис)
        'FOREARMS', // предплечье

        'RECTUS_ABDOMINIS', // прямые мышцы живота
        'OBLIQUES', // косые мышцы живота
        'TRANSVERSE_ABDOMINIS', // поперечные мышцы живота
    ]);

    // Тип тренировочного шаблона для workout_pattern
    pgm.createType('workout_pattern_type', [
        'FALLBACK', // "полследняя надежда"/аварийный шаблон - 1
        'DEFAULT', // дефолтный шаблон который вписан в таблицу изначально - 3
        'ADAPTIVE', // шаблоны которые создала адаптация - все остальные
    ]);

    // Источник создания шаблона для workout_pattern
    pgm.createType('workout_pattern_generation_source', [
        'SYSTEM', // системно - создан до адаптации
        'ADAPTATION', // создано адаптацией
        'OUTSIDE', // иные способы создания
    ]);



    // Функции 

    // Проверка дней
    pgm.sql(`
        CREATE OR REPLACE FUNCTION check_days_array(arr integer[])
        RETURNS boolean
        LANGUAGE sql
        IMMUTABLE
        AS $$
        SELECT COALESCE(
            bool_and(v BETWEEN 1 AND 7),
            TRUE
        )
        FROM unnest(arr) AS t(v);
        $$;
    `);

    // Обновление колонок
    pgm.sql(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
        END;
        $$;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // Удаление функций
    pgm.sql(`
        DROP FUNCTION IF EXISTS check_days_array(integer[]);
        DROP FUNCTION IF EXISTS update_updated_at_column();
    `);



    // Удаление ENUM
    pgm.dropType('workout_pattern_generation_source', { ifExists: true, cascade: true });
    pgm.dropType('workout_pattern_type', { ifExists: true, cascade: true });
    pgm.dropType('muscle', { ifExists: true, cascade: true });
    pgm.dropType('goal', { ifExists: true, cascade: true });
    pgm.dropType('level', { ifExists: true, cascade: true });
    pgm.dropType('equipment_type', { ifExists: true, cascade: true });
    pgm.dropType('metric', { ifExists: true, cascade: true });
    pgm.dropType('metric_type', { ifExists: true, cascade: true });
    pgm.dropType('adaptation_type', { ifExists: true, cascade: true });
    pgm.dropType('user_workout_status', { ifExists: true, cascade: true });
    pgm.dropType('reaction', { ifExists: true, cascade: true });
    pgm.dropType('gender_type', { ifExists: true, cascade: true });
}
