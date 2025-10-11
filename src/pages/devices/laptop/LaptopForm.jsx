import { useState } from "react";
import axios from "axios";
import { generateReportPDF } from "../../../utils/generateReportPDF.js";

export default function LaptopForm({ onSubmitted }) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [policeFile, setPoliceFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [policePreview, setPolicePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const token = auth?.token;
  const userId = auth?.user?.id;

  // ✅ Validation
  const validate = () => {
    const e = {};
    if (!brand.trim()) e.brand = "Brand is required";
    if (!model.trim()) e.model = "Model is required";
    if (!serial.trim()) e.serial = "Serial number is required";
    if (!location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ Handle file upload and preview
  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const t = file.type;
    if (t.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setPreview(r.result);
      r.readAsDataURL(file);
    } else if (t === "application/pdf") setPreview("PDF");
    else setPreview("FILE");
  };

  // ✅ Submit Form
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!userId) return alert("Please login first.");

    const fd = new FormData();
    fd.append("device_category", "laptop");
    fd.append("device_type", `${brand} ${model}`);
    fd.append("imei", serial);
    fd.append("color", color);
    fd.append("location_area", location);
    if (proofFile) fd.append("proof", proofFile);
    if (policeFile) fd.append("police_report", policeFile);

    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/report", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.ok) {
        const summary = {
          report_id: res.data.device_id,
          device_category: "laptop",
          brand,
          model,
          serial,
          color,
          location,
          proof_name: proofFile?.name || "None",
          police_name: policeFile?.name || "None",
          reporter: auth?.user?.username || "Unknown",
        };

        // 🟢 Generate PDF Report after success
        generateReportPDF({
          model: `${brand} ${model}`,
          serial,
          location,
          reporter: summary.reporter,
        });

        alert("✅ Laptop report submitted successfully!");
        onSubmitted?.(summary);

        // ✅ Reset form
        setBrand("");
        setModel("");
        setSerial("");
        setColor("");
        setLocation("");
        setProofFile(null);
        setPoliceFile(null);
        setProofPreview(null);
        setPolicePreview(null);
      } else {
        alert("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" encType="multipart/form-data">
      {/* === Brand === */}
      <div>
        <label className="block text-sm font-medium mb-1">Brand *</label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className={`w-full border rounded px-3 py-2 ${
            errors.brand ? "border-red-500" : ""
          }`}
          placeholder="e.g., Dell"
        />
        {errors.brand && (
          <p className="text-red-600 text-xs mt-1">{errors.brand}</p>
        )}
      </div>

      {/* === Model === */}
      <div>
        <label className="block text-sm font-medium mb-1">Model *</label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className={`w-full border rounded px-3 py-2 ${
            errors.model ? "border-red-500" : ""
          }`}
          placeholder="e.g., Inspiron 15"
        />
        {errors.model && (
          <p className="text-red-600 text-xs mt-1">{errors.model}</p>
        )}
      </div>

      {/* === Serial === */}
      <div>
        <label className="block text-sm font-medium mb-1">Serial Number *</label>
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className={`w-full border rounded px-3 py-2 ${
            errors.serial ? "border-red-500" : ""
          }`}
          placeholder="e.g., SN12345"
        />
        {errors.serial && (
          <p className="text-red-600 text-xs mt-1">{errors.serial}</p>
        )}
      </div>

      {/* === Color === */}
      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g., Silver"
        />
      </div>

      {/* === Location === */}
      <div>
        <label className="block text-sm font-medium mb-1">Location Lost *</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`w-full border rounded px-3 py-2 ${
            errors.location ? "border-red-500" : ""
          }`}
          placeholder="e.g., Office or Bus Stop"
        />
        {errors.location && (
          <p className="text-red-600 text-xs mt-1">{errors.location}</p>
        )}
      </div>

      {/* === Uploads === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Proof of Ownership */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Proof of Ownership (upload)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) =>
              handleFileChange(e, setProofFile, setProofPreview)
            }
            className="w-full"
          />
          {proofPreview && (
            <div className="mt-2">
              {proofPreview === "PDF" ? (
                <p className="text-sm text-gray-700">
                  📘 PDF File: {proofFile?.name}
                </p>
              ) : (
                <img
                  src={proofPreview}
                  alt="Proof Preview"
                  className="mt-1 w-32 h-32 object-cover rounded border"
                />
              )}
            </div>
          )}
        </div>

        {/* Police Report */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Police Report (upload)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) =>
              handleFileChange(e, setPoliceFile, setPolicePreview)
            }
            className="w-full"
          />
          {policePreview && (
            <div className="mt-2">
              {policePreview === "PDF" ? (
                <p className="text-sm text-gray-700">
                  📘 PDF File: {policeFile?.name}
                </p>
              ) : (
                <img
                  src={policePreview}
                  alt="Police Report Preview"
                  className="mt-1 w-32 h-32 object-cover rounded border"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* === Submit === */}
      <div className="flex justify-end">
        <button
          disabled={submitting}
          type="submit"
          className={`px-5 py-2 rounded text-white ${
            submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
