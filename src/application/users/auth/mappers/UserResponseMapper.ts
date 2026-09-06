import { User } from '../../../../domain/entities/user/User.js'
import { UserResponse } from '../DTO.js'

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id!,
        nickname: user.nickname,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        avatarUrl: user.avatarUrl,
        preferredWorkoutTime: user.preferredWorkoutTime,
        preferredDays: user.preferredDays,
        experienceLevel: user.experienceLevel,
        fitnessGoal: user.fitnessGoal,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}