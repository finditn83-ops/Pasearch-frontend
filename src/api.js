// =============================================================
// 🌐 Centralized Axios API Configuration (Root-level)
// =============================================================
import axios from "axios";
import { toast } from "react-toastify";
import { clearAuth } from "./utils/auth";

// ✅ Base URL (auto-detects environment)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// =============================================================
// 🔐 Request Interceptor — Auto Attach JWT Token
// =============================================================
API.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
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
      setTimeout(() => (window.location.href = "/"), 1500);
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

// ✅ Alias for owner registration
export const registerOwner = async (username, email, phone, password) => {
  return register(username, email, phone, password, "reporter");
};

// ✅ Login (supports email OR username + auto-store auth)
export const login = async (emailOrUsername, password) => {
  const isEmail = emailOrUsername.includes("@");
  const payload = isEmail
    ? { email: emailOrUsername, password }
    : { username: emailOrUsername, password };

  const res = await API.post("/auth/login", payload);

  // ✅ Auto-store JWT + user info in localStorage
  if (res.data?.token && res.data?.user) {
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token: res.data.token,
        user: res.data.user,
        message: res.data.message,
      })
    );
  }

  return res.data;
};

// ✅ Logout — clears token & session
export const logout = () => {
  clearAuth();
  toast.info("You have been logged out.");
  window.location.href = "/";
};

// Forgot password
export const forgotPassword = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

// OTP / password recovery
export const requestPasswordReset = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

export const verifyOTP = async (email, otp) => {
  const res = await API.post("/auth/verify-otp", { email, otp });
  return res.data;
};

// Reset password (from email link)
export const resetPassword = async (token, newPassword) => {
  const res = await API.post("/auth/reset-password", { token, newPassword });
  return res.data;
};

// Update password (for logged-in user)
export const updatePassword = async (email, currentPassword, newPassword) => {
  const res = await API.post("/auth/update-password", {
    email,
    currentPassword,
    newPassword,
  });
  return res.data;
};

// Update email
export const updateEmail = async (oldEmail, newEmail, password) => {
  const res = await API.post("/auth/update-email", {
    oldEmail,
    newEmail,
    password,
  });
  return res.data;
};

// =============================================================
// 🧭 AUTH UTILITIES (New!)
// =============================================================

// ✅ Get current logged-in user info
export const getCurrentUser = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    return auth?.user || null;
  } catch {
    return null;
  }
};

// ✅ Check if user is logged in
export const isLoggedIn = () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  return !!auth?.token;
};

// ✅ Get raw JWT token
export const getAuthToken = () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  return auth?.token || null;
};

// =============================================================
// 🟢 DEVICE ROUTES
// =============================================================

export const reportDevice = async (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error("Expected FormData for reportDevice()");
  }
  const res = await API.post("/report-device", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Get device by IMEI
export const getDeviceByImei = async (imei) => {
  const res = await API.get(`/device/${imei}`);
  return res.data;
};

// =============================================================
// 🟢 ADMIN ROUTES
// =============================================================
export const adminResetUser = async (email, newPassword) => {
  const res = await API.post("/admin/reset-user", { email, newPassword });
  return res.data;
};

export const getAllUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};

export const getAllDevices = async () => {
  const res = await API.get("/admin/devices");
  return res.data;
};

// =============================================================
// 🧩 UTILITIES
// =============================================================

export const pingBackend = async () => {
  try {
    const res = await API.get("/healthz");
    return res.data;
  } catch (err) {
    console.error("Backend ping failed:", err.message);
    return { ok: false, error: err.message };
  }
};

// ✅ Default export
export default API;
