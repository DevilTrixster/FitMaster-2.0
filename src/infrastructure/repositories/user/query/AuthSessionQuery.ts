export const createAuthSession = `
    INSERT INTO auth_sessions (
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at
    )
    VALUES ($1, $2, $3, $4) 
    RETURNING
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at,
        created_at
`;

export const findByTokenHashAuthSession = `
    SELECT
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at,
        created_at
    FROM auth_sessions
    WHERE refresh_token_hash = $1
`;

export const revokeByIdAuthSession = `
    UPDATE auth_sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE id = $1
    AND revoked_at IS NULL
`;

export const revokeAllByUserIdAuthSession = `
    UPDATE auth_sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    AND revoked_at IS NULL
`;

export const findByTokenHashForUpdateAuthSession = `
    SELECT
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at,
        created_at
    FROM auth_sessions
    WHERE refresh_token_hash = $1
    FOR UPDATE
`;
