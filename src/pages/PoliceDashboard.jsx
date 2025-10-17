import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MapView from "../components/MapView";
import { toast } from "react-toastify";
import { getDeviceByImei } from "../api";

const SOCKET_URL = "https://pasearch-backend.onrender.com";

export default function PoliceDashboard() {
  const [imei, setImei] = useState("");
  const [device, setDevice] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // ==============================
  // 🧠 Connect to Socket.IO
  // ==============================
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to live tracking socket:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Disconnected from live tracking socket");
      setSocketConnected(false);
    });

    // 🔊 Receive live updates
    socket.on("tracking_update", (data) => {
      console.log("📡 Live update:", data);
      setTrackingData((prev) => [data, ...prev]);
      toast.info(`Live update received for IMEI ${data.imei}`);
    });

    return () => socket.disconnect();
  }, []);

  // ==============================
  // 🔍 Lookup device by IMEI
  // ==============================
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return toast.warn("Enter IMEI first");

    try {
      const res = await getDeviceByImei(imei.trim());
      setDevice(res);
      toast.success("Device found");
    } catch (err) {
      console.error(err);
      toast.error("Device not found");
    }
  };

  // ==============================
  // 🗺️ Latest tracking position
  // ==============================
  const latest = trackingData.find((t) => t.imei === imei);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Police Dashboard
      </h1>

      {/* Connection status */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
          socketConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {socketConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
      </div>

      {/* Search form */}
      <form
        onSubmit={handleLookup}
        className="flex gap-2 mb-6 items-center"
      >
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Enter IMEI number"
          className="border border-gray-300 rounded px-3 py-2 flex-1 focus:ring focus:ring-blue-200"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {/* Map + Info */}
      {latest && (
        <MapView
          imei={latest.imei}
          latitude={latest.latitude}
          longitude={latest.longitude}
          address={latest.address}
        />
      )}

      {/* Device info */}
      {device && (
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Device Information
          </h2>
          <p><strong>Device Type:</strong> {device.device_type}</p>
          <p><strong>Color:</strong> {device.color}</p>
          <p><strong>Reported By:</strong> {device.reporter_email}</p>
          <p><strong>Location Area:</strong> {device.location_area}</p>
        </div>
      )}

      {/* Recent tracking table */}
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
