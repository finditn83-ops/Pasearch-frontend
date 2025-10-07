// src/api.js
import axios from "axios";

// ✅ Base URL (Render backend)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// ✅ Attach token automatically if logged in
API.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth")) || null;
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export default API;
