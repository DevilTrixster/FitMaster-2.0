import { AuthSession } from '../entities/user/AuthSession.js'
export interface IAuthSessionRepository {
    create(session: AuthSession): Promise<AuthSession>;
    findByTokenHash(tokenHash: string): Promise<AuthSession | null>;
    revokeById(sessionId: number): Promise<void>;
    revokeAllByUserId(userId: number): Promise<void>;
    findByTokenHashForUpdate(tokenHash: string): Promise<AuthSession | null>;
}