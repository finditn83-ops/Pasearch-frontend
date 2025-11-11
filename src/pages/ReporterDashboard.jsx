// ==============================================
// 📱 ReporterDashboard.jsx — Report & Track Devices
// ==============================================
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../api";
import MapView from "../components/MapView";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://pasearch-backend.onrender.com";

export default function ReporterDashboard() {
  const [form, setForm] = useState({
    device_category: "",
    device_type: "",
    imei: "",
    color: "",
    storage: "",
    location_area: "",
    lost_type: "",
    lost_datetime: "",
    other_details: "",
    reporter_name: "",
    reporter_email: "",
  });

  const [proofFile, setProofFile] = useState(null);
  const [policeFile, setPoliceFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [latestTrack, setLatestTrack] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // ✅ Connect to Socket.IO for live tracking updates
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"], reconnection: true });

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("✅ Connected to Socket.IO:", socket.id);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.warn("⚠️ Disconnected from Socket.IO");
    });

    socket.on("tracking_update", (data) => {
      if (data.imei === form.imei) {
        toast.info(`📍 Your device (${data.imei}) was tracked at ${data.address}`);
        setLatestTrack(data);
      }
    });

    return () => socket.disconnect();
  }, [form.imei]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit lost/stolen device report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.imei || !form.device_type || !form.reporter_email) {
      toast.warn("Please fill all required fields: IMEI, device type, reporter email.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (proofFile) data.append("proof_path", proofFile);
    if (policeFile) data.append("police_report_path", policeFile);

    try {
      const res = await API.post("/report-device", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Device reported successfully!");
      console.log("Report response:", res.data);

      // Add to local list
      setReports((prev) => [form, ...prev]);
      setForm({
        device_category: "",
        device_type: "",
        imei: "",
        color: "",
        storage: "",
        location_area: "",
        lost_type: "",
        lost_datetime: "",
        other_details: "",
        reporter_name: "",
        reporter_email: "",
      });
      setProofFile(null);
      setPoliceFile(null);
    } catch (error) {
      console.error("Report error:", error);
      toast.error("❌ Failed to report device.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Reporter Dashboard
      </h1>

      {/* Socket connection status */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
          socketConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {socketConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
      </div>

      {/* Reporting Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="device_category"
          placeholder="Device Category (Phone, Laptop, TV)"
          value={form.device_category}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="text"
          name="device_type"
          placeholder="Device Type / Model"
          value={form.device_type}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="text"
          name="imei"
          placeholder="IMEI / Serial Number"
          value={form.imei}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          name="color"
          placeholder="Color"
          value={form.color}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="text"
          name="storage"
          placeholder="Storage (e.g., 128GB)"
          value={form.storage}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="text"
          name="location_area"
          placeholder="Last Known Location"
          value={form.location_area}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="text"
          name="lost_type"
          placeholder="Lost / Stolen"
          value={form.lost_type}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="datetime-local"
          name="lost_datetime"
          value={form.lost_datetime}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <textarea
          name="other_details"
          placeholder="Other details (unique marks, etc.)"
          value={form.other_details}
          onChange={handleChange}
          className="border rounded p-2 col-span-2"
        />

        {/* File Uploads */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Proof of Ownership</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setProofFile(e.target.files[0])}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Police Report (optional)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setPoliceFile(e.target.files[0])}
          />
        </div>

        {/* Reporter info */}
        <input
          type="text"
          name="reporter_name"
          placeholder="Your Name"
          value={form.reporter_name}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="email"
          name="reporter_email"
          placeholder="Your Email"
          value={form.reporter_email}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />

        <button
          type="submit"
          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
        >
          Submit Report
        </button>
      </form>

      {/* Latest Live Location */}
      {latestTrack && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            📍 Latest Device Location
          </h2>
          <MapView
            imei={latestTrack.imei}
            latitude={latestTrack.latitude}
            longitude={latestTrack.longitude}
            address={latestTrack.address}
          />
        </div>
      )}

      {/* Reporter’s history */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-x-auto">
        <h2 className="text-lg font-semibold text-blue-700 p-4 border-b">
          My Reported Devices
        </h2>
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-blue-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">IMEI</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Location</th>
              <th className="text-left px-4 py-2">Date Reported</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">{r.imei}</td>
                <td className="px-4 py-2">{r.device_type}</td>
                <td className="px-4 py-2">{r.location_area}</td>
                <td className="px-4 py-2">{r.lost_datetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
