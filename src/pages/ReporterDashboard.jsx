import { Link, useNavigate } from "react-router-dom";

export default function ReporterDashboard() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem("auth"));

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">Reporter Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, <strong>{auth?.username}</strong> ({auth?.role})
      </p>

      {/* === Reporter Menu === */}
      <div className="grid gap-4 w-full max-w-md">
        <button
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => alert('🔍 Feature coming soon: Track My Device')}
        >
          Track My Device
        </button>
        <button
          className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={() => alert('📱 Feature coming soon: Report a Device')}
        >
          Report Device
        </button>
        <button
          className="bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
          onClick={() => alert('📋 Feature coming soon: View My Reports')}
        >
          View My Reports
        </button>
      </div>

      {/* === Footer Actions === */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
        <br />
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Home Page
        </Link>
      </div>
    </div>
  );
}
