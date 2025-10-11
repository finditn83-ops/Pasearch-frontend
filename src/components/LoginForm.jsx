import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { login } from "../api";

export default function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrUsername.trim() || !password.trim()) {
      toast.error("Please enter both username/email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(emailOrUsername, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials or network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-8"
    >
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        Login
      </h2>

      {/* Username or Email */}
      <div>
        <label
          htmlFor="emailOrUsername"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username or Email *
        </label>
        <input
          id="emailOrUsername"
          name="emailOrUsername"
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          placeholder="Enter your username or email"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="username"
        />
      </div>

      {/* Password */}
      <div className="mt-3">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="current-password"
        />
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center text-sm text-gray-700">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          Remember Me
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Register Link */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Register
          </Link>
        </span>
      </div>
    </form>
  );
}
