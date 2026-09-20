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

export const exerciseFindByIds = `
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
    WHERE id = ANY($1::integer[])
    ORDER BY id
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
    ORDER BY id
    LIMIT 1
`;

export const exerciseSearchActiveByName = `
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
      AND name ILIKE '%' || $1 || '%'
    ORDER BY name, id
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
    ORDER BY name, id
`;
