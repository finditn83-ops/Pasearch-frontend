// ==============================
// 🔐 Login Page — Pasearch (with LoginActivity logging)
// ==============================
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const [backendStatus, setBackendStatus] = useState("🔄 Checking backend...");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Backend health check
  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${api}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setBackendStatus("✅ Backend Connected");
        else setBackendStatus("⚠️ Unexpected response");
      })
      .catch(() => setBackendStatus("❌ Backend Offline or CORS blocked"));
  }, []);

  // ✅ Login handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const data = res.data;

      // ✅ Unified auth object
      const authData = {
        token: data.token,
        user: {
          id: data.user?.id,
          name: data.user?.name || data.username,
          username: data.user?.username || username,
          email: data.user?.email,
          role: data.user?.role || data.role,
        },
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      // ✅ Save ISO login timestamp for dashboard
      const now = new Date();
      localStorage.setItem("lastLogin", now.toISOString());

      // 🌍 Log login activity to backend for Google Sheets
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        const city = ipData.city || "Unknown";
        const country = ipData.country_name || "Unknown";
        const ip = ipData.ip || "N/A";
        const localTime = now.toLocaleString();
        const utcTime = now.toUTCString();

        await axios.post(`${API_URL}/log-login`, {
          username: authData.user.username,
          role: authData.user.role,
          city,
          country,
          ip,
          localTime,
          utcTime,
        });
      } catch (err) {
        console.warn("⚠️ Login logging skipped:", err.message);
      }

      toast.success("Login successful!");

      // ✅ Redirect by role
      const role = authData.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "police") navigate("/police/dashboard");
      else if (role === "reporter") navigate("/report");
      else {
        toast.error("Unknown user role. Please contact support.");
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      toast.error(err.response?.data?.error || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white text-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* ===== Header ===== */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-1">
            👋 Welcome Back to PASEARCH
          </h1>
          <p className="text-gray-500 text-sm">{backendStatus}</p>
        </div>

        {/* ===== Login Form ===== */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username *
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white py-2 rounded-lg font-semibold transition-all`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot / Register Links */}
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>
              Forgot password?{" "}
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Reset here
              </Link>
            </p>
            <p className="mt-2">
              Don’t have an account?{" "}
              <Link to="/register/owner" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
