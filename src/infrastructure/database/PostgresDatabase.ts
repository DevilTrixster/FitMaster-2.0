import { Pool } from 'pg';
import { DatabaseTransaction } from './DatabaseTransaction.js';
import { IDatabaseExecutor } from './types/IDatabaseExecutor.js'

export class PostgresDatabase {
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
            connectionTimeoutMillis: 2000, // время подключения (мс)
        });
    }

    getPool(): Pool {
        return this.pool;
    }

    async transaction<T>(callback: (executor: IDatabaseExecutor) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        const transaction = new DatabaseTransaction(client);
        return transaction.run(callback);
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
}