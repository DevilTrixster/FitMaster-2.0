import { QueryResultRow } from 'pg';

import { DatabaseQueryResult } from './IDatabaseQueryResult.js';

export interface IDatabaseExecutor {
    query<T extends QueryResultRow>(
        text: string,
        values?: unknown[]
    ): Promise<DatabaseQueryResult<T>>;
}
