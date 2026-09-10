export interface DatabaseQueryResult<T> {
    rows: T[];
    rowCount: number;
}
