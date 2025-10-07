import { Link, useNavigate } from "react-router-dom";

export default function PoliceDashboard() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem("auth"));

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-2">Police Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, <strong>{auth?.username}</strong> ({auth?.role})
      </p>

      {/* === Police Menu === */}
      <div className="grid gap-4 w-full max-w-md">
        <button
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          onClick={() => alert('👮 Feature coming soon: View Reported Devices')}
        >
          View All Reported Devices
        </button>
        <button
          className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          onClick={() => alert('✅ Feature coming soon: Verify Ownership')}
        >
          Verify Device Ownership
        </button>
        <button
          className="bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition"
          onClick={() => alert('📞 Feature coming soon: Contact Reporter')}
        >
          Contact Reporter
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
