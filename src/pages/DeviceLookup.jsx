import React, { useState } from "react";
import { getDeviceByImei } from "../api";
import { toast } from "react-toastify";

export default function DeviceLookup() {
  const [imei, setImei] = useState("");
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!imei) return toast.error("Enter IMEI number");
    setLoading(true);
    try {
      const res = await getDeviceByImei(imei, true);
      setDevice(res.device);
      setHistory(res.history || []);
    } catch {
      toast.error("Device not found or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-blue-600">Device Lookup</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter IMEI"
          value={imei}
          onChange={(e) => setImei(e.target.value.trim())}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleLookup}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Lookup"}
        </button>
      </div>

      {device && (
        <div className="border rounded p-3 shadow-sm">
          <h2 className="font-bold text-lg mb-2">{device.device_type}</h2>
          <p>IMEI: {device.imei}</p>
          <p>Color: {device.color}</p>
          <p>Status: {device.status}</p>
          <p>Reported by: {device.email}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Tracking History</h3>
          <ul className="list-disc pl-5">
            {history.map((h, i) => (
              <li key={i}>
                {h.trackedAt} – {h.address || "Unknown address"} ({h.latitude},{" "}
                {h.longitude})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
