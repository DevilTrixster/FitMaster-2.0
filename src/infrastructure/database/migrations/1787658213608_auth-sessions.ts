import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("auth_sessions", {
        id: {
            type: 'serial',
            primaryKey: true
        },

        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE'
        },

        refresh_token_hash: {
            type: 'text',
            notNull: true,
            unique: true
        },

        expires_at: {
            type: 'timestamp with time zone',
            notNull: true,
        },

        revoked_at: {
            type: 'timestamp with time zone'
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });


    pgm.createIndex('auth_sessions', 'user_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex('auth_sessions', 'user_id')

    pgm.dropTable('auth_sessions', { ifExists: true });
}
