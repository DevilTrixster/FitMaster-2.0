import { PoolClient } from 'pg';
import { IDatabaseTransaction } from './types/IDatabaseTransaction.js';
import { IDatabaseExecutor } from './types/IDatabaseExecutor.js';
import { DatabaseExecutor } from './DatabaseExecutor.js';

export class DatabaseTransaction implements IDatabaseTransaction {
    constructor(
        private readonly client: PoolClient
    ) {}

    async run<T>(callback: (executor: IDatabaseExecutor) => Promise<T>): Promise<T> {
        try {
            await this.client.query('BEGIN');

            const executor = new DatabaseExecutor(this.client);
            const result = await callback(executor);

            await this.client.query('COMMIT');

            return result;
        } catch (error) {
            try {
                await this.client.query('ROLLBACK');
            } catch {}
            throw error;
        } finally {
            this.client.release();
        }
    }
}