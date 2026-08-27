import { IRepositoryProvider } from '../repositories/IRepositoryProvider.js';

export interface IDatabase {
    repositories(): IRepositoryProvider;
    transaction<T>(callback: (repositories: IRepositoryProvider) => Promise<T>): Promise<T>;
}