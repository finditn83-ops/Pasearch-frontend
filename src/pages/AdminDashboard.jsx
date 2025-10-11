import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth || auth.role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    setAdminName(auth.username || "Admin");

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${auth.token}` };
        const [usersRes, devicesRes] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, { headers }),
          axios.get(`${API_URL}/admin/devices`, { headers }),
        ]);
        setUsers(usersRes.data.users || []);
        setDevices(devicesRes.data.devices || []);
      } catch (err) {
        console.error("Failed to load admin data:", err);
        toast.error("Error loading data. Please check your server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6 bg-white shadow-sm p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-600">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Welcome, <span className="font-semibold">{adminName}</span>
          </span>
          <LogoutButton />
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "users"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          👥 Users
        </button>
        <button
          onClick={() => setTab("devices")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "devices"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📱 Devices
        </button>
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <p className="text-center text-gray-500">Loading data...</p>
      ) : tab === "users" ? (
        // === Users Table ===
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left border-b">ID</th>
                <th className="py-2 px-4 text-left border-b">Username</th>
                <th className="py-2 px-4 text-left border-b">Email</th>
                <th className="py-2 px-4 text-left border-b">Role</th>
                <th className="py-2 px-4 text-left border-b">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50 transition border-b last:border-b-0"
                  >
                    <td className="py-2 px-4">{u.id}</td>
                    <td className="py-2 px-4">{u.username}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4 capitalize">{u.role}</td>
                    <td className="py-2 px-4">{u.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // === Devices Table ===
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-green-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left border-b">ID</th>
                <th className="py-2 px-4 text-left border-b">Reporter</th>
                <th className="py-2 px-4 text-left border-b">Category</th>
                <th className="py-2 px-4 text-left border-b">Type</th>
                <th className="py-2 px-4 text-left border-b">IMEI</th>
                <th className="py-2 px-4 text-left border-b">Color</th>
                <th className="py-2 px-4 text-left border-b">Location</th>
                <th className="py-2 px-4 text-left border-b">Lost Type</th>
                <th className="py-2 px-4 text-left border-b">Reported At</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No devices reported yet
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
                    <td className="py-2 px-4">{d.device_category}</td>
                    <td className="py-2 px-4">{d.device_type}</td>
                    <td className="py-2 px-4">{d.imei}</td>
                    <td className="py-2 px-4">{d.color}</td>
                    <td className="py-2 px-4">{d.location_area}</td>
                    <td className="py-2 px-4 capitalize">{d.lost_type}</td>
                    <td className="py-2 px-4">{d.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
