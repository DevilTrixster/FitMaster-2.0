import { MetricType } from '../../shared/enum.js'

export type UserWorkoutExerciseTarget =
    | {
        metric: MetricType.Reps;
        value: number;
    }
    | {
        metric: MetricType.Weight;
        value: number;
    }
    | {
        metric: MetricType.Duration;
        value: string;
    }
    | {
        metric: MetricType.Distance;
        value: number;
    };