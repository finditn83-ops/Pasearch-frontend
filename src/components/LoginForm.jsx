import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import { toast } from "react-toastify";
import { saveAuth } from "../utils/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { login } from "../api/API"; // ✅ Ensure correct path (../api/API.js)

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  // ==========================================
  // Handle Login
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password); // ✅ backend expects email + password
      saveAuth(res);
      toast.success("Login successful!");

      // ✅ Redirect user based on their role
      if (res.user.role === "admin") navigate("/admin-dashboard");
      else if (res.user.role === "police") navigate("/police-dashboard");
      else navigate("/reporter-dashboard");
    } catch (err) {
      console.error("❌ Login error:", err);
      toast.error(err.response?.data?.error || "Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-10"
    >
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        Login
      </h2>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Back to Home */}
      <div className="text-center mt-4">
        <Link
          to="/register"
          className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
        >
          Don’t have an account? Register →
        </Link>
      </div>
    </form>
  );
}
