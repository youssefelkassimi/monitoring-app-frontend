import { authHeaders } from './authService';
const BASE_URL = "http://localhost:8080/api/users";

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

export const getAllUsers = async () => request(BASE_URL);

export const getUsersByRole = async (role) => request(buildUrl("", { role }));

export const getOnlineUsers = async () => request(buildUrl("", { online: true }));

export const getOfflineUsers = async () => request(buildUrl("", { online: false }));

export const getUserById = async (id) => request(buildUrl(`/${id}`));

export const getUserByEmail = async (email) => request(buildUrl("/by-email", { email }));

export const existsUserByEmail = async (email) => request(buildUrl("/exists", { email }));

export const getUserCounts = async () => request(buildUrl("/counts"));

export const createUser = async (user) =>
    request(BASE_URL, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(user),
    });

export const updateUser = async (user) =>
    request(buildUrl(`/${user.id}`), {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify(user),
    });

export const setUserOnlineStatus = async (id, online) =>
    request(buildUrl(`/${id}/online`, { online }), {
        method: "PATCH",
    });
export const deleteUser = async (id) =>
    request(buildUrl(`/${id}`), {
        method: "DELETE",
    });
export const logoutUser = async (id) =>
    request(buildUrl(`/${id}/logout`), {
        method: "POST",
    });
// const users = await request(BASE_URL);
// console.log(users);
// setTimeout(() => {
//     logoutUser("a1b2c3d4-1111-4aaa-8bbb-000000000001");
// }, 10000);
//
// const user = {
//     email: "amin.cakri@example.com",
//     fullName: "Amin chakri",
//     id: "a1b2c3d4-1111-4aaa-8bbb-000000000001",
//     isOnline: true,
//     password: "",
//     role: "ADMIN",
// }
//
// setTimeout(() => {
//     updateUser(user);
// }, 14000);
