// src/pages/Success.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Optional icon — remove if not installed

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get optional message from navigation state
  const message = location.state?.message || "Action completed successfully!";

  // ✅ Auto-redirect to login after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 text-center w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Success!
        </h1>

        {/* Message */}
        <p className="text-gray-700 mb-4">{message}</p>

        {/* Auto Redirect Message */}
        <p className="text-sm text-gray-400 mb-4">
          Redirecting to login in 3 seconds...
        </p>

        {/* Manual Redirect Button */}
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
