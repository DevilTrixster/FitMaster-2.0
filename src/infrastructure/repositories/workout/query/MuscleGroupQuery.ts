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

export const muscleGroupFindByCode = `
    SELECT
        id,
        code,
        name,
        parent_id,
        created_at
    FROM muscle_groups
    WHERE code = $1
`;

export const muscleGroupFindAll = `
    SELECT
        id,
        code,
        name,
        parent_id,
        created_at
    FROM muscle_groups
    ORDER BY parent_id NULLS FIRST, id
`;

export const muscleGroupFindRootGroups = `
    SELECT
        id,
        code,
        name,
        parent_id,
        created_at
    FROM muscle_groups
    WHERE parent_id IS NULL
    ORDER BY id
`;

export const muscleGroupFindChildren = `
    SELECT
        id,
        code,
        name,
        parent_id,
        created_at
    FROM muscle_groups
    WHERE parent_id = $1
    ORDER BY id
`;
