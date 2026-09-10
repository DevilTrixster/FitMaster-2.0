import { IRepositoryProvider } from '../../application/ports/repositories/IRepositoryProvider.js';
import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository.js';
import { IExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IUserWorkoutExerciseRepository } from '../../domain/repositories/IUserWorkoutExerciseRepository.js';
import { IUserWorkoutPatternRepository } from '../../domain/repositories/IUserWorkoutPatternRepository.js';
import { IUserWorkoutRepository } from '../../domain/repositories/IUserWorkoutRepository.js';
import { IUserWorkoutResultRepository } from '../../domain/repositories/IUserWorkoutResultRepository.js';
import { IDatabaseExecutor } from '../database/types/IDatabaseExecutor.js';

import { AuthSessionRepository } from './user/AuthSessionRepository.js';
import { UserRepository } from './user/UserRepository.js';
import { ExerciseRepository } from './workout/ExerciseRepository.js';
import { UserWorkoutExerciseRepository } from './workout/UserWorkoutExerciseRepository.js';
import { UserWorkoutPatternRepository } from './workout/UserWorkoutPatternRepository.js';
import { UserWorkoutRepository } from './workout/UserWorkoutRepository.js';
import { UserWorkoutResultRepository } from './workout/UserWorkoutResultRepository.js';

export class RepositoryProvider implements IRepositoryProvider {
    private userRepository?: IUserRepository;
    private userWorkoutPatternRepository?: IUserWorkoutPatternRepository;
    private userWorkoutRepository?: IUserWorkoutRepository;
    private userWorkoutExerciseRepository?: IUserWorkoutExerciseRepository;
    private exerciseRepository?: IExerciseRepository;
    private userWorkoutResultRepository?: IUserWorkoutResultRepository;
    private authSessionRepository?: IAuthSessionRepository;

    constructor(private readonly executor: IDatabaseExecutor) {}

    getUserRepository(): IUserRepository {
        if (!this.userRepository) {
            this.userRepository = new UserRepository(this.executor);
        }

        return this.userRepository;
    }

    getUserWorkoutPatternRepository(): IUserWorkoutPatternRepository {
        if (!this.userWorkoutPatternRepository) {
            this.userWorkoutPatternRepository =
                new UserWorkoutPatternRepository(this.executor);
        }

        return this.userWorkoutPatternRepository;
    }

    getUserWorkoutRepository(): IUserWorkoutRepository {
        if (!this.userWorkoutRepository) {
            this.userWorkoutRepository = new UserWorkoutRepository(
                this.executor
            );
        }

        return this.userWorkoutRepository;
    }

    getUserWorkoutExerciseRepository(): IUserWorkoutExerciseRepository {
        if (!this.userWorkoutExerciseRepository) {
            this.userWorkoutExerciseRepository =
                new UserWorkoutExerciseRepository(this.executor);
        }

        return this.userWorkoutExerciseRepository;
    }

    getExerciseRepository(): IExerciseRepository {
        if (!this.exerciseRepository) {
            this.exerciseRepository = new ExerciseRepository(this.executor);
        }

        return this.exerciseRepository;
    }

    getUserWorkoutResultRepository(): IUserWorkoutResultRepository {
        if (!this.userWorkoutResultRepository) {
            this.userWorkoutResultRepository = new UserWorkoutResultRepository(
                this.executor
            );
        }

        return this.userWorkoutResultRepository;
    }

    getAuthSessionRepository(): IAuthSessionRepository {
        if (!this.authSessionRepository) {
            this.authSessionRepository = new AuthSessionRepository(
                this.executor
            );
        }

        return this.authSessionRepository;
    }
}
