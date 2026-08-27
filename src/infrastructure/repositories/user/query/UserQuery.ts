export const userFindById = `
    SELECT
        id,
        nickname,
        password_hash,
        email,
        first_name,
        last_name,
        birth_date,
        gender,
        height,
        weight,
        avatar_url,
        preferred_workout_time,
        preferred_days,
        experience_level,
        fitness_goal,
        created_at,
        updated_at
    FROM users
    WHERE id = $1
`;

export const userFindByEmail = `
    SELECT
        id,
        nickname,
        password_hash,
        email,
        first_name,
        last_name,
        birth_date,
        gender,
        height,
        weight,
        avatar_url,
        preferred_workout_time,
        preferred_days,
        experience_level,
        fitness_goal,
        created_at,
        updated_at
    FROM users
    WHERE email = $1
`;

export const userCreate = `
    INSERT INTO users (
        nickname,
        password_hash,
        email,
        first_name,
        last_name,
        birth_date,
        gender,
        height,
        weight,
        avatar_url,
        preferred_workout_time,
        preferred_days,
        experience_level,
        fitness_goal
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING
        id,
        nickname,
        password_hash,
        email,
        first_name,
        last_name,
        birth_date,
        gender,
        height,
        weight,
        avatar_url,
        preferred_workout_time,
        preferred_days,
        experience_level,
        fitness_goal,
        created_at,
        updated_at
`;

export const userDelete = `
    DELETE FROM users
    WHERE id = $1
`;

export const userFindByNickname = `
    SELECT
        id,
        nickname,
        password_hash,
        email,
        first_name,
        last_name,
        birth_date,
        gender,
        height,
        weight,
        avatar_url,
        preferred_workout_time,
        preferred_days,
        experience_level,
        fitness_goal,
        created_at,
        updated_at
    FROM users
    WHERE nickname = $1
`;