import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Use environment variable or fallback to localhost
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // =============================================================
  // 🔐 Handle Login
  // =============================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const data = res.data;

      toast.success("Login successful!");

      // ✅ Store token + role + username in localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: data.token,
          role: data.role || data.user?.role,
          username: data.username || data.user?.username,
        })
      );

      // ✅ Determine role and navigate accordingly
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

  // =============================================================
  // 🖥️ UI
  // =============================================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* ===== Title ===== */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Welcome to Pasearch
        </h1>

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
              name="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot Password */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Forgot password?{" "}
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Reset here
            </Link>
          </p>

          {/* Register Link */}
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
