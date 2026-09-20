import { QueryResult, QueryResultRow } from 'pg';

export interface IDatabaseExecutor {
    query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
}
