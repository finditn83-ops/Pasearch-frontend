import React, { useState } from "react";
import { toast } from "react-toastify";
import { forgotPassword } from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // =============================================================
  // 🔐 Handle Forgot Password Submit
  // =============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      toast.success(res.message || "Password reset link sent!");
      navigate("/reset-password");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err.response?.data?.error || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================
  // 🖼️ Render
  // =============================================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 text-center mb-4">
          Forgot Password
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Enter your registered email, and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}
