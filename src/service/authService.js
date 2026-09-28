const TOKEN_KEY = 'monitor.jwt';
const USER_KEY = 'monitor.user';
const BASE_URL = 'http://localhost:8080/api/auth';

const jsonHeaders = { 'Content-Type': 'application/json' };

const request = async (url, options = {}) => {
    const res = await fetch(url, options);
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
        throw new Error(body?.message || `HTTP ${res.status}`);
    }
    return body?.status === 'ok' ? body.data : body;
};

function decodePayload(token) {
    try {
        const segment = token.split('.')[1];
        const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
    const token = getToken();
    const payload = token ? decodePayload(token) : null;

    const fromToken = payload
        ? {
            username: payload.username ?? payload.sub,
            role: payload.role ?? payload.authorities?.[0],
        }
        : null;

    const cached = (() => {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    })();

    if (fromToken) return { ...cached, ...fromToken };
    return cached;
}

export function isTokenExpired(token = getToken()) {
    const payload = token ? decodePayload(token) : null;
    if (!payload?.exp) return true;
    return payload.exp * 1000 <= Date.now();
}

export async function login(credentials) {
    const data = await request(`${BASE_URL}/login`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(credentials),
    });

    const token = data?.token ?? data?.accessToken;
    if (!token) throw new Error('Login response did not contain a token');

    const payload = decodePayload(token);
    if (!payload?.username && !payload?.sub) {
        throw new Error('Login response did not contain a valid user identity');
    }

    const user = {
        username: payload.username ?? payload.sub,
        role: payload.role ?? payload.authorities?.[0],
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
}

export async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    try {
        await request(`${BASE_URL}/logout`, { method: 'POST' });
    } catch {
        /* ignore network errors — local state is already cleared */
    }
}

export function authHeaders(headers = {}) {
    const token = getToken();
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

