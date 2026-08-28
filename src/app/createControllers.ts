import { ILogoutUserUseCase } from '../application/users/auth/contracts/ILogoutUserUseCase.js';
import { AuthController } from '../http/controllers/AuthController.js';
import { IRegisterUserUseCase } from '../application/users/auth/contracts/IRegisterUserUseCase.js';
import { ILoginUserUseCase } from '../application/users/auth/contracts/ILoginUserUseCase.js';
import { IRefreshTokenUseCase } from '../application/users/auth/contracts/IRefreshTokenUseCase.js';
import { IGetCurrentUserUseCase } from '../application/users/auth/contracts/IGetCurrentUserUseCase.js';

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