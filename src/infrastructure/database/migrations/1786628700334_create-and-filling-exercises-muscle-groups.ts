import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    // Связь таблицы упражнений (exercises) и соотношение группой мышц (muscle_groups)
    pgm.createTable(
        'exercises_muscle_groups',
        {
            id: {
                type: 'serial',
                primaryKey: true
            },

            exercise_id: {
                type: 'integer',
                notNull: true,
                references: 'exercises',
                onDelete: 'CASCADE'
            },

            muscle_group_id: {
                type: 'integer',
                notNull: true,
                references: 'muscle_groups',
                onDelete: 'RESTRICT'
            },

            load_ratio: {
                type: 'numeric(5,4)',
                notNull: true,
                check: 'load_ratio > 0 AND load_ratio <= 1'
            },

            is_primary: {
                type: 'boolean',
                notNull: true,
                default: false
            },

            created_at: {
                type: 'timestamp',
                notNull: true,
                default: pgm.func('CURRENT_TIMESTAMP')
            },

            updated_at: {
                type: 'timestamp',
                notNull: true,
                default: pgm.func('CURRENT_TIMESTAMP')
            }
        },
        {
            constraints: {
                unique: [['exercise_id', 'muscle_group_id']]
            }
        }
    );

    pgm.createIndex('exercises_muscle_groups', 'exercise_id', {
        name: 'uq_exercise_primary_muscle_group',
        unique: true,
        where: 'is_primary = TRUE'
    });

    // Заполнение таблицы exercises_muscle_groups для каждого упражнения
    pgm.sql(`
        INSERT INTO exercises_muscle_groups (exercise_id, muscle_group_id, load_ratio, is_primary)
        VALUES
        -- 1. Приседания со штангой на плечах
        (1, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6, true),
        (1, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3, false),
        (1, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1, false),

        -- 2. Жим штанги лежа
        (2, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.5, true),
        (2, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (2, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),
        (2, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 3. Становая тяга
        (3, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.3, true),
        (3, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3, false),
        (3, (SELECT id FROM muscle_groups WHERE code = 'SPINAL_ERECTORS'), 0.25, false),
        (3, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.05, false),
        (3, (SELECT id FROM muscle_groups WHERE code = 'TRAPS'), 0.1, false),

        -- 4. Тяга штанги в наклоне
        (4, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.6, true),
        (4, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.3, false),
        (4, (SELECT id FROM muscle_groups WHERE code = 'TRAPS'), 0.1, false),

        -- 5. Жим штанги стоя (армейский)
        (5, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.45, true),
        (5, (SELECT id FROM muscle_groups WHERE code = 'SIDE_DELTS'), 0.25, false),
        (5, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.2, false),
        (5, (SELECT id FROM muscle_groups WHERE code = 'TRAPS'), 0.1, false),

        -- 6. Подтягивания широким хватом
        (6, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.7, true),
        (6, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.2, false),
        (6, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.1, false),

        -- 7. Отжимания от пола
        (7, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.4, true),
        (7, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.3000, false),
        (7, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2000, false),
        (7, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1000, false),

        -- 8. Приседания с собственным весом
        (8, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (8, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (8, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 9. Выпады с гантелями
        (9, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.5000, true),
        (9, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (9, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),

        -- 10. Жим гантелей лежа
        (10, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.5, true),
        (10, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (10, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),
        (10, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.10, false),

        -- 11. Разведение гантелей в стороны
        (11, (SELECT id FROM muscle_groups WHERE code = 'SIDE_DELTS'), 1.0000, true),

        -- 12. Сгибание рук с гантелями (бицепс)
        (12, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 1.0000, true),

        -- 13. Тяга верхнего блока к груди
        (13, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.7000, true),
        (13, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.2000, false),
        (13, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.1000, false),

        -- 14. Жим ногами в тренажере
        (14, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (14, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (14, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 15. Разгибание ног в тренажере
        (15, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 1.0000, true),

        -- 16. Сгибание ног в тренажере лежа
        (16, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 1.0000, true),

        -- 17. Пуловер с гантелью
        (17, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.65, true),
        (17, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.35, false),

        -- 18. Французский жим со штангой лежа
        (18, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 1.0000, true),

        -- 19. Скручивания на пресс лежа
        (19, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 20. Планка
        (20, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 0.4000, true),
        (20, (SELECT id FROM muscle_groups WHERE code = 'OBLIQUES'), 0.3000, false),
        (20, (SELECT id FROM muscle_groups WHERE code = 'TRANSVERSE_ABDOMINIS'), 0.3000, false),

        -- 21. Гиперэкстензия (в тренажере)
        (21, (SELECT id FROM muscle_groups WHERE code = 'SPINAL_ERECTORS'), 1.0000, true),

        -- 22. Тяга гантели к поясу одной рукой
        (22, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.6000, true),
        (22, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.3000, false),
        (22, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.1000, false),

        -- 23. Подъем на носки стоя (в тренажере)
        (23, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 1.0000, true),

        -- 24. Жим гантелей сидя над головой
        (24, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.4, true),
        (24, (SELECT id FROM muscle_groups WHERE code = 'SIDE_DELTS'), 0.3, false),
        (24, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.2, false),
        (24, (SELECT id FROM muscle_groups WHERE code = 'REAR_DELTS'), 0.1, false),

        -- 25. Подтягивания обратным хватом
        (25, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.5000, false),
        (25, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.5000, true),

        -- 26. Отжимания на брусьях
        (26, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.5, true),
        (26, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.3, false),
        (26, (SELECT id FROM muscle_groups WHERE code = 'LOWER_CHEST'), 0.2, false),

        -- 27. Приседания с гантелью
        (27, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (27, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (27, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 28. Жим штанги на наклонной скамье
        (28, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.55, true),
        (28, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.2, false),
        (28, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),
        (28, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.1, false),

        -- 29. Тяга нижнего блока к поясу
        (29, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.6000, true),
        (29, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.3000, false),
        (29, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.1000, false),

        -- 30. Разведение гантелей лежа
        (30, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.65, true),
        (30, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.20, false),
        (30, (SELECT id FROM muscle_groups WHERE code = 'LOWER_CHEST'), 0.15, false),

        -- 31. Шраги со штангой
        (31, (SELECT id FROM muscle_groups WHERE code = 'TRAPS'), 1.0000, true),

        -- 32. Обратные гиперэкстензии
        (32, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.5000, true),
        (32, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.5000, false),

        -- 33. Скручивания на римском стуле
        (33, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 0.6000, true),
        (33, (SELECT id FROM muscle_groups WHERE code = 'OBLIQUES'), 0.4000, false),

        -- 34. Подъем ног в висе
        (34, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 35. Жим ногами одной ногой
        (35, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (35, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (35, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 36. Молотковые сгибания с гантелями
        (36, (SELECT id FROM muscle_groups WHERE code = 'BRACHIALIS'), 0.6000, true),
        (36, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.4000, false),

        -- 37. Жим Арнольда
        (37, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.45, true),
        (37, (SELECT id FROM muscle_groups WHERE code = 'SIDE_DELTS'), 0.35, false),
        (37, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.15, false),
        (37, (SELECT id FROM muscle_groups WHERE code = 'REAR_DELTS'), 0.05, false),

        -- 38. Тяга штанги к подбородку
        (38, (SELECT id FROM muscle_groups WHERE code = 'SIDE_DELTS'), 0.4000, true),
        (38, (SELECT id FROM muscle_groups WHERE code = 'TRAPS'), 0.4000, false),
        (38, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2000, false),

        -- 39. Выпады назад с гантелями
        (39, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.5000, true),
        (39, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (39, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),

        -- 40. Отжимания с колен
        (40, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.4000, true),
        (40, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.3000, false),
        (40, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2000, false),
        (40, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1000, false),

        -- 41. Тяга верхнего блока обратным хватом
        (41, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.5000, true),
        (41, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.3000, false),
        (41, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.2000, false),

        -- 42. Жим гантелей на наклонной скамье
        (42, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.55, true),
        (42, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.2, false),
        (42, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),
        (42, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.1, false),

        -- 43. Румынская тяга с гантелями
        (43, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.6000, true),
        (43, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.4000, false),

        -- 44. Сведение рук в кроссовере (верхние блоки)
        (44, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.6, true),
        (44, (SELECT id FROM muscle_groups WHERE code = 'LOWER_CHEST'), 0.2, false),
        (44, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.2, false),

        -- 45. Разведение гантелей в наклоне
        (45, (SELECT id FROM muscle_groups WHERE code = 'REAR_DELTS'), 1.0000, true),

        -- 46. Приседания со штангой на груди (фронтальные)
        (46, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.7000, true),
        (46, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.2000, false),
        (46, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 47. Подъем ног лежа на скамье (обратные скручивания)
        (47, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 48. Сгибание рук со штангой (бицепс)
        (48, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 1.0000, true),

        -- 49. Разгибание рук на верхнем блоке (трицепс)
        (49, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 1.0000, true),

        -- 50. Боковые выпады с гантелей
        (50, (SELECT id FROM muscle_groups WHERE code = 'ADDUCTORS'), 0.6000, true),
        (50, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (50, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.1000, false),

        -- 51. Бег на беговой дорожке
        (51, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.35, true),
        (51, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3, false),
        (51, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.15, false),
        (51, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 0.2, false),

        -- 52. Интервальный бег на дорожке
        (52, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.35, true),
        (52, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3, false),
        (52, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.15, false),
        (52, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 0.2, false),

        -- 53. Ходьба на беговой дорожке (наклон)
        (53, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.4000, true),
        (53, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.3000, false),
        (53, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 0.2000, false),
        (53, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 54. Велотренажёр
        (54, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.5000, true),
        (54, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (54, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),

        -- 55. Эллиптический тренажёр
        (55, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.3000, false),
        (55, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, true),
        (55, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),
        (55, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 0.2000, false),

        -- 56. Гребной тренажёр
        (56, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.3, true),
        (56, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.2, false),
        (56, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.15, false),
        (56, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.2, false),
        (56, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.15, false),

        -- 57. Степпер
        (57, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.4000, true),
        (57, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.3000, false),
        (57, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 0.2000, false),
        (57, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 58. Прыжки на скакалке
        (58, (SELECT id FROM muscle_groups WHERE code = 'CALVES'), 0.5000, true),
        (58, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.3000, false),
        (58, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.2000, false),

        -- 59. Отжимания с широкой постановкой рук
        (59, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.55, true),
        (59, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.15, false),
        (59, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.15, false),
        (59, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),

        -- 60. Отжимания с узкой постановкой рук
        (60, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.6, true),
        (60, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.3, false),
        (60, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.1, false),

        -- 61. Алмазные отжимания
        (61, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.7, true),
        (61, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.2, false),
        (61, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.1, false),

        -- 62. Отжимания на кулаках
        (62, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.45, true),
        (62, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (62, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2, false),
        (62, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 63. Отжимания с ногами на возвышении
        (63, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.55, true),
        (63, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.2, false),
        (63, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),
        (63, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.10, false),

        -- 64. Отжимания с хлопком (плиометрика)
        (64, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.45, true),
        (64, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (64, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2, false),
        (64, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 65. Отжимания с колен
        (65, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.45, true),
        (65, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (65, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2, false),
        (65, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 66. Отжимания от стены
        (66, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.45, true),
        (66, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (66, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.2, false),
        (66, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 67. Индуистские отжимания
        (67, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.35, true),
        (67, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.3, false),
        (67, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (67, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 68. «Молитва» (скручивания с верхнего блока)
        (68, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 69. Скручивания лежа на полу
        (69, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 70. Обратные скручивания
        (70, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 71. Подъем ног в висе на перекладине
        (71, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 72. Боковые скручивания (на косые мышцы)
        (72, (SELECT id FROM muscle_groups WHERE code = 'OBLIQUES'), 1.0000, true),

        -- 73. Скручивания на фитболе
        (73, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 74. Скручивания в тренажёре (римский стул)
        (74, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 75. Подъем ног с фитболом
        (75, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 76. «Дровосек»
        (76, (SELECT id FROM muscle_groups WHERE code = 'OBLIQUES'), 0.6000, true),
        (76, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 0.4000, false),

        -- 77. Боковая планка
        (77, (SELECT id FROM muscle_groups WHERE code = 'OBLIQUES'), 0.5000, true),
        (77, (SELECT id FROM muscle_groups WHERE code = 'TRANSVERSE_ABDOMINIS'), 0.5000, false),

        -- 78. Складка (V-up)
        (78, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 79. «Велосипед»
        (79, (SELECT id FROM muscle_groups WHERE code = 'OBLIQUES'), 0.5000, true),
        (79, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 0.5000, false),

        -- 80. «Ножницы»
        (80, (SELECT id FROM muscle_groups WHERE code = 'RECTUS_ABDOMINIS'), 1.0000, true),

        -- 81. Бёрпи (Burpee)
        (81, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.3, true),
        (81, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3, false),
        (81, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.2, false),
        (81, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.1, false),
        (81, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.1, false),

        -- 82. Приседания с выпрыгиванием
        (82, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (82, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.4000, false),

        -- 83. Прыжки в длину с места
        (83, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.5000, true),
        (83, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (83, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),

        -- 84. Прыжки на тумбу (Box Jumps)
        (84, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (84, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.4000, false),

        -- 85. Выпады с выпрыгиванием
        (85, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.5000, true),
        (85, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (85, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),

        -- 86. Тяга штанги Т-грифа
        (86, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.6000, true),
        (86, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.3000, false),
        (86, (SELECT id FROM muscle_groups WHERE code = 'TRAPS'), 0.1000, false),

        -- 87. Жим штанги лежа узким хватом
        (87, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.6000, true),
        (87, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.3000, false),
        (87, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.1000, false),

        -- 88. Приседания Зерхера
        (88, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (88, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (88, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 89. Сгибание рук на бицепс на скамье Скотта
        (89, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 1.0000, true),

        -- 90. Разгибание рук на трицепс с канатом
        (90, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 1.0000, true),

        -- 91. Тяга гантели к поясу в наклоне (одной рукой)
        (91, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.6000, true),
        (91, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.3000, false),
        (91, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.1000, false),

        -- 92. Попеременный жим гантелей лежа
        (92, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.5, true),
        (92, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.25, false),
        (92, (SELECT id FROM muscle_groups WHERE code = 'FRONT_DELTS'), 0.15, false),
        (92, (SELECT id FROM muscle_groups WHERE code = 'UPPER_CHEST'), 0.1, false),

        -- 93. Наклоны со штангой на плечах («Доброе утро»)
        (93, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.45, true),
        (93, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3, false),
        (93, (SELECT id FROM muscle_groups WHERE code = 'SPINAL_ERECTORS'), 0.25, false),

        -- 94. Приседания с гантелью у груди (Goblet Squat)
        (94, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.6000, true),
        (94, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (94, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.1000, false),

        -- 95. Отведение бедра в кроссовере
        (95, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 1.0000, true),

        -- 96. Тяга верхнего блока к груди широким хватом
        (96, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.7000, true),
        (96, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.2000, false),
        (96, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.1000, false),

        -- 97. Тяга нижнего блока к поясу
        (97, (SELECT id FROM muscle_groups WHERE code = 'LATS'), 0.6000, true),
        (97, (SELECT id FROM muscle_groups WHERE code = 'RHOMBOIDS'), 0.3000, false),
        (97, (SELECT id FROM muscle_groups WHERE code = 'BICEPS'), 0.1000, false),

        -- 98. Ходьба выпадами с гантелями
        (98, (SELECT id FROM muscle_groups WHERE code = 'QUADRICEPS'), 0.5000, true),
        (98, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.3000, false),
        (98, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.2000, false),

        -- 99. Отжимания на брусьях с весом
        (99, (SELECT id FROM muscle_groups WHERE code = 'TRICEPS'), 0.5000, true),
        (99, (SELECT id FROM muscle_groups WHERE code = 'MID_CHEST'), 0.3000, false),
        (99, (SELECT id FROM muscle_groups WHERE code = 'LOWER_CHEST'), 0.2000, false),

        -- 100. Становая тяга на прямых ногах (румынская) с гантелями
        (100, (SELECT id FROM muscle_groups WHERE code = 'HAMSTRINGS'), 0.6000, true),
        (100, (SELECT id FROM muscle_groups WHERE code = 'GLUTES'), 0.4000, false);    
    `);

    // Триггер
    pgm.sql(`
        -- Создание триггера для exercises_muscle_groups
        CREATE TRIGGER update_exercises_muscle_groups_updated_at
        BEFORE UPDATE ON exercises_muscle_groups
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    // Удаление всех данных
    pgm.sql(`
        DELETE FROM exercises_muscle_groups
        WHERE exercise_id BETWEEN 1 AND 100;
    `);

    pgm.dropTable('exercises_muscle_groups');
}
