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
  Recomposition = 'recomposition',    // Перекомпановка - изменчивость упражнений
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