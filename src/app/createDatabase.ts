import { PostgresDatabase } from '../infrastructure/database/PostgresDatabase.js';

export function createDatabase() {
    return new PostgresDatabase();
}
