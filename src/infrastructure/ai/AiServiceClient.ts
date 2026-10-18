import { adaptationGenerateResponseSchema } from '../../application/adaptation/DTO.js';
import {
    AdaptationGenerateClientRequest,
    AdaptationGenerateClientResponse,
    IAdaptationClient
} from '../../application/adaptation/Contracts.js';

function getConfig(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
}

export class AiServiceClient implements IAdaptationClient {
    private readonly baseUrl: string;
    private readonly timeoutMs: number;

    constructor() {
        this.baseUrl = getConfig('AI_SERVICE_URL', 'http://127.0.0.1:8000').replace(/\/$/, '');
        const configuredTimeout = Number(process.env.AI_SERVICE_TIMEOUT_MS ?? 150000);
        // Old .env files often contain 60000 ms, which is too short for a free
        // model that may reason slowly. Keep a 2-minute minimum for adaptation.
        this.timeoutMs = Number.isFinite(configuredTimeout)
            ? Math.max(120000, configuredTimeout)
            : 150000;
    }

    async generate(
        request: AdaptationGenerateClientRequest
    ): Promise<AdaptationGenerateClientResponse> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/adaptation/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
                signal: controller.signal
            });

            const rawText = await response.text();
            let rawBody: unknown = null;

            try {
                rawBody = rawText ? JSON.parse(rawText) : null;
            } catch {
                throw new Error(`AI service returned non-JSON response (HTTP ${response.status})`);
            }

            if (!response.ok) {
                const message =
                    typeof rawBody === 'object' && rawBody !== null && 'detail' in rawBody
                        ? String((rawBody as { detail: unknown }).detail)
                        : `AI service request failed with HTTP ${response.status}`;
                throw new Error(message);
            }

            const parsed = adaptationGenerateResponseSchema.safeParse(rawBody);
            if (!parsed.success) {
                throw new Error(`Invalid AI service response: ${parsed.error.message}`);
            }

            return parsed.data as AdaptationGenerateClientResponse;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`AI service request timed out after ${this.timeoutMs} ms`);
            }
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }
}
