import { Pool, QueryResultRow } from 'pg';

import { IDatabaseExecutor } from '../database/types/IDatabaseExecutor.js';

import { DatabaseQueryResult } from './types/IDatabaseQueryResult.js';

export class PoolExecutor implements IDatabaseExecutor {
    constructor(private readonly pool: Pool) {}

    async query<T extends QueryResultRow>(
        text: string,
        values?: unknown[]
    ): Promise<DatabaseQueryResult<T>> {
        const result = await this.pool.query<T>(text, values);

        return {
            rows: result.rows,
            rowCount: result.rowCount ?? 0
        };
    }
}
