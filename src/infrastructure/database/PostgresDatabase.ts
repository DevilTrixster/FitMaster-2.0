import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

import {
    IDatabase,
    IRepositoryProvider
} from '../../application/contracts_db/DatabaseContracts.js';
import { RepositoryProvider } from '../repositories/RepositoryProvider.js';

import { IDatabaseExecutor } from './IDatabaseExecutor.js';
import { mapPostgresError } from './mapPostgresError.js';

// 1. Создаем класс-обёртку, который перехватывает ошибки любого запроса
class MappedDatabaseExecutor implements IDatabaseExecutor {
    constructor(private readonly executor: Pool | PoolClient) {}

    async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
        try {
            return await this.executor.query(text, params);
        } catch (error) {
            // Любой PostgreSQL error (например, 23505) будет превращен в кастомный
            throw mapPostgresError(error);
        }
    }
}

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

    async transaction<T>(callback: (repositories: IRepositoryProvider) => Promise<T>): Promise<T> {
        const client: PoolClient = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 2. Оборачиваем client в маппер для запросов внутри транзакции
            const executor: IDatabaseExecutor = new MappedDatabaseExecutor(client);
            const provider = new RepositoryProvider(executor);

            const result = await callback(provider);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            try {
                await client.query('ROLLBACK');
            } catch {
                // Не перекрываем исходную ошибку отката
            }
            // 3. Маппим ошибку, если она произошла в callback или при ROLLBACK
            throw mapPostgresError(error);
        } finally {
            client.release();
        }
    }

    repositories(): IRepositoryProvider {
        // 4. Оборачиваем pool в наш маппер для запросов вне транзакций
        const executor: IDatabaseExecutor = new MappedDatabaseExecutor(this.pool);
        return new RepositoryProvider(executor);
    }
}
