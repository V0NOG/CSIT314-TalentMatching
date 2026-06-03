// frontend/src/api/client.ts
// Single axios instance for the entire app.
// All API modules import from here — never raw axios with a hardcoded URL.
import axios from "axios";

const appBasePath = import.meta.env.BASE_URL;

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050",
  withCredentials: true,
});

// Attach the access token to every request automatically.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — attempt a single silent token refresh, then replay the original request.
// If the refresh call itself fails (refresh token expired), clear storage and redirect to /signin.
// Multiple concurrent 401s are queued and resolved together once refresh completes.
let refreshing = false;
let queue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Skip: not a 401, already retried, or this IS the refresh call
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.endsWith("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is in progress
    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);
          original.headers.Authorization = `Bearer ${token}`;
          resolve(client(original));
        });
      });
    }

    original._retry = true;
    refreshing = true;

    try {
      const { data } = await client.post<{ token: string }>("/api/auth/refresh");
      const newToken = data.token;
      localStorage.setItem("token", newToken);
      flushQueue(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return client(original);
    } catch {
      flushQueue(null);
      localStorage.removeItem("token");
      window.location.href = `${appBasePath}signin`;
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  }
);

export default client;
