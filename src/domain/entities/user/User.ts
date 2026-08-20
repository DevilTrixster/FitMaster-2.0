import { Gender, ExperienceLevel, FitnessGoal } from '../../../enum.js'

export class User {
  public readonly id?: number;
  public readonly nickname: string;
  public readonly password: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly birthDate: Date;
  public readonly gender: Gender;
  public readonly height: number;
  public readonly weight: number;
  public readonly avatarUrl: string| null;
  public readonly preferredWorkoutTime: string;
  public readonly preferredDays: number[];
  public readonly experienceLevel: ExperienceLevel;
  public readonly fitnessGoal: FitnessGoal;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: {
    id?: number;
    nickname: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: Gender;
    height: number;
    weight: number;
    avatarUrl: string | null;
    preferredWorkoutTime: string;
    preferredDays: number[];
    experienceLevel?: ExperienceLevel;
    fitnessGoal?: FitnessGoal;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.nickname = data.nickname;
    this.password = data.password;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.birthDate = data.birthDate;
    this.gender = data.gender;
    this.height = data.height;
    this.weight = data.weight;
    this.avatarUrl = data.avatarUrl;
    this.preferredWorkoutTime = data.preferredWorkoutTime;
    this.preferredDays = data.preferredDays;
    this.experienceLevel = data.experienceLevel ?? ExperienceLevel.Novice;
    this.fitnessGoal = data.fitnessGoal ?? FitnessGoal.Maintenance;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }
}