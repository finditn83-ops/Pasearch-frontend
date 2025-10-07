// src/pages/VerifyOTP.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  // ✅ Backend base URL (Render or localhost fallback)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // === VERIFY OTP ===
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please enter both email and OTP code");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      if (res.data.ok) {
        toast.success("✅ Account verified successfully!");
        navigate("/"); // go back to login after success
      } else {
        toast.error(res.data.error || "Verification failed");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      toast.error(err.response?.data?.error || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // === RESEND OTP ===
  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first!");
      return;
    }
    setResending(true);
    try {
      const res = await axios.post(`${API_URL}/auth/resend-otp`, { email });
      toast.success(res.data.message || "New OTP sent to your email/phone!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Verify Your Pasearch Account
        </h1>

        <form onSubmit={handleVerify} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registered Email
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              OTP Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {resending ? "Sending new code..." : "Didn’t receive code? Resend OTP"}
          </button>
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already verified?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
