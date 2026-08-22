import { DatabaseQueryResult } from './DatabaseQueryResult.js'
import { QueryResultRow } from 'pg'

export interface IDatabaseExecutor {
    query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<DatabaseQueryResult<T>>;
}