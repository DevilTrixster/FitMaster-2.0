export interface ITokenService {
    generateRefreshToken(): string;
    hashRefreshToken(token: string): string;
    getRefreshTokenExpiresAt(): Date;
    generateAccessToken(userId: number): string;
    verifyAccessToken(token: string): { userId: number; };
}