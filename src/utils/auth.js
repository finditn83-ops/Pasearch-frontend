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
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded) return false; // token not decodable, assume valid for safety

    const now = Date.now() / 1000; // current time in seconds

    // If exp exists, check it — allow 10-second tolerance
    if (decoded.exp) {
      return decoded.exp < now - 10;
    }

    // If backend didn't include exp, treat token as non-expiring
    return false;
  } catch {
    return false;
  }
};
