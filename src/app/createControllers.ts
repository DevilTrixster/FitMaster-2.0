import { AuthController } from '../http/controllers/AuthController.js';
import { ILogoutUserUseCase, IRegisterUserUseCase, ILoginUserUseCase, 
    IRefreshTokenUseCase, IGetCurrentUserUseCase 
} from '../application/users/auth/Contracts.js';

interface UseCases {
    registerUser: IRegisterUserUseCase;
    loginUser: ILoginUserUseCase;
    logoutUser: ILogoutUserUseCase;
    refreshToken: IRefreshTokenUseCase;
    getCurrentUser: IGetCurrentUserUseCase;
}

export function createControllers(useCases: UseCases) {

    return {
    authController: new AuthController(
        useCases.registerUser,
        useCases.loginUser,
        useCases.logoutUser,
        useCases.refreshToken,
        useCases.getCurrentUser,
    ),
};
}