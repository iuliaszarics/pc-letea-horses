import axios from "axios";

const RAW_BASE = process.env.REACT_APP_API_URL || "https://localhost:2000";
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

export function success(token, username, extra = {}) {
    return { succeeded: true, token, username, ...extra };
}
export function failure(message) {
    return { succeeded: false, errorMessage: message || "Unexpected error." };
}
export function parseError(err, fallback) {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    if (data?.errorMessage) return data.errorMessage;
    if (data?.message) return data.message;
    return fallback;
}

export async function loginAPI(username, password) {
    try {
        const res = await api.post("/api/users/login", {
            userName: username,
            password,
        });

        const token = res.data?.token;
        const uname = res.data?.userName ?? res.data?.username ?? username;

        if (!token) return failure("No token returned by server.");
        return success(token, uname);
    } catch (err) {
        return failure(parseError(err, "Login failed."));
    }
}

export async function registerAPI(email, username, password, confirmPassword) {
    try {
        const res = await api.post("/api/users/register", {
            userName: username,
            email,
            password,
            confirmPassword,
        });

        const token = res.data?.token;
        const uname = res.data?.userName ?? res.data?.username ?? username;

        if (!token) return failure("No token returned by server.");
        return success(token, uname);
    } catch (err) {
        return failure(parseError(err, "Registration failed."));
    }
}
