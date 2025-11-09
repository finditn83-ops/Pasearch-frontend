// =============================================================
// 🌐 Centralized Axios API Configuration
// =============================================================
import axios from "axios";
import { toast } from "react-toastify";
import { clearAuth } from "./utils/auth";

// =============================================================
// ⚙️ Axios Instance
// =============================================================
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000, // 15 seconds timeout
  headers: { "Content-Type": "application/json" },
});

// =============================================================
// 🔐 Request Interceptor — Attach JWT Token
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
      setTimeout(() => (window.location.href = "/login"), 1500);
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// =============================================================
// 🧑‍💻 AUTH ENDPOINTS
// =============================================================

// ✅ 1️⃣ Register
export const register = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

// ✅ 2️⃣ Login
export const login = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

// ✅ 3️⃣ Forgot Password
export const forgotPassword = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

// ✅ 4️⃣ Verify OTP
export const verifyOTP = async (email, otp) => {
  const res = await API.post("/auth/verify-otp", { email, otp });
  return res.data;
};

// ✅ 5️⃣ Reset Password
export const resetPassword = async (email, newPassword) => {
  const res = await API.post("/auth/reset-password", { email, newPassword });
  return res.data;
};

// =============================================================
// 📱 DEVICE ENDPOINTS
// =============================================================

// ✅ 6️⃣ Get Device by IMEI
export const getDeviceByImei = async (imei) => {
  const res = await API.get(`/devices/${imei}`);
  return res.data;
};

// ✅ 7️⃣ Report Lost Device
export const reportDevice = async (data) => {
  const res = await API.post("/report-device", data);
  return res.data;
};

// ✅ 8️⃣ Track Device (live updates)
export const trackDevice = async (data) => {
  const res = await API.post("/track-device", data);
  return res.data;
};

// ✅ 9️⃣ Get All Devices (Admin)
export const getAllDevices = async () => {
  const res = await API.get("/devices");
  return res.data;
};

// ✅ 🔟 Update Device Status (Admin)
export const updateDeviceStatus = async (id, status, updated_by) => {
  const res = await API.put(`/admin/update-device/${id}`, {
    status,
    updated_by,
  });
  return res.data;
};

// =============================================================
// 🚓 POLICE ENDPOINTS
// =============================================================

// ✅ 1️⃣1️⃣ Get recent police updates (for log table)
export const getRecentPoliceUpdates = async () => {
  const res = await API.get("/admin/police-updates");
  return res.data;
};

// ✅ 1️⃣2️⃣ Update case details
export const updatePoliceCase = async (id, data) => {
  const res = await API.put(`/admin/update-case/${id}`, data);
  return res.data;
};

// =============================================================
// 🤖 7️⃣ Ask AI (Pasearch Assistant)
// =============================================================
export const askAI = async (message, role = "user") => {
  try {
    const res = await API.post("/assistant", { message, role });
    return res.data; // expect { reply: "...", role: "assistant" }
  } catch (err) {
    console.error("❌ askAI error:", err.response?.data || err.message);
    throw err;
  }
};

// =============================================================
// ✅ Export Axios instance
// =============================================================
export default API;
