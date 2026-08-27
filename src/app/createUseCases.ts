import { IDatabase } from '../application/ports/database/IDatabase.js';
import { ITokenService } from '../application/users/auth/services/ITokenService.js';
import { LogoutUserUseCase } from '../application/users/auth/usecases/LogoutUserUseCase.js';


export function createUseCases(database: IDatabase, tokenService: ITokenService){

    return { logoutUser: new LogoutUserUseCase(database, tokenService)};
}