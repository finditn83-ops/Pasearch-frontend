import axios from "axios";

// ✅ Connect frontend to backend (Vercel → Render)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// ✅ Automatically attach JWT token if logged in
API.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// =====================
// AUTH ROUTES
// =====================

// 🟢 Register user
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

// 🟢 Login user
export const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

// 🟢 Forgot password
export const forgotPassword = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

// 🟢 Reset password (after email link)
export const resetPassword = async (token, new_password) => {
  const res = await API.post("/auth/reset-password", { token, new_password });
  return res.data;
};

// 🟢 Update password (logged-in user)
export const updatePassword = async (email, currentPassword, newPassword) => {
  const res = await API.post("/auth/update-password", {
    email,
    currentPassword,
    newPassword,
  });
  return res.data;
};

// 🟢 Update email (logged-in user)
export const updateEmail = async (oldEmail, newEmail, password) => {
  const res = await API.post("/auth/update-email", {
    oldEmail,
    newEmail,
    password,
  });
  return res.data;
};

// =====================
// DEVICE ROUTES
// =====================

// 🟢 Reporter: Track lost device
export const trackDevice = async (formData) => {
  const res = await API.post("/reporter/track-device", formData);
  return res.data;
};

// 🟢 Police/Admin: Get device by IMEI
export const getDeviceByImei = async (imei) => {
  const res = await API.get(`/device/${imei}`);
  return res.data;
};

// 🟢 Admin: Reset a user password
export const adminResetUser = async (email, new_password) => {
  const res = await API.post("/admin/reset-user", { email, new_password });
  return res.data;
};

// =====================
// UTILITIES
// =====================

// 🟢 Test backend connection
export const pingBackend = async () => {
  try {
    const res = await API.get("/healthz");
    return res.data;
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export default API;
