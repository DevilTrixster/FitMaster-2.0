export const userWorkoutFindById = `
    SELECT
        id,
        user_id,
        pattern_id,
        status,
        workout_plan,
        original_scheduled_at,
        scheduled_at,
        started_at,
        completed_at,
        created_at
    FROM user_workout
    WHERE id = $1
`;

export const userWorkoutCreate = `
    INSERT INTO user_workout (
        user_id,
        pattern_id,
        status,
        workout_plan,
        original_scheduled_at,
        scheduled_at,
        started_at,
        completed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
        id,
        user_id,
        pattern_id,
        status,
        workout_plan,
        original_scheduled_at,
        scheduled_at,
        started_at,
        completed_at,
        created_at
`;

export const userWorkoutFindByIdAndUserId = `
    SELECT
        id,
        user_id,
        pattern_id,
        status,
        workout_plan,
        original_scheduled_at,
        scheduled_at,
        started_at,
        completed_at,
        created_at
    FROM user_workout
    WHERE id = $1
      AND user_id = $2
`;