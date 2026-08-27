import { ILogoutUserUseCase } from '../application/users/auth/contracts/ILogoutUserUseCase.js';
import { AuthController } from '../http/controllers/AuthController.js';

interface UseCases {
    logoutUser: ILogoutUserUseCase;
}

export function createControllers(useCases: UseCases) {

    return { authController: new AuthController(useCases.logoutUser)};
}