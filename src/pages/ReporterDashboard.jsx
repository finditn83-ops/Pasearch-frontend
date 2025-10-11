import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { FilePlus2, Search, ClipboardList, LogOut } from "lucide-react";

export default function ReporterDashboard() {
  const navigate = useNavigate();
  const [reporter, setReporter] = useState({ username: "", role: "" });

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth || auth.role !== "reporter") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    setReporter(auth);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    toast.info("Logged out successfully.");
    navigate("/");
  };

  const handleComingSoon = (feature) => {
    toast.info(`🚧 Feature coming soon: ${feature}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-10">
      {/* ===== Header ===== */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Reporter Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome, <strong>{reporter.username}</strong> ({reporter.role})
        </p>
      </div>

      {/* ===== Reporter Actions ===== */}
      <div className="grid gap-4 w-full max-w-md">
        <button
          className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition"
          onClick={() => navigate("/track")}
        >
          <Search className="w-5 h-5" />
          Track My Device
        </button>

        <button
          className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition"
          onClick={() => navigate("/report")}
        >
          <FilePlus2 className="w-5 h-5" />
          Report a Device
        </button>

        <button
          className="bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2 transition"
          onClick={() => navigate("/reporter/my-reports")}
        >
          <ClipboardList className="w-5 h-5" />
          View My Reports
        </button>
      </div>

      {/* ===== Footer Actions ===== */}
      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>

        <div className="mt-4">
          <Link
            to="/"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
