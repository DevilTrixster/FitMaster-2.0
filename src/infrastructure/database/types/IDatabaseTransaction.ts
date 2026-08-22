import { IDatabaseExecutor } from './IDatabaseExecutor.js';

export interface IDatabaseTransaction {
    run<T>(callback: (executor: IDatabaseExecutor) => Promise<T>): Promise<T>;
}