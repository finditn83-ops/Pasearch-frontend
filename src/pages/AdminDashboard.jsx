import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_BASE);

const AdminDashboard = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchDevice, setSearchDevice] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  // --- Fetch users/devices ---
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, { headers });
      setUsers(res.data.users || []);
    } catch (e) {
      toast.error("Failed to fetch users");
    }
  };
  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/devices`, { headers });
      setDevices(res.data.devices || []);
    } catch (e) {
      toast.error("Failed to fetch devices");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDevices();
    socket.on("tracking_update", (data) => {
      console.log("Tracking update:", data);
    });
    socket.on("gps_update", (data) => {
      console.log("GPS update:", data);
    });
    socket.on("police_alert", (data) => {
      console.log("Police alert:", data);
    });
    return () => socket.disconnect();
  }, []);

  // --- Delete user ---
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/${id}`, { headers });
      toast.success("User deleted");
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  // --- Delete device ---
  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/devices/${id}`, { headers });
      toast.success("Device deleted");
      setDevices(devices.filter(d => d.id !== id));
    } catch (e) {
      toast.error("Failed to delete device");
    }
  };

  // --- Filter helpers ---
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );
  const filteredDevices = devices.filter(d =>
    (d.imei||"").toLowerCase().includes(searchDevice.toLowerCase()) ||
    (d.device_type||"").toLowerCase().includes(searchDevice.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* --- Users Section --- */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchUser}
          onChange={e => setSearchUser(e.target.value)}
          className="border p-1 mb-2"
        />
        <table className="w-full border-collapse border">
          <thead>
            <tr className="border">
              <th className="border p-1">ID</th>
              <th className="border p-1">Username</th>
              <th className="border p-1">Email</th>
              <th className="border p-1">Role</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border">
                <td className="border p-1">{u.id}</td>
                <td className="border p-1">{u.username}</td>
                <td className="border p-1">{u.email}</td>
                <td className="border p-1">{u.role}</td>
                <td className="border p-1">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Devices Section --- */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Devices</h2>
        <input
          type="text"
          placeholder="Search devices..."
          value={searchDevice}
          onChange={e => setSearchDevice(e.target.value)}
          className="border p-1 mb-2"
        />
        <table className="w-full border-collapse border">
          <thead>
            <tr className="border">
              <th className="border p-1">ID</th>
              <th className="border p-1">IMEI</th>
              <th className="border p-1">Type</th>
              <th className="border p-1">Status</th>
              <th className="border p-1">Reporter Email</th>
              <th className="border p-1">Created At</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map(d => (
              <tr key={d.id} className="border">
                <td className="border p-1">{d.id}</td>
                <td className="border p-1">{d.imei}</td>
                <td className="border p-1">{d.device_type}</td>
                <td className="border p-1">{d.status}</td>
                <td className="border p-1">{d.reporter_email}</td>
                <td className="border p-1">{new Date(d.created_at).toLocaleString()}</td>
                <td className="border p-1">
                  <button
                    onClick={() => handleDeleteDevice(d.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
