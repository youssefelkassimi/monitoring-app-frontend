import { authHeaders } from './authService';

const BASE_URL = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api/agents`;

const jsonHeaders = {
    "Content-Type": "application/json",
};

const buildUrl = (path = "", params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, value);
            console.log(url.toString())
        }
    });


    return url.toString();
};

const request = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: authHeaders(options.headers),
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const message = body?.message || `HTTP error! status: ${response.status}`;
        throw new Error(message);
    }


    return body?.status === "ok" ? body.data : body;
};

export const getAllAgents = async () => request(BASE_URL);
export const getAgentById = async (id) => request(buildUrl(`/${id}`));
export const getData = async (id, endpoint, pageable) => request(buildUrl(`/${id}/${endpoint}`, pageable))
export const getLastData = async (id, endpoint) => request(buildUrl(`/${id}/${endpoint}/latest`))
export const getAlertsPage = async (pageable) => request(buildUrl(`/alerts`, pageable))

export const getAgentAlertsPage = async (agentId, pageable) => request(buildUrl(`/${agentId}/alerts`, pageable))

export const getAnomliesPage = async (pageable, status = '') => request(buildUrl(`/anomlies`, { pageable: pageable, status: status }))

export const getAgentAnomaliesPage = async (agentId, pageable) => request(buildUrl(`/${agentId}/anomlies`, pageable))


export const executeCommand = async (id, command) => request(buildUrl(`/${id}/commands`), {
    method: "POST",
    headers: authHeaders(jsonHeaders),
    body: JSON.stringify(command),
});
export const getAgentCommands = async (agentId, pageable = {}) => request(buildUrl(`/${agentId}/commands`, pageable));

export const provisionAgent = async (payload) =>
    request(`${import.meta.env.VITE_BACKEND_API_BASE_URL}/api`, {
        method: "POST",
        headers: authHeaders(jsonHeaders),
        body: JSON.stringify(payload),
    });

export const renameAgent = async (id, label) =>
    request(buildUrl(`/${id}/${label}`), {
        method: "PATCH",
        headers: authHeaders(jsonHeaders),
    });

export const revokeAgent = async (id) =>
    request(buildUrl(`/${id}/toggleRevokeStatus`), {
        method: "PATCH",
        headers: authHeaders(jsonHeaders),
    });

export const deleteAgent = async (id) =>
    request(buildUrl(`/${id}`), {
        method: "DELETE",
        headers: jsonHeaders,
    });



