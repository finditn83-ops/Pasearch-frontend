import React, { useEffect, useState } from "react";
import {
  getAllReports,
  updateDeviceStatus,
  getAllUsers,
} from "../api";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [activity, setActivity] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview");

useEffect(() => {
  const loadReports = async () => {
    try {
      const reports = await getAllReports();
      setDevices(reports); // reuse existing "devices" state
    } catch {
      toast.error("Failed to load device reports.");
    } finally {
      setLoading(false);
    }
  };
  loadReports();
}, []);

  const handleStatus = async (id, status) => {
    try {
      await updateDeviceStatus(id, status);
      toast.success(`Device marked as ${status}`);
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
      const [newMetrics, newActivity] = await Promise.all([
        getAdminMetrics(),
        getRecentActivity(),
      ]);
      setMetrics(newMetrics);
      setActivity(newActivity);
    } catch {
      toast.error("Failed to update device status.");
    }
  };

  if (loading) return <p className="p-4 text-gray-600">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-blue-600">Admin Dashboard</h1>

      {/* Dashboard metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard title="Total Users" value={metrics.total_users} color="bg-blue-500" />
        <MetricCard title="Devices Reported" value={metrics.total_devices} color="bg-purple-500" />
        <MetricCard title="Recovered Devices" value={metrics.recovered} color="bg-green-500" />
        <MetricCard title="Under Investigation" value={metrics.investigating} color="bg-yellow-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("overview")}
          className={`px-4 py-2 rounded ${
            view === "overview" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView("devices")}
          className={`px-4 py-2 rounded ${
            view === "devices" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Devices
        </button>
        <button
          onClick={() => setView("users")}
          className={`px-4 py-2 rounded ${
            view === "users" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setView("activity")}
          className={`px-4 py-2 rounded ${
            view === "activity" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Recent Activity
        </button>
      </div>

      {view === "devices" && (
        <DeviceTable devices={devices} onStatus={handleStatus} />
      )}
      {view === "users" && <UserTable users={users} />}
      {view === "activity" && <RecentActivity activity={activity} />}
      {view === "overview" && (
        <p className="text-gray-600">
          Welcome, Admin! Use the tabs to manage users, view reports, or check system activity.
        </p>
      )}
    </div>
  );
}

// ✅ Metric card component
function MetricCard({ title, value, color }) {
  return (
    <div className={`rounded-lg shadow-md p-4 text-white ${color}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value ?? 0}</p>
    </div>
  );
}

// ✅ Device table
function DeviceTable({ devices, onStatus }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">IMEI</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Reporter</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td className="p-2 border">{d.imei}</td>
              <td className="p-2 border">{d.device_type}</td>
              <td className="p-2 border">{d.email}</td>
              <td className="p-2 border">{d.status}</td>
              <td className="p-2 border">
                <button
                  onClick={() => onStatus(d.id, "investigating")}
                  className="px-2 py-1 text-xs bg-yellow-400 rounded mr-1"
                >
                  Investigating
                </button>
                <button
                  onClick={() => onStatus(d.id, "recovered")}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                >
                  Recovered
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ Users table
function UserTable({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ Recent activity feed
function RecentActivity({ activity }) {
  const logs = activity.system_logs || [];
  const devices = activity.device_reports || [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-bold text-blue-600 mb-2">🕒 System Activity</h2>
        <ul className="text-sm space-y-1 max-h-80 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, i) => (
              <li key={i} className="border-b pb-1">
                <b>{log.username}</b> — {log.action}
                <br />
                <span className="text-gray-500 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent system logs.</p>
          )}
        </ul>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-bold text-purple-600 mb-2">📱 Recent Device Reports</h2>
        <ul className="text-sm space-y-1 max-h-80 overflow-y-auto">
          {devices.length > 0 ? (
            devices.map((d, i) => (
              <li key={i} className="border-b pb-1">
                <b>{d.device_type}</b> — IMEI: {d.imei}
                <br />
                <span className="text-gray-500 text-xs">
                  Status: {d.status || "pending"} |{" "}
                  {new Date(d.created_at).toLocaleString()}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No recent reports.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
