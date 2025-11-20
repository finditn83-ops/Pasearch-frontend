import React, { useState } from "react";
import API from "../api.js";

function PoliceDashboard() {
  const [imeiSearch, setImeiSearch] = useState("");
  const [aiQuery, setAiQuery] = useState({
    imei: "",
    google_account_email: "",
    apple_id_email: "",
    owner_phone: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // ------------------------------------------
  // Exact IMEI Search
  // ------------------------------------------
  const handleImeiSearch = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    setResults([]);

    try {
      const res = await API.post("/pasearch-ai/match", { imei: imeiSearch });
      setResults(res.data.matches || []);
    } catch (err) {
      console.error(err);
      setErrMsg(err.response?.data?.error || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // AI Multi-Identifier Search
  // ------------------------------------------
  const handleAiSearch = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    setResults([]);

    try {
      const res = await API.post("/pasearch-ai/match", aiQuery);
      setResults(res.data.matches || []);
    } catch (err) {
      console.error(err);
      setErrMsg(err.response?.data?.error || "AI match failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        Police Tools — IMEI Search & PasearchAI Matching
      </h2>

      {errMsg && (
        <div className="text-sm text-red-700 bg-red-100 border border-red-300 px-3 py-2 rounded">
          {errMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* --------------------------------------------------
            Exact IMEI Search
        -------------------------------------------------- */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            Exact IMEI Search
          </h3>

          <form onSubmit={handleImeiSearch} className="space-y-2">
            <input
              className="w-full border border-slate-300 rounded px-2 py-2 text-sm"
              placeholder="Enter IMEI..."
              value={imeiSearch}
              onChange={(e) => setImeiSearch(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded font-medium disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search by IMEI"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-2">
            Matches using exact IMEI only.
          </p>
        </div>

        {/* --------------------------------------------------
            PasearchAI Search (IMEI-change resilient)
        -------------------------------------------------- */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            PasearchAI Matching (Even if IMEI is changed)
          </h3>

          <form onSubmit={handleAiSearch} className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-slate-500">IMEI</label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1"
                  value={aiQuery.imei}
                  onChange={(e) =>
                    setAiQuery((q) => ({ ...q, imei: e.target.value }))
                  }
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500">
                  Owner Phone
                </label>
                <input
                  className="w-full border border-slate-300 rounded px-2 py-1"
                  value={aiQuery.owner_phone}
                  onChange={(e) =>
                    setAiQuery((q) => ({ ...q, owner_phone: e.target.value }))
                  }
                  placeholder="+26097..."
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-slate-500 text-xs">
                Google / Play Store Email
              </label>
              <input
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                value={aiQuery.google_account_email}
                onChange={(e) =>
                  setAiQuery((q) => ({
                    ...q,
                    google_account_email: e.target.value,
                  }))
                }
                placeholder="Gmail used on device"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500 text-xs">
                Apple ID / iCloud Email
              </label>
              <input
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                value={aiQuery.apple_id_email}
                onChange={(e) =>
                  setAiQuery((q) => ({
                    ...q,
                    apple_id_email: e.target.value,
                  }))
                }
                placeholder="Apple ID used on device"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-medium disabled:opacity-50"
            >
              {loading ? "Matching..." : "Run PasearchAI Match"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-2">
            Combines IMEI, Google account, Apple ID, and phonebook hints.
          </p>
        </div>
      </div>

      {/* --------------------------------------------------
          Results Section
      -------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Results ({results.length})
        </h3>

        {results.length === 0 ? (
          <p className="text-xs text-slate-500">
            No matches yet. Run a search.
          </p>
        ) : (
          <div className="space-y-3">
            {results.map((m, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-3 text-xs"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-800">
                    Score: {m.score}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ID: {m.device.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p>
                      <span className="font-semibold">IMEI:</span>{" "}
                      {m.device.imei || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span>{" "}
                      {m.device.device_type || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Color:</span>{" "}
                      {m.device.color || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p>
                      <span className="font-semibold">Google:</span>{" "}
                      {m.device.google_account_email || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Apple ID:</span>{" "}
                      {m.device.apple_id_email || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Reporter:</span>{" "}
                      {m.device.reporter_email || "N/A"}
                    </p>
                  </div>
                </div>

                {m.device.contact_hint && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">
                      Contact hints:
                    </span>{" "}
                    {m.device.contact_hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PoliceDashboard;
