import { useState } from "react";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { reportDevice } from "../api";

export default function Report() {
  const [imei, setImei] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [locationLost, setLocationLost] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const { loading, setLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imei.trim() || !deviceName.trim() || !reporterName.trim()) {
      toast.error("Please fill in all required fields (IMEI, Device Name, Reporter Name).");
      return;
    }

    try {
      setLoading(true);
      await reportDevice({
        imei,
        deviceName,
        color,
        storage,
        locationLost,
        reporterName,
        reporterEmail,
      });

      toast.success("Device reported successfully!");
      // Optionally clear form
      setImei("");
      setDeviceName("");
      setColor("");
      setStorage("");
      setLocationLost("");
      setReporterName("");
      setReporterEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-lg mt-8"
    >
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        Report Lost or Stolen Device
      </h2>

      {/* IMEI */}
      <div>
        <label
          htmlFor="imei"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Device IMEI *
        </label>
        <input
          id="imei"
          name="imei"
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          required
          placeholder="Enter device IMEI number"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>

      {/* Device Name */}
      <div className="mt-3">
        <label
          htmlFor="deviceName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Device Name *
        </label>
        <input
          id="deviceName"
          name="deviceName"
          type="text"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          required
          placeholder="e.g. Samsung Galaxy S22"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>

      {/* Color */}
      <div className="mt-3">
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Color
        </label>
        <input
          id="color"
          name="color"
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="e.g. Black, Silver, Blue"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>

      {/* Storage */}
      <div className="mt-3">
        <label
          htmlFor="storage"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Storage
        </label>
        <input
          id="storage"
          name="storage"
          type="text"
          value={storage}
          onChange={(e) => setStorage(e.target.value)}
          placeholder="e.g. 128GB, 256GB"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>

      {/* Location Lost */}
      <div className="mt-3">
        <label
          htmlFor="locationLost"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Location Where Lost
        </label>
        <input
          id="locationLost"
          name="locationLost"
          type="text"
          value={locationLost}
          onChange={(e) => setLocationLost(e.target.value)}
          placeholder="Enter last known location"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>

      {/* Reporter Name */}
      <div className="mt-3">
        <label
          htmlFor="reporterName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reporter Name *
        </label>
        <input
          id="reporterName"
          name="reporterName"
          type="text"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          required
          placeholder="Your full name"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="name"
        />
      </div>

      {/* Reporter Email */}
      <div className="mt-3">
        <label
          htmlFor="reporterEmail"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reporter Email
        </label>
        <input
          id="reporterEmail"
          name="reporterEmail"
          type="email"
          value={reporterEmail}
          onChange={(e) => setReporterEmail(e.target.value)}
          placeholder="Enter your email (optional)"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="email"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-5 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
