import { authHeaders } from './authService';

const BASE_URL = "http://localhost:8080/api/agents";

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

export const executeCommand = async (id, command) => request(buildUrl(`/${id}/commands`), {
    method: "POST",
    headers: authHeaders(jsonHeaders),
    body: JSON.stringify(command),
});
export const getAgentCommands = async (agentId, pageable = {}) => request(buildUrl(`/${agentId}/commands`, pageable));

export const provisionAgent = async (payload) =>
    request("http://localhost:8080/api", {
        method: "POST",
        headers: authHeaders(jsonHeaders),
        body: JSON.stringify(payload),
    });

export const renameAgent = async (id, label) =>
    request(buildUrl(`/${id}`), {
        method: "PATCH",
        headers: authHeaders(jsonHeaders),
        body: JSON.stringify({ label }),
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
// let chec = await getLastData("8c99af2a-219e-469d-866c-76d681556935", "service")
// let che = JSON.parse(chec);
// console.log(che)

// await revokeAgent("8c99af2a-219e-469d-866c-76d681556935")

// let alerts = await getAlertsPage();
// console.log(alerts)
// const agentId = '9d51ee29-e506-45c2-bc8e-95d41906f8e9'
// const command = {
//     command: 'ls',
//     userId: "a1b2c3d4-1111-4aaa-8bbb-000000000001",
//     args: [],//JSON.stringify(args),
//     timeout: 5,
// }
// const created = await executeCommand(agentId, command);
// console.log(created)


