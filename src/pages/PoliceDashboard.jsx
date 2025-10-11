import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { ShieldCheck, CheckCircle } from "lucide-react";

export default function PoliceDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth || auth.role !== "police") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    setOfficerName(auth.username || "Officer");

    const fetchReports = async () => {
      try {
        const headers = { Authorization: `Bearer ${auth.token}` };
        const res = await axios.get(`${API_URL}/police/reports`, { headers });
        setDevices(res.data.devices || []);
      } catch (err) {
        console.error("Failed to load reports:", err);
        toast.error("Failed to load reports. Please check the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [API_URL, navigate]);

  const handleVerify = async (deviceId) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const headers = { Authorization: `Bearer ${auth.token}` };
      await axios.post(`${API_URL}/police/verify/${deviceId}`, {}, { headers });
      toast.success("Device marked as verified.");
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? { ...d, verified: true } : d
        )
      );
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Unable to verify device. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6 bg-white shadow-sm p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6" />
          <span>Police Dashboard</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Welcome, <span className="font-semibold">{officerName}</span>
          </span>
          <LogoutButton />
        </div>
      </div>

      {/* ===== Device Reports ===== */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Reported Devices
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left border-b">ID</th>
                <th className="py-2 px-4 text-left border-b">Reporter</th>
                <th className="py-2 px-4 text-left border-b">Device Name</th>
                <th className="py-2 px-4 text-left border-b">IMEI</th>
                <th className="py-2 px-4 text-left border-b">Color</th>
                <th className="py-2 px-4 text-left border-b">Location</th>
                <th className="py-2 px-4 text-left border-b">Reported At</th>
                <th className="py-2 px-4 text-left border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No reports available.
                  </td>
                </tr>
              ) : (
                devices.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50 transition border-b last:border-b-0"
                  >
                    <td className="py-2 px-4">{d.id}</td>
                    <td className="py-2 px-4">
                      {d.reporter}
                      <br />
                      <span className="text-xs text-gray-500">
                        {d.reporter_email}
                      </span>
                    </td>
                    <td className="py-2 px-4">{d.device_name}</td>
                    <td className="py-2 px-4">{d.imei}</td>
                    <td className="py-2 px-4">{d.color}</td>
                    <td className="py-2 px-4">{d.location_area}</td>
                    <td className="py-2 px-4">{d.created_at}</td>
                    <td className="py-2 px-4 text-center">
                      {d.verified ? (
                        <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerify(d.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Footer ===== */}
      <footer className="bg-blue-700 text-white py-3 mt-8 text-center text-sm rounded-lg">
        © {new Date().getFullYear()} Device Tracker — Police Portal
      </footer>
    </div>
  );
}
