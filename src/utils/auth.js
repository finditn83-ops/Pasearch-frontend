// =============================================================
// 🔐 Authentication Utilities — PASEARCH Frontend
// =============================================================

// ✅ Save auth info after login or registration
export const saveAuth = (data) => {
  if (!data) return;
  try {
    localStorage.setItem("auth", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving auth:", error);
  }
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
  } catch (error) {
    console.warn("Token decode failed:", error);
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
    if (!decoded || !decoded.exp) return false; // no expiry means session-based

    const now = Date.now() / 1000; // convert to seconds
    const exp = decoded.exp;

    // Add a 10s buffer for time drift
    return exp < now - 10;
  } catch (error) {
    console.warn("Token decode error:", error);
    // safer default: treat as expired to prevent silent auth issues
    return true;
  }
};

// ✅ Convenience helper: Get token directly
export const getToken = () => {
  const auth = getAuth();
  return auth?.token || null;
};

// ✅ Get current logged-in user info (role, username, etc.)
export const getCurrentUser = () => {
  const auth = getAuth();
  if (!auth) return null;

  // If backend stores `user` object, prefer that
  if (auth.user) return auth.user;

  // Otherwise fallback to direct role/username in auth
  return {
    username: auth?.username || "Unknown",
    role: auth?.role || "guest",
  };
};

// ✅ Check login status (valid + not expired)
export const isLoggedIn = () => {
  const auth = getAuth();
  if (!auth?.token) return false;
  if (isTokenExpired()) {
    clearAuth();
    return false;
  }
  return true;
};
