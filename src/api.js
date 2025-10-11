// =============================================================
// 🌐 Centralized Axios API Configuration (Root-level)
// =============================================================
import axios from "axios";
import { toast } from "react-toastify";
import { clearAuth } from "./utils/auth"; // ✅ keep this relative import since auth.js is inside /utils

// ✅ Base URL (auto-detects environment)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000, // 15 seconds timeout
  headers: { "Content-Type": "application/json" },
});

// =============================================================
// 🔐 Request Interceptor — Auto Attach JWT Token
// =============================================================
API.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================
// ⚠️ Response Interceptor — Global Error Handling
// =============================================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      clearAuth();
      window.location.href = "/";
    } else if (status === 403) {
      toast.error("Access denied: insufficient permissions.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (!status) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

// =============================================================
// 🟢 AUTH ROUTES
// =============================================================

// Register new user
export const register = async (username, email, phone, password, role) => {
  const res = await API.post("/auth/register", {
    username,
    email,
    phone,
    password,
    role,
  });
  return res.data;
};

// Login existing user
export const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

// Forgot password (send reset link)
export const forgotPassword = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

// Reset password (from email link)
export const resetPassword = async (token, new_password) => {
  const res = await API.post("/auth/reset-password", { token, new_password });
  return res.data;
};

// Update password (logged-in user)
export const updatePassword = async (email, currentPassword, newPassword) => {
  const res = await API.post("/auth/update-password", {
    email,
    currentPassword,
    newPassword,
  });
  return res.data;
};

// Update email (logged-in user)
export const updateEmail = async (oldEmail, newEmail, password) => {
  const res = await API.post("/auth/update-email", {
    oldEmail,
    newEmail,
    password,
  });
  return res.data;
};

// =============================================================
// 🟢 DEVICE ROUTES
// =============================================================

// Reporter: Report lost/stolen device (with file upload)
export const reportDevice = async (formData) => {
  const res = await API.post("/report-device", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Police/Admin: Get device by IMEI
export const getDeviceByImei = async (imei) => {
  const res = await API.get(`/device/${imei}`);
  return res.data;
};

// =============================================================
// 🟢 ADMIN ROUTES
// =============================================================

// Admin: Reset user password
export const adminResetUser = async (email, new_password) => {
  const res = await API.post("/admin/reset-user", { email, new_password });
  return res.data;
};

// Admin: Get all users
export const getAllUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};

// Admin: Get all devices
export const getAllDevices = async () => {
  const res = await API.get("/admin/devices");
  return res.data;
};

// =============================================================
// 🧩 UTILITIES
// =============================================================

// Test backend connection (health check)
export const pingBackend = async () => {
  try {
    const res = await API.get("/healthz");
    return res.data;
  } catch (err) {
    console.error("Backend ping failed:", err.message);
    return { ok: false, error: err.message };
  }
};

// Default export (for custom axios calls)
export default API;
