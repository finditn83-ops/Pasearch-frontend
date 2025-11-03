// =============================================================
// 🌐 Centralized Axios API Configuration
// =============================================================
import axios from "axios";
import { toast } from "react-toastify";
import { clearAuth } from "./utils/auth";

// ✅ Base URL (auto-detects environment)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000, // 15 seconds
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
// ⚠️ Response Interceptor — Handle Global Errors
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
// 📱 API Endpoints
// =============================================================

// ✅ 1️⃣ Get Device by IMEI
export const getDeviceByImei = async (imei) => {
  const res = await API.get(`/devices/${imei}`);
  return res.data; // make sure we return .data, not the whole response
};

// ✅ 2️⃣ Report Lost Device
export const reportDevice = async (data) => {
  const res = await API.post("/report-device", data);
  return res.data;
};

// ✅ 3️⃣ Track Device (used by trackers / reporters)
export const trackDevice = async (data) => {
  const res = await API.post("/track-device", data);
  return res.data;
};

// ✅ 4️⃣ Get All Devices (for Admin)
export const getAllDevices = async () => {
  const res = await API.get("/devices");
  return res.data;
};

// ✅ 5️⃣ Update Device Status (for Admin)
export const updateDeviceStatus = async (id, status, updated_by) => {
  const res = await API.put(`/admin/update-device/${id}`, {
    status,
    updated_by,
  });
  return res.data;
};

// ✅ 6️⃣ Get recent police updates
export const getRecentPoliceUpdates = async () => {
  const res = await API.get("/admin/police-updates");
  return res.data;
};

export default API;
