export const userWorkoutResultFindByUserWorkoutId = `
    SELECT
        id,
        user_workout_id,
        planned_data,
        actual_data,
        created_at
    FROM user_workout_result
    WHERE user_workout_id = $1
`;

export const userWorkoutResultCreate = `
    INSERT INTO user_workout_result (
        user_workout_id,
        planned_data,
        actual_data
    )
    VALUES ($1, $2, $3)
    RETURNING
        id,
        user_workout_id,
        planned_data,
        actual_data,
        created_at
`;

export const userWorkoutResultUpdateActualData = `
    UPDATE user_workout_result
    SET actual_data = $2
    WHERE user_workout_id = $1
    RETURNING
        id,
        user_workout_id,
        planned_data,
        actual_data,
        created_at
`;
