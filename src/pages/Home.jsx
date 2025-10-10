import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Corrected variable name
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  console.log("🔍 Using API_URL:", API_URL);

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
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: data.token,
          role: data.role,
          username: data.username,
        })
      );
      if (data.role === "admin") navigate("/admin/dashboard");
      else if (data.role === "police") navigate("/police/dashboard");
      else navigate("/reporter/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Welcome to Pasearch
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot password */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Forgot password?{" "}
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Reset here
            </Link>
          </p>

          {/* Register link */}
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
