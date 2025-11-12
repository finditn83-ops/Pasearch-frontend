// =============================================================
// 🧭 PASEARCH AdminDashboard — Unified Control Center
// =============================================================
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { getDeviceByImei, updateDeviceStatus } from "../api";
import MultiMapView from "../components/MultiMapView";
import PasearchAssistant from "../components/PasearchAssistant";
import CyberIntelFeed from "../components/CyberIntelFeed";

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "https://pasearch-backend.onrender.com";

export default function AdminDashboard() {
  // =============================================================
  // 📦 STATE MANAGEMENT
  // =============================================================
  const [imei, setImei] = useState("");
  const [device, setDevice] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const adminName = auth?.user?.name || auth?.user?.username || "Admin";

  // =============================================================
  // 📡 SOCKET.IO REAL-TIME CONNECTION
  // =============================================================
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("✅ Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.warn("⚠️ Socket disconnected");
    });

    // 🔴 Device movement updates
    socket.on("tracking_update", (data) => {
      console.log("📡 Live update:", data);
      setTrackingData((prev) => {
        const idx = prev.findIndex((d) => d.imei === data.imei);
        if (idx !== -1) {
          const updated = [...prev];
          const device = updated[idx];
          const newPoint = {
            latitude: data.latitude,
            longitude: data.longitude,
            trackedAt: data.trackedAt,
          };
          const updatedPath = [...(device.pathHistory || []), newPoint].slice(-20);
          updated[idx] = { ...device, ...data, pathHistory: updatedPath };
          return updated;
        } else {
          return [
            {
              ...data,
              pathHistory: [
                { latitude: data.latitude, longitude: data.longitude, trackedAt: data.trackedAt },
              ],
            },
            ...prev,
          ].slice(0, 50);
        }
      });
      toast.info(`📍 ${data.imei} moved to ${data.address || "Unknown"}`);
    });

    // ⚠️ Frozen or locked alert
    socket.on("device_frozen", (data) =>
      toast.warning(`⚠️ Device ${data.imei} appears frozen or locked`)
    );

    return () => socket.disconnect();
  }, []);

  // =============================================================
  // 🔍 LOOKUP DEVICE BY IMEI
  // =============================================================
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return toast.warn("Enter IMEI first");
    try {
      const res = await getDeviceByImei(imei.trim());
      setDevice(res.data || res);
      toast.success("Device found");
    } catch {
      setDevice(null);
      toast.error("Device not found");
    }
  };

  // =============================================================
  // 🔧 UPDATE DEVICE STATUS
  // =============================================================
  const handleStatusUpdate = async () => {
    if (!device) return toast.warn("Search a device first");
    if (!status) return toast.warn("Select a status");
    setUpdating(true);
    try {
      await updateDeviceStatus(device.id, status, adminName);
      toast.success(`Device marked ${status}`);
      setDevice({ ...device, status });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // =============================================================
  // 🖥️ UI RENDER
  // =============================================================
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">
        🧭 PASEARCH Admin Dashboard
      </h1>

      {/* Connection indicator */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm ${
          socketConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {socketConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
      </div>

      {/* ============================== */}
      {/* IMEI LOOKUP SECTION */}
      {/* ============================== */}
      <form onSubmit={handleLookup} className="flex gap-2 items-center">
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Enter IMEI number"
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {/* ============================== */}
      {/* DEVICE INFO */}
      {/* ============================== */}
      {device && (
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Device Information
          </h2>
          <p>
            <strong>Type:</strong> {device.device_type} ({device.color})
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

          <div className="mt-3 flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-3 py-2"
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
                updating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 rounded`}
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* LIVE MAP SECTION */}
      {/* ============================== */}
      {trackingData.length > 0 ? (
        <MultiMapView devices={trackingData} />
      ) : (
        <p className="text-gray-500">Waiting for live tracking data...</p>
      )}

      {/* ============================== */}
      {/* AI + INTELLIGENCE SECTION */}
      {/* ============================== */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <PasearchAssistant />
        <CyberIntelFeed />
      </div>
    </div>
  );
}
