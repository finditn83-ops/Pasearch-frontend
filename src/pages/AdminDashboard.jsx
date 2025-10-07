// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        const headers = { Authorization: `Bearer ${auth?.token}` };

        const [usersRes, devicesRes] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, { headers }),
          axios.get(`${API_URL}/admin/devices`, { headers }),
        ]);

        setUsers(usersRes.data.users || []);
        setDevices(devicesRes.data.devices || []);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg ${
            tab === "users"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          👥 Users
        </button>
        <button
          onClick={() => setTab("devices")}
          className={`px-4 py-2 rounded-lg ${
            tab === "devices"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          📱 Devices
        </button>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : tab === "users" ? (
        // === Users Table ===
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white border-collapse">
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
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{u.id}</td>
                    <td className="py-2 px-4 border-b">{u.username}</td>
                    <td className="py-2 px-4 border-b">{u.email}</td>
                    <td className="py-2 px-4 border-b">{u.role}</td>
                    <td className="py-2 px-4 border-b">{u.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // === Devices Table ===
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white border-collapse">
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
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{d.id}</td>
                    <td className="py-2 px-4 border-b">
                      {d.reporter} <br />
                      <span className="text-xs text-gray-500">
                        {d.reporter_email}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{d.device_category}</td>
                    <td className="py-2 px-4 border-b">{d.device_type}</td>
                    <td className="py-2 px-4 border-b">{d.imei}</td>
                    <td className="py-2 px-4 border-b">{d.color}</td>
                    <td className="py-2 px-4 border-b">{d.location_area}</td>
                    <td className="py-2 px-4 border-b capitalize">{d.lost_type}</td>
                    <td className="py-2 px-4 border-b">{d.created_at}</td>
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
