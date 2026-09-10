export const exerciseFindById = `
    SELECT
        id,
        name,
        description,
        equipment_type,
        verbal_instruction,
        video,
        is_active,
        created_at,
        updated_at
    FROM exercises
    WHERE id = $1
`;

export const exerciseFindByName = `
    SELECT
        id,
        name,
        description,
        equipment_type,
        verbal_instruction,
        video,
        is_active,
        created_at,
        updated_at
    FROM exercises
    WHERE name = $1
`;

export const exerciseFindAllActive = `
    SELECT
        id,
        name,
        description,
        equipment_type,
        verbal_instruction,
        video,
        is_active,
        created_at,
        updated_at
    FROM exercises
    WHERE is_active = TRUE
    ORDER BY name
`;
