import { PasswordHasher } from '../infrastructure/security/PasswordHasher.js';
import { JwtTokenService } from '../infrastructure/security/TokenService.js';

function requireEnvironmentVariable(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }

    return value;
}

export function createServices() {
    const passwordHasher = new PasswordHasher();

    const tokenService = new JwtTokenService({
        accessSecret: requireEnvironmentVariable('ACCESS_TOKEN_SECRET'),
        accessExpiresIn: '15m',
        refreshExpiresIn: 1000 * 60 * 60 * 24 * 30,
        issuer: 'fitmaster',
        audience: 'fitmaster-client'
    });

    return { passwordHasher, tokenService };
}
