import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { getDeviceByImei, updateDeviceStatus } from "../api";
import MapView from "../components/MapView";

const SOCKET_URL = "https://pasearch-backend.onrender.com";

export default function AdminDashboard() {
  const [imei, setImei] = useState("");
  const [device, setDevice] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // ✅ Get current admin name from localStorage
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const adminName = auth?.user?.name || "Admin";

  // ==============================
  // 🧠 Connect to Socket.IO
  // ==============================
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Socket disconnected");
      setSocketConnected(false);
    });

    // 🔊 Receive live tracking updates
    socket.on("tracking_update", (data) => {
      console.log("📡 Live update (Admin):", data);
      setTrackingData((prev) => [data, ...prev]);
      toast.info(`New tracking update for IMEI ${data.imei}`);
    });

    return () => socket.disconnect();
  }, []);

  // ==============================
  // 🔍 Lookup device by IMEI
  // ==============================
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return toast.warn("Enter IMEI number first");

    try {
      const res = await getDeviceByImei(imei.trim());
      setDevice(res.data || res);
      toast.success("Device found");
    } catch (err) {
      console.error(err);
      toast.error("Device not found");
    }
  };

  // ==============================
  // 🧾 Update device status (Admin)
  // ==============================
  const handleStatusUpdate = async () => {
    if (!device) return toast.warn("Search for a device first");
    if (!status) return toast.warn("Select a status");
    setUpdating(true);
    try {
      await updateDeviceStatus(device.id, status, adminName);
      toast.success(`Device marked as ${status}`);
      setDevice({ ...device, status });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // ==============================
  // 🗺️ Latest tracking position
  // ==============================
  const latest = trackingData.find((t) => t.imei === imei);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Admin Dashboard
      </h1>

      {/* Connection status */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
          socketConnected
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {socketConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
      </div>

      {/* Search form */}
      <form onSubmit={handleLookup} className="flex gap-2 mb-6 items-center">
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Enter IMEI number"
          className="border border-gray-300 rounded px-3 py-2 flex-1 focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {/* Map for latest location */}
      {latest && (
        <MapView
          imei={latest.imei}
          latitude={latest.latitude}
          longitude={latest.longitude}
          address={latest.address}
        />
      )}

      {/* Device info + Status update */}
      {device && (
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Device Information
          </h2>
          <p>
            <strong>Device Type:</strong> {device.device_type}
          </p>
          <p>
            <strong>Color:</strong> {device.color}
          </p>
          <p>
            <strong>Reporter:</strong> {device.reporter_email}
          </p>
          <p>
            <strong>Location:</strong> {device.location_area}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="font-semibold text-green-700">
              {device.status || "Unknown"}
            </span>
          </p>

          {/* Update status section */}
          <div className="mt-4 flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">-- Select Status --</option>
              <option value="Recovered">✅ Recovered</option>
              <option value="Lost">❌ Lost</option>
              <option value="Under Investigation">🕵️ Under Investigation</option>
            </select>

            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className={`${
                updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 rounded`}
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {/* Recent tracking updates */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-x-auto">
        <h2 className="text-lg font-semibold text-blue-700 p-4 border-b">
          Recent Tracking Updates
        </h2>
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-blue-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">IMEI</th>
              <th className="text-left px-4 py-2">Latitude</th>
              <th className="text-left px-4 py-2">Longitude</th>
              <th className="text-left px-4 py-2">Address</th>
              <th className="text-left px-4 py-2">Tracker</th>
              <th className="text-left px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {trackingData.map((t, i) => (
              <tr
                key={i}
                className="border-b hover:bg-blue-50 transition-colors"
              >
                <td className="px-4 py-2">{t.imei}</td>
                <td className="px-4 py-2">{t.latitude}</td>
                <td className="px-4 py-2">{t.longitude}</td>
                <td className="px-4 py-2">{t.address}</td>
                <td className="px-4 py-2">{t.trackerName}</td>
                <td className="px-4 py-2">{t.trackedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
