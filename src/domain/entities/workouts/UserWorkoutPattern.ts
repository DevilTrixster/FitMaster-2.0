import {
    WorkoutPatternType,
    WorkoutPatternGeneration
} from '../../../shared/enum.js';
import { WorkoutPlan } from '../../types/workouts/WorkoutPlan.js';

export class UserWorkoutPattern {
    public readonly id?: string;
    public readonly parentPatternId: string | null;
    public readonly name: string;
    public readonly type: WorkoutPatternType;
    public readonly generationSource: WorkoutPatternGeneration;
    public readonly patternData: WorkoutPlan;
    public readonly createdAt: Date;
    constructor(data: {
        id?: string;
        parentPatternId: string | null;
        name: string;
        type: WorkoutPatternType;
        generationSource: WorkoutPatternGeneration;
        patternData: WorkoutPlan;
        createdAt?: Date;
    }) {
        this.id = data.id;
        this.parentPatternId = data.parentPatternId;
        this.name = data.name;
        this.type = data.type;
        this.generationSource = data.generationSource;
        this.patternData = data.patternData;
        this.createdAt = data.createdAt ?? new Date();
    }
}
