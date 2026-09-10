import { ExerciseAdaptationRequest } from '../dto/exercise/ExerciseAdaptationRequest.js';
import { ExerciseAdaptationResponse } from '../dto/exercise/ExerciseAdaptationResponse.js';

export interface IExerciseAdaptationService {
    adaptExercise(
        request: ExerciseAdaptationRequest
    ): Promise<ExerciseAdaptationResponse>;
}
