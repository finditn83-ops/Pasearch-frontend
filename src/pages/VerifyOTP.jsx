import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { verifyOTP } from "../api";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const { email } = useParams(); // If your route includes /verify/:email
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the OTP code sent to your email.");
      return;
    }

    try {
      setLoading(true);
      await verifyOTP(email, otp);
      toast.success("Verification successful! You can now log in.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Invalid or expired OTP. Please try again.");
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
        Verify OTP
      </h2>

      <p className="text-center text-gray-600 mb-4 text-sm">
        Enter the 6-digit code sent to your email
        {email ? ` (${email})` : ""}.
      </p>

      {/* OTP Input */}
      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          OTP Code *
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          placeholder="Enter your 6-digit OTP"
          className="w-full p-2 border rounded-md text-center tracking-widest focus:ring-2 focus:ring-blue-500"
          autoComplete="one-time-code"
          maxLength={6}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {/* Back to Login */}
      <div className="text-center mt-4">
        <Link
          to="/"
          className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </form>
  );
}
