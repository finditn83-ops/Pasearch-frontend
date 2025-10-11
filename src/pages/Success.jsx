import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function Success() {
  const location = useLocation();
  const message =
    location.state?.message || "Your operation was completed successfully!";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        {/* Success Icon */}
        <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Success!
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <Link
            to="/"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>

          <Link
            to="/home"
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
