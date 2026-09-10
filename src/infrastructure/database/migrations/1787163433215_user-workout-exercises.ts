import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(
        'user_workout_exercises',
        {
            id: {
                type: 'serial',
                primaryKey: true
            },

            user_workout_id: {
                type: 'integer',
                notNull: true,
                references: 'user_workout',
                onDelete: 'CASCADE'
            },

            planned_exercise_id: {
                type: 'integer',
                notNull: true,
                references: 'exercises',
                onDelete: 'RESTRICT'
            },

            exercise_id: {
                type: 'integer',
                notNull: true,
                references: 'exercises',
                onDelete: 'RESTRICT'
            },

            adaptation_data: {
                type: 'jsonb',
                check: "jsonb_typeof(adaptation_data) = 'object'"
            },

            created_at: {
                type: 'timestamp with time zone',
                notNull: true,
                default: pgm.func('CURRENT_TIMESTAMP')
            },

            updated_at: {
                type: 'timestamp with time zone',
                notNull: true,
                default: pgm.func('CURRENT_TIMESTAMP')
            }
        },
        {
            constraints: { unique: ['user_workout_id', 'planned_exercise_id'] }
        }
    );

    // Триггер
    pgm.sql(`
        -- Создание триггера для user_workout_exercises
        CREATE TRIGGER update_user_workout_exercises_updated_at
        BEFORE UPDATE ON user_workout_exercises
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('user_workout_exercises');
}
