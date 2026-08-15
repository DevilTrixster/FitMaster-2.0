import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('user_workout_result', {
        id: {
            type: 'serial',
            primaryKey: true,
        },

        user_workout_id: {
            type: 'integer',
            notNull: true,
            references: 'user_workouts(id)',
            onDelete: 'CASCADE',
        },

        // Фактически выполненное упражнение.
        // Если пользователь заменил упражнение:
        // planned_data.exercise_id != exercise_id
        exercise_id: {
            type: 'integer',
            notNull: true,
            references: 'exercises(id)',
            onDelete: 'RESTRICT',
        },

        // Позиция упражнения внутри конкретной тренировки.
        order_index: {
            type: 'integer',
            notNull: true,
            check: 'order_index > 0',
        },

        // Снимок того, что было запланировано пользователю.
        planned_data: {
            type: 'jsonb',
            notNull: true,
            check: `
                jsonb_typeof(planned_data) = 'object'
                AND planned_data ? 'exercise_id'
                AND planned_data ? 'sets'
                AND planned_data ? 'target'
                AND planned_data ? 'rest_seconds'
            `,
        },

        // Фактический результат выполнения.
        // NULL означает, что результат ещё не был внесён.
        actual_data: {
            type: 'jsonb',
            check: `
                actual_data IS NULL
                OR (
                    jsonb_typeof(actual_data) = 'object'
                    AND actual_data ? 'sets'
                    AND jsonb_typeof(actual_data->'sets') = 'array'
                )
            `,
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });


    // У одного упражнения может быть только одна позиция внутри конкретной пользовательской тренировки.
    pgm.createIndex('user_workout_result', ['user_workout_id', 'order_index'], { name: 'uq_user_workout_result_order', unique: true});

    // Быстрый поиск всех результатов конкретной тренировки.
    pgm.createIndex('user_workout_result','user_workout_id', { name: 'idx_user_workout_result_workout' });

    // Быстрый поиск истории выполнения конкретного упражнения.
    pgm.createIndex('user_workout_result','exercise_id', { name: 'idx_user_workout_result_exercise' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('user_workout_result');
}
