// src/utils/auth.js

// ✅ Save auth info (after login)
export const saveAuth = (data) => {
  localStorage.setItem("auth", JSON.stringify(data));
};

// ✅ Get current user/token
export const getAuth = () => {
  return JSON.parse(localStorage.getItem("auth") || "null");
};

// ✅ Logout user completely
export const clearAuth = () => {
  localStorage.removeItem("auth");
};

// ✅ Decode JWT safely
const decodeToken = (token) => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ✅ Check if token expired (JWT)
export const isTokenExpired = () => {
  try {
    const auth = getAuth();
    const token = auth?.token;

    // No token = expired
    if (!token) return true;

    const decoded = decodeToken(token);

    // If token can't be decoded or has no exp, assume it's valid
    if (!decoded || !decoded.exp) return false;

    const now = Date.now() / 1000; // in seconds
    const exp = decoded.exp;

    // Add 10-second tolerance to avoid clock drift
    return exp < now - 10;
  } catch (error) {
    console.warn("Token decode error:", error);
    return false; // assume valid instead of forcing logout
  }
};
