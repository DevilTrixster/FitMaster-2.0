import { MetricType, MetricValueType } from '../../shared/enum.js';

// Представление значений
export type WorkoutValue =
    | {
          type: MetricType.Reps; // повторения(количество) -> число
          metric: MetricValueType.Count;
          value: number;
      }
    | {
          type: MetricType.Weight; // вес(кг) -> число
          metric: MetricValueType.Kg;
          value: number;
      }
    | {
          type: MetricType.Duration; // длительность(ММ:SS) -> строка
          metric: MetricValueType.MinSec;
          value: string;
      }
    | {
          type: MetricType.Distance; // дистанция(метрах) -> число
          metric: MetricValueType.Metr;
          value: number;
      };
