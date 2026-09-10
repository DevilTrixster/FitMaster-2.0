import { Pool } from 'pg';

import { IDatabase } from '../../application/ports/database/IDatabase.js';
import { IRepositoryProvider } from '../../application/ports/repositories/IRepositoryProvider.js';
import { RepositoryProvider } from '../repositories/RepositoryProvider.js';

import { DatabaseTransaction } from './DatabaseTransaction.js';
import { PoolExecutor } from './PoolExecutor.js';

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

    async transaction<T>(
        callback: (repositories: IRepositoryProvider) => Promise<T>
    ): Promise<T> {
        const client = await this.pool.connect();
        const transaction = new DatabaseTransaction(client);
        return transaction.run(async (executor) => {
            const provider = new RepositoryProvider(executor);
            return callback(provider);
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

    repositories(): IRepositoryProvider {
        const executor = new PoolExecutor(this.pool);

        return new RepositoryProvider(executor);
    }
}
