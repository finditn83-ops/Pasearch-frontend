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

// ✅ Check if token expired (JWT)
export const isTokenExpired = () => {
  try {
    const auth = getAuth();
    if (!auth?.token) return true;

    // Decode the token payload (middle part)
    const payload = JSON.parse(atob(auth.token.split(".")[1]));
    const now = Date.now() / 1000; // current time in seconds

    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
};
