import { QueryResultRow } from 'pg';
import { AuthSession } from '../../../domain/entities/user/AuthSession.js';
import { IAuthSessionRepository } from '../../../domain/repositories/IAuthSessionRepository.js';
import { IDatabaseExecutor } from '../../database/types/IDatabaseExecutor.js';
import { createAuthSession, findByTokenHashAuthSession, revokeByIdAuthSession, revokeAllByUserIdAuthSession, findByTokenHashForUpdateAuthSession } from './query/AuthSessionQuery.js';

interface AuthSessionRow extends QueryResultRow {
    id: number;
    user_id: number;
    refresh_token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
    created_at: Date;

}

export class AuthSessionRepository implements IAuthSessionRepository {

    constructor (private readonly executor: IDatabaseExecutor) {}

    private mapToEntity(row: AuthSessionRow): AuthSession {
        return new AuthSession({
            id: row.id,
            userId: row.user_id,
            refreshTokenHash: row.refresh_token_hash,
            expiresAt: row.expires_at,
            revokedAt: row.revoked_at,
            createdAt: row.created_at
        });
    }

    async create(session: AuthSession): Promise<AuthSession> {
        const result = await this.executor.query<AuthSessionRow>(createAuthSession, 
        [
            session.userId,
            session.refreshTokenHash,
            session.expiresAt,
            session.revokedAt
        ]);
        return this.mapToEntity(result.rows[0]);
    }

    async findByTokenHash(tokenHash: string): Promise<AuthSession | null> {
        const result = await this.executor.query<AuthSessionRow>(findByTokenHashAuthSession, [tokenHash]);

        if (result.rows.length === 0) {
            return null;
        }
        
        return this.mapToEntity(result.rows[0]);
    }

    async revokeById(sessionId: number): Promise<void> {
        await this.executor.query(revokeByIdAuthSession, [sessionId]);
    }

    async revokeAllByUserId(userId: number): Promise<void> {
        await this.executor.query(revokeAllByUserIdAuthSession, [userId]);
    }

    async findByTokenHashForUpdate(tokenHash: string): Promise<AuthSession | null> {
        const result = await this.executor.query<AuthSessionRow>(findByTokenHashForUpdateAuthSession, [tokenHash]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapToEntity(result.rows[0]);
    }
}
