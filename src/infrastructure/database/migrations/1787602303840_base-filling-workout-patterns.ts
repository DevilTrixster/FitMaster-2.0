import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    // Шаблон последнняя надежда
    pgm.sql(`
        INSERT INTO workout_pattern (id, name, type, generation_source, workout_plan)
        VALUES ('11111111-1111-4111-8111-111111111111','Fallback', 'FALLBACK', 'SYSTEM',
            '{
                "exercises": [
                    {
                        "exerciseId": 8,
                        "exerciseName": "Приседания с собственным весом",
                        "orderIndex": 0,
                        "sets": 3,
                        "target": [
                            {
                                "type": "reps",
                                "metric": "count",
                                "value": 12
                            }
                        ]
                    },
                    {
                        "exerciseId": 7,
                        "exerciseName": "Отжимания от пола",
                        "orderIndex": 1,
                        "sets": 3,
                        "target": [
                            {
                                "type": "reps",
                                "metric": "count",
                                "value": 10
                            }
                        ]
                    },
                    {
                        "exerciseId": 20,
                        "exerciseName": "Планка",
                        "orderIndex": 2,
                        "sets": 3,
                        "target": [
                            {
                                "type": "duration",
                                "metric": "min_sec",
                                "value": "00:30"
                            }
                        ]
                    }
                ],
                "restSeconds": 60
            }'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;    
    `);

    // Дефолтный шаблон - грудь
    pgm.sql(`
        INSERT INTO workout_pattern (id, name, type, generation_source, workout_plan)
        VALUES ('22222222-2222-4222-8222-222222222222', 'Default Chest', 'DEFAULT','SYSTEM',
            '{
                "exercises": [
                    {
                        "exerciseId": 2,
                        "exerciseName": "Жим штанги лежа",
                        "orderIndex": 0,
                        "sets": 3,
                        "target": [
                            {
                                "type": "reps",
                                "metric": "count",
                                "value": 10
                            }
                        ]
                    }
                ],
                "restSeconds": 90
            }'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
    `);

    // Дефолтный шаблон - спина
    pgm.sql(`
        INSERT INTO workout_pattern (id, name, type, generation_source, workout_plan)
        VALUES ('33333333-3333-4333-8333-333333333333', 'Default Back', 'DEFAULT', 'SYSTEM',
            '{
                "exercises": [
                    {
                        "exerciseId": 6,
                        "exerciseName": "Подтягивания широким хватом",
                        "orderIndex": 0,
                        "sets": 3,
                        "target": [
                            {
                                "type": "reps",
                                "metric": "count",
                                "value": 8
                            }
                        ]
                    }
                ],
                "restSeconds": 120
            }'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
    `);

    // Дефолтный шаблон - ноги
    pgm.sql(`
        INSERT INTO workout_pattern (id, name, type, generation_source, workout_plan)
        VALUES ('44444444-4444-4444-8444-444444444444', 'Default Legs', 'DEFAULT', 'SYSTEM',
            '{
                "exercises": [
                    {
                        "exerciseId": 1,
                        "exerciseName": "Приседания со штангой на плечах",
                        "orderIndex": 0,
                        "sets": 3,
                        "target": [
                            {
                                "type": "reps",
                                "metric": "count",
                                "value": 10
                            }
                        ]
                    }
                ],
                "restSeconds": 120
            }'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;    
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.sql(`
        DELETE FROM workout_pattern
        WHERE id IN (
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
            '33333333-3333-4333-8333-333333333333',
            '44444444-4444-4444-8444-444444444444'
        );
    `);
}
