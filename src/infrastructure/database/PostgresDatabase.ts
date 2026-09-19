import { Pool, PoolClient } from 'pg';

import {
    IDatabase,
    IRepositoryProvider
} from '../../application/contracts_db/DatabaseContracts.js';
import { RepositoryProvider } from '../repositories/RepositoryProvider.js';

import { IDatabaseExecutor } from './IDatabaseExecutor.js';

export class PostgresDatabase implements IDatabase {
    private readonly pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,

            max: 20, // максимальное число подключений
            idleTimeoutMillis: 30000, // время ожидания (мс)
            connectionTimeoutMillis: 2000 // время подключения (мс)
        });
    }

    async connect(): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query('SELECT 1');
            console.log('PostgreSQL connected');
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
        console.log('PostgreSQL connection closed');
    }

    async transaction<T>(
        callback: (repositories: IRepositoryProvider) => Promise<T>
    ): Promise<T> {
        const client: PoolClient = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const executor: IDatabaseExecutor = client;
            const provider = new RepositoryProvider(executor);
            const result = await callback(provider);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            try {
                await client.query('ROLLBACK');
            } catch {
                // Не перекрываем исходную ошибку
            }
            throw error;
        } finally {
            client.release();
        }
    }

    repositories(): IRepositoryProvider {
        const executor: IDatabaseExecutor = this.pool;

        return new RepositoryProvider(executor);
    }
}
