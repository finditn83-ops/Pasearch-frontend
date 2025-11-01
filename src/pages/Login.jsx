// ==============================
// 🔐 Login Page — Pasearch
// ==============================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Use environment variable or fallback to localhost
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      const data = res.data;
      toast.success("Login successful!");

      // ✅ Store token and user info
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: data.token,
          role: data.role || data.user?.role,
          username: data.username || data.user?.username,
        })
      );

      // ✅ Navigate based on role
      const role = data.role || data.user?.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "police") navigate("/police/dashboard");
      else if (role === "reporter") navigate("/reporter/report");
      else {
        toast.error("Unknown user role. Please contact support.");
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.error || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* ===== Header ===== */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            👋 Welcome Back to Pasearch
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in to continue protecting your devices.
          </p>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              autoComplete="username"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              autoComplete="current-password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot / Register Links */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Forgot password?{" "}
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Reset here
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600 mt-2">
            Don’t have an account?{" "}
            <Link to="/register/owner" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
