// =============================================================
// 🌐 Centralized Axios API Configuration
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

// 🔐 Register New User
export async function register(username, email, phone, password, role) {
  try {
    const res = await API.post("/auth/register", {
      username,
      email,
      phone,
      password,
      role,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Registration API error:", err.response?.data || err.message);
    throw err;
  }
}

// Owner registration alias
export const registerOwner = async (username, email, phone, password) => {
  return register(username, email, phone, password, "reporter");
};

// 🔑 Login (email or username)
export const login = async (emailOrUsername, password) => {
  const isEmail = emailOrUsername.includes("@");
  const payload = isEmail
    ? { email: emailOrUsername, password }
    : { username: emailOrUsername, password };

  const res = await API.post("/auth/login", payload);

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

// 🚪 Logout
export const logout = () => {
  clearAuth();
  toast.info("You have been logged out.");
  window.location.href = "/";
};

// 🔄 Forgot / Reset Password
export const forgotPassword = async (email) => {
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

// 🔁 Update Password
export const updatePassword = async (email, currentPassword, newPassword) => {
  const res = await API.post("/auth/update-password", {
    email,
    currentPassword,
    newPassword,
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
// 📱 DEVICE ROUTES
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

export const getDeviceByImei = async (imei, includeHistory = false) => {
  const url = includeHistory ? `/device/${imei}?history=true` : `/device/${imei}`;
  const res = await API.get(url);
  return res.data;
};

// =============================================================
// 🧩 TRACKING ROUTES
// =============================================================
export const trackDevice = async (imei, latitude, longitude, address, trackerName) => {
  const res = await API.post("/track-device", {
    imei,
    latitude,
    longitude,
    address,
    trackerName,
  });
  return res.data;
};

// =============================================================
// 🧰 ADMIN ROUTES
// =============================================================
export const getAllUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};

export const getAllDevices = async () => {
  const res = await API.get("/admin/devices");
  return res.data;
};

export const updateDeviceStatus = async (id, status) => {
  const res = await API.put(`/admin/device/${id}/status`, { status });
  return res.data;
};

export const getAdminMetrics = async () => {
  const res = await API.get("/admin/metrics");
  return res.data.metrics;
};

export const getRecentActivity = async () => {
  const res = await API.get("/admin/activity");
  return res.data.activity;
};

// =============================================================
// 👮 POLICE ROUTES
// =============================================================
export const policeSearchDevices = async (filters) => {
  const res = await API.post("/police/search", filters);
  return res.data;
};

export const getTrackingByImei = async (imei) => {
  const res = await API.get(`/police/tracking?imei=${encodeURIComponent(imei)}`);
  return res.data;
};

// =============================================================
// 🤖 AI ASSISTANT ROUTE
// =============================================================
export const askAI = async (prompt) => {
  const res = await API.post("/api/ask-ai", { prompt });
  return res.data.reply;
};

// =============================================================
// 🩺 HEALTH CHECK
// =============================================================
export const pingBackend = async () => {
  try {
    const res = await API.get("/api/health");
    return res.data;
  } catch (err) {
    console.error("Backend ping failed:", err.message);
    return { ok: false, error: err.message };
  }
};

// =============================================================
// 📋 REPORT ROUTES
// =============================================================
export const getAllReports = async () => {
  try {
    const res = await API.get("/api/reports");
    return res.data.data || [];
  } catch (err) {
    console.error("Error fetching reports:", err.message);
    throw err;
  }
};

// ✅ Default export
export default API;
