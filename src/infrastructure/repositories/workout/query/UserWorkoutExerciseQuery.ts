export const userWorkoutExerciseFindByWorkoutId = `
    SELECT
        id,
        user_workout_id,
        planned_exercise_id,
        exercise_id,
        adaptation_data,
        created_at,
        updated_at
    FROM user_workout_exercises
    WHERE user_workout_id = $1
    ORDER BY id
`;

export const userWorkoutExerciseFindByPlannedExercise = `
    SELECT
        id,
        user_workout_id,
        planned_exercise_id,
        exercise_id,
        adaptation_data,
        created_at,
        updated_at
    FROM user_workout_exercises
    WHERE user_workout_id = $1
      AND planned_exercise_id = $2
`;

export const userWorkoutExerciseCreate = `
    INSERT INTO user_workout_exercises (
        user_workout_id,
        planned_exercise_id,
        exercise_id,
        adaptation_data
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
        id,
        user_workout_id,
        planned_exercise_id,
        exercise_id,
        adaptation_data,
        created_at,
        updated_at
`;

export const userWorkoutExerciseUpdate = `
    UPDATE user_workout_exercises
    SET
        exercise_id = $2,
        adaptation_data = $3
    WHERE id = $1
    RETURNING
        id,
        user_workout_id,
        planned_exercise_id,
        exercise_id,
        adaptation_data,
        created_at,
        updated_at
`;