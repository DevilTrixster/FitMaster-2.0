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
            references: 'user_workout(id)',
            onDelete: 'CASCADE',
            unique: true
        },

        // Снимок того, что было запланировано пользователю.
        planned_data: {
            type: 'jsonb',
            notNull: true,
            check: `
                jsonb_typeof(planned_data) = 'object'
                AND jsonb_typeof(planned_data->'exercises') = 'array'
            `,
        },

        // Фактический результат выполнения.
        // NULL означает, что результат ещё не был внесён.
        actual_data: {
            type: 'jsonb',
            check: `
                actual_data IS NULL
                OR jsonb_typeof(actual_data) = 'object'
            `,
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });

}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('user_workout_result');
}
