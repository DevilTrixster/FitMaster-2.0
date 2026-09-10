import { IAuthSessionRepository } from '../../../domain/repositories/IAuthSessionRepository.js';
import { IExerciseRepository } from '../../../domain/repositories/IExerciseRepository.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { IUserWorkoutExerciseRepository } from '../../../domain/repositories/IUserWorkoutExerciseRepository.js';
import { IUserWorkoutPatternRepository } from '../../../domain/repositories/IUserWorkoutPatternRepository.js';
import { IUserWorkoutRepository } from '../../../domain/repositories/IUserWorkoutRepository.js';
import { IUserWorkoutResultRepository } from '../../../domain/repositories/IUserWorkoutResultRepository.js';

export interface IRepositoryProvider {
    getUserRepository(): IUserRepository;
    getUserWorkoutPatternRepository(): IUserWorkoutPatternRepository;
    getUserWorkoutRepository(): IUserWorkoutRepository;
    getUserWorkoutExerciseRepository(): IUserWorkoutExerciseRepository;
    getExerciseRepository(): IExerciseRepository;
    getUserWorkoutResultRepository(): IUserWorkoutResultRepository;
    getAuthSessionRepository(): IAuthSessionRepository;
}
