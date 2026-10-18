import { IGenerateAdaptiveWorkoutUseCase } from './Contracts.js';

export type AdaptiveWorkoutJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AdaptiveWorkoutJobSnapshot {
    workoutId: number;
    status: AdaptiveWorkoutJobStatus;
    updatedAt: string;
    patternId?: string;
}

/**
 * Keeps adaptation work out of the HTTP request that completes a workout.
 * The job state is intentionally in-memory for this diploma project; workout
 * and generated pattern data themselves are still persisted in PostgreSQL.
 */
export class AdaptiveWorkoutJobTracker {
    private readonly jobs = new Map<string, AdaptiveWorkoutJobSnapshot>();

    constructor(
        private readonly generateAdaptiveWorkoutUseCase: IGenerateAdaptiveWorkoutUseCase
    ) {}

    start(userId: number, workoutId: number): void {
        this.removeExpiredJobs();

        const key = this.getKey(userId, workoutId);
        const current = this.jobs.get(key);
        if (current && current.status !== 'FAILED') {
            return;
        }

        this.jobs.set(key, {
            workoutId,
            status: 'PENDING',
            updatedAt: new Date().toISOString()
        });

        // Let Express send the completed-workout response before starting the
        // heavier DB/AI work. The task handles its own errors and never rejects
        // into the HTTP request lifecycle.
        setTimeout(() => {
            void this.run(userId, workoutId, key);
        }, 0);
    }

    getStatus(userId: number, workoutId: number): AdaptiveWorkoutJobSnapshot | null {
        this.removeExpiredJobs();
        return this.jobs.get(this.getKey(userId, workoutId)) ?? null;
    }

    private async run(userId: number, workoutId: number, key: string): Promise<void> {
        this.setStatus(key, workoutId, 'RUNNING');

        try {
            const pattern = await this.generateAdaptiveWorkoutUseCase.execute(userId, workoutId);
            this.jobs.set(key, {
                workoutId,
                status: 'COMPLETED',
                updatedAt: new Date().toISOString(),
                ...(pattern.id ? { patternId: pattern.id } : {})
            });
        } catch (error) {
            this.jobs.set(key, {
                workoutId,
                status: 'FAILED',
                updatedAt: new Date().toISOString()
            });
            console.error(
                `[Adaptation] Failed to generate a workout for user ${userId}, workout ${workoutId}:`,
                error
            );
        }
    }

    private setStatus(
        key: string,
        workoutId: number,
        status: AdaptiveWorkoutJobStatus
    ): void {
        this.jobs.set(key, {
            workoutId,
            status,
            updatedAt: new Date().toISOString()
        });
    }

    private getKey(userId: number, workoutId: number): string {
        return `${userId}:${workoutId}`;
    }

    private removeExpiredJobs(): void {
        const expiryMs = 6 * 60 * 60 * 1000;
        const now = Date.now();

        for (const [key, job] of this.jobs) {
            if (
                job.status !== 'PENDING' &&
                job.status !== 'RUNNING' &&
                now - new Date(job.updatedAt).getTime() > expiryMs
            ) {
                this.jobs.delete(key);
            }
        }
    }
}
