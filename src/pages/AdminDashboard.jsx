import React, { useEffect, useState } from "react";
import API from "../api.js";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const resUsers = await API.get("/admin/users");
      const resDevices = await API.get("/admin/devices");

      setUsers(resUsers.data.users || []);
      setDevices(resDevices.data.devices || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data.");
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center p-6 text-slate-500">Loading admin panel...</div>;

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <h2 className="text-xl font-semibold text-slate-800">
        Admin Dashboard
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Users List */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-semibold mb-3 text-slate-700">Registered Users</h3>

        <table className="w-full text-sm border border-slate-200">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">Username</th>
              <th className="px-2 py-1">Email</th>
              <th className="px-2 py-1">Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-200">
                <td className="px-2 py-1">{u.id}</td>
                <td className="px-2 py-1">{u.username}</td>
                <td className="px-2 py-1">{u.email}</td>
                <td className="px-2 py-1 capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Devices Section */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-semibold mb-3 text-slate-700">Reported Devices</h3>

        <table className="w-full text-sm border border-slate-200">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">IMEI</th>
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Reporter</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-b border-slate-200">
                <td className="px-2 py-1">{d.id}</td>
                <td className="px-2 py-1">{d.imei}</td>
                <td className="px-2 py-1">{d.device_type}</td>
                <td className="px-2 py-1 capitalize">{d.status}</td>
                <td className="px-2 py-1">{d.reporter_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminDashboard;
