import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { ClipboardList, ArrowLeft } from "lucide-react";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reporterName, setReporterName] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth || auth.role !== "reporter") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    setReporterName(auth.username || "Reporter");

    const fetchReports = async () => {
      try {
        const headers = { Authorization: `Bearer ${auth.token}` };
        const res = await axios.get(`${API_URL}/reporter/my-reports`, {
          headers,
        });
        setReports(res.data.reports || []);
      } catch (err) {
        console.error("Error loading reports:", err);
        toast.error("Failed to load your reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [API_URL, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6 bg-white shadow-sm p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          <span>My Reports</span>
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <h2 className="text-lg text-gray-700 mb-4">
        Hello, <span className="font-semibold">{reporterName}</span> 👋 — here are your submitted reports:
      </h2>

      {/* ===== Reports Table ===== */}
      {loading ? (
        <p className="text-center text-gray-500">Loading your reports...</p>
      ) : reports.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          <p>You haven’t reported any devices yet.</p>
          <Link
            to="/report"
            className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Report a Device
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left border-b">#</th>
                <th className="py-2 px-4 text-left border-b">Device</th>
                <th className="py-2 px-4 text-left border-b">IMEI</th>
                <th className="py-2 px-4 text-left border-b">Color</th>
                <th className="py-2 px-4 text-left border-b">Location</th>
                <th className="py-2 px-4 text-left border-b">Status</th>
                <th className="py-2 px-4 text-left border-b">Reported At</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, index) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 transition border-b last:border-b-0"
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{r.device_name || "N/A"}</td>
                  <td className="py-2 px-4">{r.imei || "—"}</td>
                  <td className="py-2 px-4">{r.color || "—"}</td>
                  <td className="py-2 px-4">{r.location_area || "—"}</td>
                  <td className="py-2 px-4 font-medium">
                    {r.recovered ? (
                      <span className="text-purple-600">Recovered</span>
                    ) : r.verified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="py-2 px-4">{r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Footer ===== */}
      <footer className="bg-blue-700 text-white py-3 mt-8 text-center text-sm rounded-lg">
        © {new Date().getFullYear()} Device Tracker — Reporter Portal
      </footer>
    </div>
  );
}
