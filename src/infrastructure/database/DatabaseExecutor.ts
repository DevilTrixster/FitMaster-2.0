import { PoolClient, QueryResultRow } from 'pg';
import { IDatabaseExecutor } from './types/IDatabaseExecutor.js';
import { DatabaseQueryResult } from './types/DatabaseQueryResult.js';

export class DatabaseExecutor implements IDatabaseExecutor {
    constructor(
        private readonly client: PoolClient
    ) {}

    async query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<DatabaseQueryResult<T>> {
        const result = await this.client.query<T>(text, values);

        return {
            rows: result.rows,
            rowCount: result.rowCount ?? 0,
        };
    }
}