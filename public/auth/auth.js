const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function setTokens({ accessToken, refreshToken }) {
    if (typeof accessToken !== 'string' || !accessToken) {
        throw new TypeError('accessToken must be a non-empty string.');
    }

    if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new TypeError('refreshToken must be a non-empty string.');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}
