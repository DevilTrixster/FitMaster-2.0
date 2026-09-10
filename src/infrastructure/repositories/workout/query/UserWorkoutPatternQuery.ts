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
