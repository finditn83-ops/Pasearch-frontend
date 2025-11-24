import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchDevice, setSearchDevice] = useState("");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch users");
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.devices);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch devices");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDevices();

    socket.on("gps_update", (data) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === data.device_id ? { ...d, ...data.device } : d))
      );
    });

    socket.on("tracking_update", (data) => {
      setDevices((prev) =>
        prev.map((d) => (d.imei === data.imei ? { ...d, lastLocation: data } : d))
      );
    });

    return () => {
      socket.off("gps_update");
      socket.off("tracking_update");
    };
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      setUsers(users.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete user");
    }
  };

  const deleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await axios.delete(`${API_URL}/admin/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Device deleted");
      setDevices(devices.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete device");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredDevices = devices.filter(
    (d) =>
      d.imei?.toLowerCase().includes(searchDevice.toLowerCase()) ||
      d.device_type?.toLowerCase().includes(searchDevice.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="border p-1 mb-2"
        />
        <table className="w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Devices</h2>
        <input
          type="text"
          placeholder="Search devices..."
          value={searchDevice}
          onChange={(e) => setSearchDevice(e.target.value)}
          className="border p-1 mb-2"
        />
        <table className="w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>IMEI</th>
              <th>Type</th>
              <th>Status</th>
              <th>Reporter Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.imei}</td>
                <td>{d.device_type}</td>
                <td>{d.status}</td>
                <td>{d.reporter_email}</td>
                <td>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteDevice(d.id)}
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
