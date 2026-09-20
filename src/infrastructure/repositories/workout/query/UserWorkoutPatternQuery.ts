export const workoutPatternFindById = `
    SELECT
        id,
        parent_pattern_id,
        name,
        type,
        generation_source,
        workout_plan,
        created_at
    FROM workout_pattern
    WHERE id = $1
`;

export const workoutPatternFindAll = `
    SELECT
        id,
        parent_pattern_id,
        name,
        type,
        generation_source,
        workout_plan,
        created_at
    FROM workout_pattern
    ORDER BY created_at, name, id
`;

export const workoutPatternFindByType = `
    SELECT
        id,
        parent_pattern_id,
        name,
        type,
        generation_source,
        workout_plan,
        created_at
    FROM workout_pattern
    WHERE type = $1
    ORDER BY created_at, name, id
`;

export const workoutPatternFindByParentPatternId = `
    SELECT
        id,
        parent_pattern_id,
        name,
        type,
        generation_source,
        workout_plan,
        created_at
    FROM workout_pattern
    WHERE parent_pattern_id = $1
    ORDER BY created_at, name, id
`;

export const workoutPatternCreate = `
    INSERT INTO workout_pattern (
        parent_pattern_id,
        name,
        type,
        generation_source,
        workout_plan
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
        id,
        parent_pattern_id,
        name,
        type,
        generation_source,
        workout_plan,
        created_at
`;
