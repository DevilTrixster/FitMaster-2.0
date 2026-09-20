import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetMuscleGroupsUseCase } from '../Contracts.js';
import { GetMuscleGroupsRequest } from '../DTO.js';

export class GetMuscleGroupsUseCase implements IGetMuscleGroupsUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(request: GetMuscleGroupsRequest) {
        const repository = this.database.repositories().getMuscleGroupRepository();

        switch (request.type) {
            case 'byId':
                return repository.findById(request.muscleGroupId);
            case 'byCode':
                return repository.findByCode(request.code);
            case 'all':
                return repository.findAll();
            case 'root':
                return repository.findRootGroups();
            case 'children':
                return repository.findChildren(request.parentId);
        }
    }
}
