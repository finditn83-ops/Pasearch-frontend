// src/pages/Report.jsx
import { useState, useEffect } from "react";
import PhoneForm from "./devices/phone/PhoneForm";
import LaptopForm from "./devices/laptop/LaptopForm";
import SmartTvForm from "./devices/smart_tv/SmartTvForm";

export default function Report() {
  const [category, setCategory] = useState("phone");
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // Called when a form completes successfully
  const handleSubmitted = (data) => {
    setSummary(data);
    setStep(3);
    setCountdown(5);
  };

  useEffect(() => {
    if (step === 3 && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 3 && countdown === 0) {
      window.location.href = "/";
    }
  }, [step, countdown]);

  const onStartFilling = (cat) => {
    setCategory(cat);
    setStep(2);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Progress header */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recovery Report</h2>
            <span className="text-sm text-gray-600">Follow the steps</span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            {["Choose Device", "Fill Details", "Confirmation"].map((t, i) => {
              const s = i + 1;
              const active =
                step === s
                  ? "bg-blue-600 text-white"
                  : step > s
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600";
              return (
                <div key={t} className={`flex-1 text-center py-2 rounded ${active}`}>
                  Step {s}
                  <br />
                  <span className="text-xs">{t}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1 — Select device */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-xl font-bold mb-4">
              What item do you want to recover?
            </h3>
            <div className="flex gap-4 mb-6 justify-center">
              <button
                onClick={() => onStartFilling("phone")}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                My Phone
              </button>
              <button
                onClick={() => onStartFilling("laptop")}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                My Laptop
              </button>
              <button
                onClick={() => onStartFilling("smart_tv")}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                My Smart TV
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Choose the type of device you wish to report.
            </p>
          </div>
        )}

        {/* Step 2 — Fill form */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold capitalize">{category} Details</h3>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:underline"
              >
                ← Change Device
              </button>
            </div>
            {category === "phone" && <PhoneForm onSubmitted={handleSubmitted} />}
            {category === "laptop" && <LaptopForm onSubmitted={handleSubmitted} />}
            {category === "smart_tv" && (
              <SmartTvForm onSubmitted={handleSubmitted} />
            )}
          </div>
        )}

        {/* Step 3 — Success summary */}
        {step === 3 && summary && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              ✅ Report Submitted Successfully
            </h3>

            <div className="text-left mb-6 border-t pt-4 space-y-2 text-gray-700">
              <p>
                <strong>Device Type:</strong> {summary.device_category}
              </p>
              <p>
                <strong>Model:</strong> {summary.device_type || "—"}
              </p>
              {summary.imei && (
                <p>
                  <strong>IMEI / Serial:</strong> {summary.imei}
                </p>
              )}
              <p>
                <strong>Location:</strong> {summary.location_area || "—"}
              </p>
              {(summary.proof_name || summary.police_name) && (
                <div className="mt-3">
                  {summary.proof_name && (
                    <p>
                      <strong>Proof of Ownership:</strong> {summary.proof_name}
                    </p>
                  )}
                  {summary.police_name && (
                    <p>
                      <strong>Police Report:</strong> {summary.police_name}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <p className="text-gray-700 mb-6">
              Redirecting to Home in {countdown} seconds…
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                Submit Another Report
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Go Home Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
