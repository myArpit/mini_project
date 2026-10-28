import axios from "axios"

// Vercel builds must set VITE_API_URL to the deployed backend URL.
const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname)
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const hasLocalApiUrl = configuredApiUrl && /localhost|127\.0\.0\.1/.test(configuredApiUrl)
const baseURL = configuredApiUrl && (!hasLocalApiUrl || isLocalHost)
    ? configuredApiUrl
    : isLocalHost ? "http://localhost:3000" : ""

const api = axios.create({
    baseURL,
    // Enable sending cookies for session authentication when the backend sets them.
    withCredentials: true,
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
        throw err // 👈 RE-THROW ERROR
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
        throw err // 👈 RE-THROW ERROR
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        console.log(err)
        throw err // 👈 RE-THROW ERROR
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        console.log(err)
        throw err // 👈 RE-THROW ERROR
    }
}