import { IDatabase } from '../../contracts_db/DatabaseContracts.js';
import { IGetUserWorkoutUseCase } from '../Contracts.js';
import { GetUserWorkoutRequest } from '../DTO.js';

export class GetUserWorkoutUseCase implements IGetUserWorkoutUseCase {
    constructor(private readonly database: IDatabase) {}

    async execute(userId: number, request: GetUserWorkoutRequest) {
        const repository = this.database.repositories().getUserWorkoutRepository();

        switch (request.type) {
            case 'byId':
                return repository.findByIdAndUserId(request.workoutId, userId);

            case 'byDateRange':
                return repository.findByUserIdAndDateRange(userId, request.from, request.to);

            case 'latest':
                return repository.findLatestByUserId(userId);
        }
    }
}
