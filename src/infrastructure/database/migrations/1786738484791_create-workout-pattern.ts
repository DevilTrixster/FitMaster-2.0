import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('workout_pattern', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },

        name: {
            type: 'varchar(100)',
            notNull: true,
        },

        type: {
            type: 'workout_pattern_type',
            notNull: true,
        },

        generation_source: {
            type: 'workout_pattern_generation_source',
            notNull: true,
        },

        pattern_data: {
            type: 'jsonb',
            notNull: true,
            check: `
                jsonb_typeof(pattern_data) = 'object'
                AND
                jsonb_typeof(pattern_data->'exercises') = 'array'
            `,
        },

        parent_pattern_id: {
            type: 'uuid',
            references: 'workout_pattern(id)',
            onDelete: 'RESTRICT',
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });

    //Один и только один FALLBACK-шаблон.
    pgm.createIndex('workout_pattern', 'type', {
            name: 'uq_workout_pattern_fallback',
            unique: true,
            where: "type = 'FALLBACK'"}
    );

    // Индекс для эволюционного дерева
    pgm.createIndex('workout_pattern', 'parent_pattern_id', { name: 'idx_workout_pattern_parent' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('workout_pattern');
}
