import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetExerciseMuscleGroupsUseCase } from '../Contracts.js';
import { GetExerciseMuscleGroupsRequest } from '../DTO.js';

export class GetExerciseMuscleGroupsUseCase implements IGetExerciseMuscleGroupsUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(request: GetExerciseMuscleGroupsRequest) {
        const repository = this.database.repositories().getExerciseMuscleGroupRepository();

        switch (request.type) {
            case 'byExercise':
                return repository.findByExerciseId(request.exerciseId);
            case 'primaryByExercise':
                return repository.findPrimaryByExerciseId(request.exerciseId);
            case 'byMuscleGroup':
                return repository.findByMuscleGroupId(request.muscleGroupId);
        }
    }
}
