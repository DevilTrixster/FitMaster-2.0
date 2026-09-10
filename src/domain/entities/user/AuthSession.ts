export class AuthSession {
    public readonly id?: number;
    public readonly userId: number;
    public readonly refreshTokenHash: string;
    public readonly expiresAt: Date;
    public readonly revokedAt: Date | null;
    public readonly createdAt: Date;

    constructor(data: {
        id?: number;
        userId: number;
        refreshTokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        createdAt?: Date;
    }) {
        this.id = data.id;
        this.userId = data.userId;
        this.refreshTokenHash = data.refreshTokenHash;
        this.expiresAt = data.expiresAt;
        this.revokedAt = data.revokedAt;
        this.createdAt = data.createdAt ?? new Date();
    }
}
