import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setTokens
} from '/auth/auth.js';

let refreshPromise = null;

export class ApiError extends Error {
    constructor(message, status, payload = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

function shouldSkipRefresh(path) {
    return [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/logout'
    ].some((endpoint) => path === endpoint);
}

function redirectToLogin() {
    const path = window.location.pathname;

    if (!path.startsWith('/auth/')) {
        window.location.replace('/auth/login/index.html');
    }
}

async function parseResponse(response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text || null;
}

function getErrorMessage(payload, fallback) {
    if (payload && typeof payload === 'object' && typeof payload.message === 'string') {
        return payload.message;
    }

    if (typeof payload === 'string' && payload.trim()) {
        return payload;
    }

    return fallback;
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return false;
    }

    if (!refreshPromise) {
        refreshPromise = fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        })
            .then(async (response) => {
                const payload = await parseResponse(response);

                if (!response.ok) {
                    throw new ApiError(
                        getErrorMessage(payload, 'Сессия истекла.'),
                        response.status,
                        payload
                    );
                }

                setTokens(payload);
                return true;
            })
            .catch(() => {
                clearTokens();
                return false;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export async function apiRequest(path, options = {}, canRefresh = true) {
    const headers = new Headers(options.headers ?? {});
    const hasBody = options.body !== undefined && options.body !== null;

    if (hasBody && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const accessToken = getAccessToken();

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(path, {
        ...options,
        headers
    });

    const payload = await parseResponse(response);

    if (response.status === 401 && canRefresh && !shouldSkipRefresh(path)) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            return apiRequest(path, options, false);
        }

        redirectToLogin();
    }

    if (!response.ok) {
        throw new ApiError(
            getErrorMessage(payload, `Ошибка запроса (${response.status}).`),
            response.status,
            payload
        );
    }

    return payload;
}

export async function apiJson(path, options = {}, canRefresh = true) {
    const requestOptions = {
        ...options
    };

    if (requestOptions.body !== undefined && requestOptions.body !== null && !(requestOptions.body instanceof FormData)) {
        requestOptions.body = JSON.stringify(requestOptions.body);
    }

    return apiRequest(path, requestOptions, canRefresh);
}

export function requireAuth() {
    if (!getAccessToken() && !getRefreshToken()) {
        redirectToLogin();
        return false;
    }

    return true;
}
