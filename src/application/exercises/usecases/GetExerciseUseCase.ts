import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetExerciseUseCase } from '../Contracts.js';
import { GetExerciseRequest } from '../DTO.js';

export class GetExerciseUseCase implements IGetExerciseUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(request: GetExerciseRequest) {
        const repository = this.database.repositories().getExerciseRepository();

        switch (request.type) {
            case 'byId':
                return repository.findById(request.exerciseId);
            case 'byIds':
                return repository.findByIds(request.exerciseIds);
            case 'byName':
                return repository.findByName(request.name);
            case 'search':
                return repository.searchActiveByName(request.search);
            case 'allActive':
                return repository.findAllActive();
        }
    }
}
