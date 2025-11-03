import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { getDeviceByImei, getRecentPoliceUpdates } from "../api";
import API from "../api";
import MapView from "../components/MapView";

const SOCKET_URL = "https://pasearch-backend.onrender.com";

export default function PoliceDashboard() {
  const [imei, setImei] = useState("");
  const [device, setDevice] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [updateType, setUpdateType] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState([]);

  // ====================================================
  // 🧠 Connect to Socket.IO — Real-time Tracking Listener
  // ====================================================
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
      console.log("📡 Live update (Police):", data);
      setTrackingData((prev) => [data, ...prev]);
      toast.info(`Live update received for IMEI ${data.imei}`);
    });

    return () => socket.disconnect();
  }, []);

  // ====================================================
  // 🔍 Lookup device by IMEI
  // ====================================================
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return toast.warn("Enter IMEI first");

    try {
      const res = await getDeviceByImei(imei.trim());
      setDevice(res.data || res);
      toast.success("Device found");
    } catch (err) {
      console.error("❌ Lookup failed:", err);
      toast.error("Device not found");
    }
  };

  // ====================================================
  // 🚓 Submit Police Case Update
  // ====================================================
  const handleCaseUpdate = async () => {
    if (!device) return toast.warn("Search for a device first");
    if (!caseNumber.trim() || !updateType.trim() || !officerName.trim()) {
      return toast.warn("Please fill all case details");
    }

    setSubmitting(true);
    try {
      const response = await API.put(`/admin/update-case/${device.id}`, {
        police_case_number: caseNumber,
        update_type: updateType,
        officer_name: officerName,
      });

      if (response.data.success) {
        toast.success("✅ Case update logged successfully!");
        setCaseNumber("");
        setUpdateType("");
        setOfficerName("");
        fetchRecentUpdates(); // refresh table
      } else {
        toast.error("Failed to log case update");
      }
    } catch (err) {
      console.error("❌ Case update failed:", err);
      toast.error("Error updating police case");
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // 🧩 Fetch recent police updates
  // ====================================================
  const fetchRecentUpdates = async () => {
    try {
      const data = await getRecentPoliceUpdates();
      setRecentUpdates(data);
    } catch (err) {
      console.error("❌ Failed to fetch recent updates:", err);
    }
  };

  useEffect(() => {
    fetchRecentUpdates();
  }, []);

  // ====================================================
  // 🗺️ Latest tracking position
  // ====================================================
  const latest = trackingData.find((t) => t.imei === imei);

  // ====================================================
  // 🖼️ Render
  // ====================================================
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Police Dashboard
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

      {/* IMEI Search Form */}
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

      {/* Map Display */}
      {latest && (
        <MapView
          imei={latest.imei}
          latitude={latest.latitude}
          longitude={latest.longitude}
          address={latest.address}
        />
      )}

      {/* Device Info + Case Form */}
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
            <strong>Location Area:</strong> {device.location_area}
          </p>

          {/* 🚓 Police Case Update Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              Police Case Update
            </h3>

            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="Officer Name"
                className="border border-gray-300 rounded px-3 py-2 flex-1 focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="Case Number"
                className="border border-gray-300 rounded px-3 py-2 flex-1 focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                placeholder="Update Type (e.g., Opened Case, Closed Case)"
                className="border border-gray-300 rounded px-3 py-2 flex-1 focus:ring focus:ring-blue-300"
              />
            </div>

            <button
              onClick={handleCaseUpdate}
              disabled={submitting}
              className={`${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 rounded`}
            >
              {submitting ? "Submitting..." : "Submit Case Update"}
            </button>
          </div>
        </div>
      )}

      {/* Tracking Updates Table */}
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
              <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
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

      {/* 🚔 Recent Police Case Updates Log */}
      <div className="mt-10 bg-white shadow rounded-lg overflow-x-auto">
        <h2 className="text-lg font-semibold text-blue-700 p-4 border-b">
          Recent Police Case Updates
        </h2>
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-green-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">IMEI</th>
              <th className="text-left px-4 py-2">Device Name</th>
              <th className="text-left px-4 py-2">Officer Name</th>
              <th className="text-left px-4 py-2">Case Number</th>
              <th className="text-left px-4 py-2">Update Type</th>
              <th className="text-left px-4 py-2">Date Updated</th>
            </tr>
          </thead>
          <tbody>
            {recentUpdates.map((u, i) => (
              <tr
                key={i}
                className="border-b hover:bg-green-50 transition-colors"
              >
                <td className="px-4 py-2">{u.imei}</td>
                <td className="px-4 py-2">{u.device_name}</td>
                <td className="px-4 py-2">{u.officer_name || "—"}</td>
                <td className="px-4 py-2">{u.police_case_number}</td>
                <td className="px-4 py-2">{u.status || "—"}</td>
                <td className="px-4 py-2">{u.updated_at || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
