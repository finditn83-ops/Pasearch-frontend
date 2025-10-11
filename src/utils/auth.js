// =============================================================
// 🔐 Authentication Utilities
// =============================================================

// ✅ Save auth info after login or registration
export const saveAuth = (data) => {
  if (!data) return;
  localStorage.setItem("auth", JSON.stringify(data));
};

// ✅ Retrieve the entire auth object
export const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("auth") || "null");
  } catch {
    return null;
  }
};

// ✅ Clear all authentication data
export const clearAuth = () => {
  try {
    localStorage.removeItem("auth");
    sessionStorage.clear();
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
};

// ✅ Safely decode JWT token payload
const decodeToken = (token) => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ✅ Check if the token has expired
export const isTokenExpired = () => {
  try {
    const auth = getAuth();
    const token = auth?.token;
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false; // No exp = treat as session token

    const now = Date.now() / 1000; // current time (s)
    const exp = decoded.exp;
    // ⏱️ Add small 10s buffer for time drift
    return exp < now - 10;
  } catch (error) {
    console.warn("Token decode error:", error);
    // Safer default: treat as expired to avoid silent failures
    return true;
  }
};

// ✅ Convenience helper: Get token directly
export const getToken = () => {
  const auth = getAuth();
  return auth?.token || null;
};

// ✅ Convenience helper: Get current user
export const getCurrentUser = () => {
  const auth = getAuth();
  return auth?.user || { username: auth?.username, role: auth?.role };
};
