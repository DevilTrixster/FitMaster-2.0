import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    //Таблицы

    // Таблица users хранит всё что вводит пользователь при регистрации и редактируется в "Профиле"
    pgm.createTable('users', {
        id: {
            type: 'serial',
            primaryKey: true
        },

        nickname: {
            type: 'citext',
            notNull: true,
            unique: true
        },

        password_hash: {
            type: 'text',
            notNull: true
        },

        // Эмаил в профиле редактировать нельзя
        email: {
            type: 'citext',
            notNull: true,
            unique: true
        },

        first_name: {
            type: 'varchar(50)',
            notNull: true
        },

        last_name: {
            type: 'varchar(50)',
            notNull: true
        },

        birth_date: {
            type: 'date',
            notNull: true
        },

        gender: {
            type: 'gender_type',
            notNull: true,
            default: 'male'
        },

        height: {
            type: 'integer',
            notNull: true,
            check: 'height > 100 AND height < 300'
        },

        weight: {
            type: 'numeric(5,2)',
            notNull: true,
            check: 'weight > 30 AND weight < 300'
        },

        preferred_workout_time: {
            type: 'time',
            notNull: true,
            default: '17:00:00'
        },

        avatar_url: { type: 'text' },

        preferred_days: {
            type: 'integer[]',
            notNull: true,
            default: pgm.func('ARRAY[1,3,5]::integer[]'),
            check: 'check_days_array(preferred_days)'
        },

        experience_level: {
            type: 'level',
            notNull: true,
            default: 'beginner'
        },

        fitness_goal: {
            type: 'goal',
            notNull: true,
            default: 'maintenance'
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
    });

    // Таблица muscle_groups содержит справочник групп мышц и им дочернии
    pgm.createTable('muscle_groups', {
        id: {
            type: 'serial',
            primaryKey: true
        },

        code: {
            type: 'muscle',
            notNull: true,
            unique: true
        },

        name: {
            type: 'varchar(100)',
            notNull: true,
            unique: true
        },

        parent_id: {
            type: 'integer',
            references: 'muscle_groups(id)',
            onDelete: 'RESTRICT'
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP')
        }
    });

    // Таблица exercises является библиотекой ВСЕХ упражнений
    pgm.createTable('exercises', {
        id: {
            type: 'serial',
            primaryKey: true
        },

        name: {
            type: 'varchar(100)',
            notNull: true
        },

        description: { type: 'text' },

        equipment_type: {
            type: 'equipment_type',
            notNull: true,
            default: 'bodyweight'
        },

        verbal_instruction: {
            type: 'text'
        },

        video: {
            type: 'text'
        },

        is_active: {
            type: 'boolean',
            notNull: true,
            default: true
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
    });

    // Триггер обновления
    pgm.sql(`
        -- Создание триггера для users
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        -- Создание триггера для exercises
        CREATE TRIGGER update_exercises_updated_at
        BEFORE UPDATE ON exercises
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // Удаление триггеров
    pgm.sql(`
        -- Удаление для exercises
        DROP TRIGGER IF EXISTS update_exercises_updated_at
        ON exercises;

        -- Удаление для users
        DROP TRIGGER IF EXISTS update_users_updated_at
        ON users;
    `);

    // Удаление таблиц
    pgm.dropTable('exercises', { ifExists: true, cascade: true });
    pgm.dropTable('muscle_groups', { ifExists: true, cascade: true });
    pgm.dropTable('users', { ifExists: true, cascade: true });
}
