// Гендер пользователя
export enum Gender { 
    Male = 'male', 
    Female = 'female' 
}

// Уровень попыта пользователя
export enum ExperienceLevel {
    Beginner = 'beginner',   // 0–3 мес
    Novice = 'novice',       // 3–12 мес
    Intermediate = 'intermediate', // 1–3 года
    Advanced = 'advanced',   // 3–5 лет
    Master = 'master'        // 5–8 лет
}

// Цели пользователя
export enum FitnessGoal {
    WeightLoss = 'weight_loss',         // Похудение
    MuscleGain = 'muscle_gain',         // Наращивание мышц
    Strength = 'strength',              // Сила
    Maintenance = 'maintenance',        // Поддержка
    Endurance = 'endurance',            // Выносливость
    Aesthetics = 'aesthetics',          // Эстетичность тела
    Recomposition = 'recomposition',    // Перекомпановка - одновременная работа над составом тела(снижение жира и увеличение мышц)
    Mobility = 'mobility',              // Мобильность/Подвижность
    Rehabilitation = 'rehabilitation',  // Реабилитация - после травм
    Sports = 'sports',                  // Для конкретного спорта
    Event = 'event',                    // Для события
    StressRelief = 'stress_relief',     // Снятия стресса
    Energy = 'energy',                  // Энергия
    Competition = 'competition',        // Соревнования
    Posture = 'posture',                // Со своим телом
    HealthyAging = 'healthy_aging'      // Поддержание здоровья
}

// Типы упражнений
export enum EquipmentType {
    Barbell = 'barbell', // упражнения со штангой/грифом
    Dumbbell = 'dumbbell', // гантели
    Bodyweight = 'bodyweight', // с собственным весом
    Cardio = 'cardio', // кардио
    Machine = 'machine', // тренажёр
    Plyometric = 'plyometric', // упражнения с динамическим циклом
}

// Типы мышц и "подмышц"
export enum Muscle {
    // ОСНОВНЫЕ
    Legs = 'LEGS', // ноги
    Chest = 'CHEST', // грудь
    Back = 'BACK', // спина
    Shoulders = 'SHOULDERS', // плечи
    Arms = 'ARMS', // руки
    Core = 'CORE', // кор

    // ПОБОЧНЫЕ 
    Quadriceps = 'QUADRICEPS', // квадрицепсы
    Glutes = 'GLUTES', // ягодичные
    Hamstrings = 'HAMSTRINGS', // бицепс бедра
    Adductors = 'ADDUCTORS', // приводящие
    Calves = 'CALVES', // икры

    UpperChest = 'UPPER_CHEST', // верх груди
    MidChest = 'MID_CHEST', // средняя часть груди
    LowerChest = 'LOWER_CHEST', // нижняя часть груди

    Lats = 'LATS', // широчайшие
    Traps = 'TRAPS', // трапеция
    Rhomboids = 'RHOMBOIDS', // ромбовидные
    TeresMajor = 'TERES_MAJOR', // большая круглая
    SpinalErectors = 'SPINAL_ERECTORS', // разгибатели спины

    FrontDelts = 'FRONT_DELTS', // передняя дельта
    SideDelts = 'SIDE_DELTS', // средняя дельта
    RearDelts = 'REAR_DELTS', // задняя дельта

    Biceps = 'BICEPS', // бицепс
    Triceps = 'TRICEPS', // трицепс
    Brachialis = 'BRACHIALIS', // плечевые мышцы (брахиалис)
    Forearms = 'FOREARMS', // предплечье

    RectusAbdominis = 'RECTUS_ABDOMINIS', // прямые мышцы живота
    Obliques = 'OBLIQUES', // косые мышцы живота
    TransverseAbdominis = 'TRANSVERSE_ABDOMINIS', // поперечные мышцы живота
}

// Типы шаблонов для WorkoutPattern
export enum WorkoutPatternType {
    FallBack = 'FALLBACK', // "полследняя надежда"/аварийный шаблон - 1
    Default = 'DEFAULT', // дефолтный шаблон который вписан в таблицу изначально - 3
    Adaptive = 'ADAPTIVE', // шаблоны которые создала адаптация - все остальные
}

// Типизация того кем был создан шаблон для WorkoutPattern
export enum WorkoutPatternGeneration {
    System = 'SYSTEM', // системно - создан до адаптации
    Adaptation = 'ADAPTATION', // создано адаптацией
    Outside = 'OUTSIDE', // иные способы создания
}

// Типы нагрузок
export enum MetricType {
    Reps = 'reps', // повторение
    Weight = 'weight', // вес
    Duration = 'duration', // продолжительность (по времени)
    Distance = 'distance' // дистанция/расстояние
}

// Типы метрик
export enum MetricValueType {
    Kg = 'kg', // килограммы
    Km = 'km', // километры
    Metr = 'metr', // метры
    Sm = 'sm', // сантиметры
    Min = 'min', // минуты
    Sec = 'sec', // секунды
    Count = 'count', // повторения
    MinSec = 'min_sec' // минуты:секунды
} 

// Варинты для системы лайков/дизлайков
export enum Reaction {
    Like = 'like', // нравится
    DisLike = 'dislike', // ненаравится
    Neutral = 'neutral' // нейтрально (не отмеченно)
}

export enum UserWorkoutStatus {
    Planned = 'PLANNED', // планируется
    InProgress = 'IN_PROGRESS', // в прогрессе
    Completed = 'COMPLETED', // завершенно
    Cancelled = 'CANCELLED', // пропущенно
}