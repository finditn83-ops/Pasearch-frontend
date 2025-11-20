import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

export default API;
