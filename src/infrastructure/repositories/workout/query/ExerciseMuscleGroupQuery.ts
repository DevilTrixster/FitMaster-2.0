export const exerciseMuscleGroupFindByExerciseId = `
    SELECT
        id,
        exercise_id,
        muscle_group_id,
        load_ratio,
        is_primary,
        created_at,
        updated_at
    FROM exercises_muscle_groups
    WHERE exercise_id = $1
    ORDER BY is_primary DESC, id
`;

export const exerciseMuscleGroupFindPrimaryByExerciseId = `
    SELECT
        id,
        exercise_id,
        muscle_group_id,
        load_ratio,
        is_primary,
        created_at,
        updated_at
    FROM exercises_muscle_groups
    WHERE exercise_id = $1
      AND is_primary = TRUE
    ORDER BY id
    LIMIT 1
`;

export const exerciseMuscleGroupFindByMuscleGroupId = `
    SELECT
        id,
        exercise_id,
        muscle_group_id,
        load_ratio,
        is_primary,
        created_at,
        updated_at
    FROM exercises_muscle_groups
    WHERE muscle_group_id = $1
    ORDER BY is_primary DESC, id
`;
