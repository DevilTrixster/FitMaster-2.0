export const muscleGroupFindById = `
    SELECT
        id,
        code,
        name,
        parent_id,
        created_at
    FROM muscle_groups
    WHERE id = $1
`;