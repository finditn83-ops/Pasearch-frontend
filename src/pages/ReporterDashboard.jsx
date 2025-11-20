import React, { useState } from "react";
import API from "../api.js";

function ReporterDashboard() {
  const [form, setForm] = useState({
    device_type: "",
    imei: "",
    color: "",
    location_area: "",
    lost_type: "stolen",
    lost_datetime: "",
    reporter_email: "",
    google_account_email: "",
    apple_id_email: "",
    contact_hint: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: "" });

    try {
      const res = await API.post("/report-device", form);

      setStatus({
        loading: false,
        message: `Device reported successfully (ID ${res.data.id})`,
        error: "",
      });

      // Clear form
      setForm({
        device_type: "",
        imei: "",
        color: "",
        location_area: "",
        lost_type: "stolen",
        lost_datetime: "",
        reporter_email: "",
        google_account_email: "",
        apple_id_email: "",
        contact_hint: "",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        loading: false,
        message: "",
        error:
          err.response?.data?.error ||
          "Failed to submit report. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        Report Lost / Stolen Device
      </h2>

      {status.message && (
        <div className="text-sm text-green-700 bg-green-100 border border-green-300 px-3 py-2 rounded">
          {status.message}
        </div>
      )}

      {status.error && (
        <div className="text-sm text-red-700 bg-red-100 border border-red-300 px-3 py-2 rounded">
          {status.error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
      >
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Device Type
          </label>
          <input
            name="device_type"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            placeholder="Phone, Laptop, TV..."
            value={form.device_type}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">IMEI</label>
          <input
            name="imei"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            placeholder="(Optional) If known"
            value={form.imei}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Color</label>
          <input
            name="color"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            value={form.color}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Location / Area
          </label>
          <input
            name="location_area"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            placeholder="Where it was lost/stolen"
            value={form.location_area}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Incident Type
          </label>
          <select
            name="lost_type"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            value={form.lost_type}
            onChange={onChange}
          >
            <option value="stolen">Stolen</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            name="lost_datetime"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            value={form.lost_datetime}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Reporter Email
          </label>
          <input
            name="reporter_email"
            type="email"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            value={form.reporter_email}
            onChange={onChange}
          />
        </div>

        {/* AI-powered fields */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Google / Play Store Email
          </label>
          <input
            name="google_account_email"
            type="email"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            placeholder="Gmail used on the device"
            value={form.google_account_email}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Apple ID / iCloud Email
          </label>
          <input
            name="apple_id_email"
            type="email"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            placeholder="Apple ID used on the device"
            value={form.apple_id_email}
            onChange={onChange}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-slate-500 mb-1">
            Contact / Phonebook Hints
          </label>
          <textarea
            name="contact_hint"
            className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
            rows="3"
            placeholder="e.g. Mum +2609..., Spouse +26097..., Work +26095..."
            value={form.contact_hint}
            onChange={onChange}
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={status.loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded font-medium disabled:opacity-50"
          >
            {status.loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReporterDashboard;
