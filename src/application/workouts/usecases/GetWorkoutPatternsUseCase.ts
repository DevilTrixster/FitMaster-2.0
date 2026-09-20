import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetWorkoutPatternsUseCase } from '../Contracts.js';
import { GetWorkoutPatternsRequest } from '../DTO.js';

export class GetWorkoutPatternsUseCase implements IGetWorkoutPatternsUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(request: GetWorkoutPatternsRequest) {
        const repository = this.database.repositories().getUserWorkoutPatternRepository();

        switch (request.type) {
            case 'byId':
                return repository.findById(request.patternId);
            case 'all':
                return repository.findAll();
            case 'byType':
                return repository.findByType(request.patternType);
            case 'byParent':
                return repository.findByParentPatternId(request.parentPatternId);
        }
    }
}
