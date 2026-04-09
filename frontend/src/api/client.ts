// frontend/src/api/client.ts
// Single axios instance for the entire app.
// All API modules import from here — never raw axios with a hardcoded URL.
import axios from "axios";

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

export default client;
