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
// ⚠️ Response Interceptor — Global Error Handling (Fixed)
// =============================================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detect network/CORS errors
    if (!error.response) {
      toast.error("⚠️ Offline Mode — Unable to reach backend server.");
      // Optionally trigger retry logic or silent fail here
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Unexpected error";

    // Token expired (only log out on real expiration)
    if (status === 401 && /token/i.test(message) && /expired/i.test(message)) {
      toast.warn("Session expired. Please log in again.");
      clearAuth();
      setTimeout(() => (window.location.href = "/login"), 1200);
    } else if (status === 403) {
      toast.error("Access denied: insufficient permissions.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
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

// =============================================================
// 🧭 PASSWORD / OTP ROUTES
// =============================================================
export const forgotPassword = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

export const requestPasswordReset = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

export const verifyOTP = async (email, otp) => {
  const res = await API.post("/auth/verify-otp", { email, otp });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await API.post("/auth/reset-password", { token, newPassword });
  return res.data;
};

export const updatePassword = async (email, currentPassword, newPassword) => {
  const res = await API.post("/auth/update-password", {
    email,
    currentPassword,
    newPassword,
  });
  return res.data;
};

export const updateEmail = async (oldEmail, newEmail, password) => {
  const res = await API.post("/auth/update-email", {
    oldEmail,
    newEmail,
    password,
  });
  return res.data;
};

// =============================================================
// 🧭 AUTH UTILITIES
// =============================================================
export const getCurrentUser = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    return auth?.user || null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  return !!auth?.token;
};

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
    const res = await API.get("/api/health"); // ✅ fixed path
    return res.data;
  } catch (err) {
    console.error("Backend ping failed:", err.message);
    return { ok: false, error: err.message };
  }
};

// ✅ Default export
export default API;
