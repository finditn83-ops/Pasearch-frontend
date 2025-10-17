import React, { useState, useEffect } from "react";
import { getTrackingByImei } from "../api";
import { toast } from "react-toastify";
import MapView from "../components/MapView";

export default function PoliceDashboard() {
  const [imei, setImei] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // 🔄 Fetch tracking data
  const fetchTracking = async (showToast = false) => {
    if (!imei.trim()) return;
    try {
      const res = await getTrackingByImei(imei);
      if (res.ok && res.tracks.length > 0) {
        setTracks(res.tracks);
        setLastUpdated(new Date());
        if (showToast) toast.success("Tracking data refreshed");
      } else {
        setTracks([]);
        if (showToast) toast.info("No tracking data found for this IMEI.");
      }
    } catch (err) {
      toast.error("Failed to fetch tracking data.");
    }
  };

  // 🔍 Manual search
  const handleSearch = async () => {
    if (!imei.trim()) {
      toast.warning("Please enter an IMEI number.");
      return;
    }
    setLoading(true);
    await fetchTracking(true);
    setLoading(false);
  };

  // ⏱️ Auto-refresh every 30 s
  useEffect(() => {
    if (!autoRefresh || !imei) return;
    const interval = setInterval(() => fetchTracking(), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, imei]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold text-blue-700 mb-4">
        Police Tracking Dashboard
      </h1>

      {/* Search controls */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Enter IMEI number"
          className="flex-1 border rounded-lg p-2 text-sm focus:outline-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {/* Auto refresh toggle */}
        {tracks.length > 0 && (
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm ${
              autoRefresh ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {autoRefresh ? "⏸ Stop Auto-Refresh" : "🔄 Enable Auto-Refresh"}
          </button>
        )}
      </div>

      {/* Timestamp */}
      {lastUpdated && (
        <p className="text-xs text-gray-500 mb-3">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Map */}
      {tracks.length > 0 && <MapView tracks={tracks} />}

      {/* Table */}
      {tracks.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto mt-6">
          <h2 className="font-semibold text-gray-700 mb-2">
            Latest tracking results for IMEI:{" "}
            <span className="text-blue-600">{imei}</span>
          </h2>
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Latitude</th>
                <th className="p-2 border">Longitude</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Tracked By</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((t, i) => (
                <tr key={i}>
                  <td className="p-2 border">{t.latitude}</td>
                  <td className="p-2 border">{t.longitude}</td>
                  <td className="p-2 border">{t.address || "N/A"}</td>
                  <td className="p-2 border">{t.trackerName || "Unknown"}</td>
                  <td className="p-2 border text-xs text-gray-500">
                    {new Date(t.trackedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tracks.length === 0 && (
        <p className="text-gray-500 text-sm italic mt-10 text-center">
          Enter an IMEI number to view tracking history on the map.
        </p>
      )}
    </div>
  );
}
