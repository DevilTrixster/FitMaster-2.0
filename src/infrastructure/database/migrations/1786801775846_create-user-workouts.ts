import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('user_workouts', {
        id: {
            type: 'serial',
            primaryKey: true,
        },

        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },

        pattern_id: {
            type: 'uuid',
            notNull: true,
            references: 'workout_pattern(id)',
            onDelete: 'RESTRICT',
        },

        status: {
            type: 'user_workout_status',
            notNull: true,
            default: 'PLANNED',
        },

        scheduled_at: {
            type: 'timestamp with time zone',
        },

        started_at: {
            type: 'timestamp with time zone',
        },

        completed_at: {
            type: 'timestamp with time zone',
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    }, {
        constraints: {check: `
                completed_at IS NULL
                OR (
                    started_at IS NOT NULL
                    AND completed_at >= started_at)`}
    });


    pgm.createIndex('user_workouts', ['user_id', 'scheduled_at'], { name: 'idx_user_workouts_user_scheduled' });
    pgm.createIndex('user_workouts', 'pattern_id', { name: 'idx_user_workouts_pattern' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {

    pgm.dropTable('user_workouts');
}
