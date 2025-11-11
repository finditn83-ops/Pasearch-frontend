import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { getDeviceByImei, updateDeviceStatus } from "../api";
import MultiMapView from "../components/MultiMapView";

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "https://pasearch-backend.onrender.com";

export default function AdminDashboard() {
  // ==============================
  // 🧠 States
  // ==============================
  const [imei, setImei] = useState("");
  const [device, setDevice] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [news, setNews] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const audioRef = useRef(null);

  // ✅ Get current admin name
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const adminName = auth?.user?.name || auth?.user?.username || "Admin";

  // ==============================
  // 📡 Socket.IO Real-Time Connection
  // ==============================
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

    // ✅ Receive live tracking updates
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
          const updatedPath = [...(device.pathHistory || []), newPoint].slice(
            -20
          );
          updated[idx] = { ...device, ...data, pathHistory: updatedPath };
          return updated;
        } else {
          return [
            {
              ...data,
              pathHistory: [
                {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  trackedAt: data.trackedAt,
                },
              ],
            },
            ...prev,
          ].slice(0, 50);
        }
      });

      toast.info(`📍 ${data.imei} moved to ${data.address || "Unknown"}`);
    });

    socket.on("device_frozen", (data) => {
      toast.warning(`⚠️ Device ${data.imei} appears inactive or locked`);
    });

    return () => socket.disconnect();
  }, []);

  // ==============================
  // 🔍 Lookup Device by IMEI
  // ==============================
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

  // ==============================
  // 🧾 Update Device Status
  // ==============================
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

  // ==============================
  // 📰 Load Cyber Intel Feed
  // ==============================
  async function loadNews() {
    try {
      const res = await fetch(`${SOCKET_URL}/admin/news`);
      const data = await res.json();
      setNews(data.articles || []);
    } catch (err) {
      console.error("Intel fetch error:", err);
    }
  }
  useEffect(() => {
    loadNews();
  }, []);

  // ==============================
  // 🤖 Ask PASEARCH AI Assistant
  // ==============================
  async function askAI() {
    if (!question.trim()) return;
    setLoadingAI(true);
    setAnswer("");
    try {
      const res = await fetch(`${SOCKET_URL}/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No response available");
    } catch {
      toast.error("AI connection failed");
    } finally {
      setLoadingAI(false);
    }
  }

  // 🔊 Voice for AI Response
  async function speakAnswer() {
    if (!answer) return;
    setVoicePlaying(true);
    try {
      const res = await fetch(`${SOCKET_URL}/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer }),
      });
      const data = await res.json();
      const audio = new Audio(data.audio);
      audioRef.current = audio;
      audio.onended = () => setVoicePlaying(false);
      audio.play();
    } catch {
      toast.error("Voice playback failed");
      setVoicePlaying(false);
    }
  }

  // ==============================
  // 🖥️ Render Dashboard
  // ==============================
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">
        🧭 PASEARCH Admin Dashboard
      </h1>

      {/* Connection Indicator */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm ${
          socketConnected
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {socketConnected ? "🟢 Live Connected" : "🔴 Disconnected"}
      </div>

      {/* IMEI Lookup */}
      <form onSubmit={handleLookup} className="flex gap-2 items-center">
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Enter IMEI number"
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {/* Device Info */}
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

      {/* Multi-Device Map with Motion Trails */}
      {trackingData.length > 0 ? (
        <MultiMapView devices={trackingData} />
      ) : (
        <p className="text-gray-500">Waiting for live tracking data...</p>
      )}

      {/* Intel Feed + AI Assistant */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* 📰 Cyber Intel */}
        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            📰 Cyber Intel Feed
          </h2>
          <div className="h-[400px] overflow-y-auto">
            {news.length > 0 ? (
              news.map((n, i) => (
                <div
                  key={i}
                  className="border-b pb-2 mb-2 hover:bg-gray-50 p-2 rounded"
                >
                  <a
                    href={n.url}
                    target="_blank"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {n.title}
                  </a>
                  <p className="text-xs text-gray-500">
                    {n.source} —{" "}
                    {n.published_at
                      ? new Date(n.published_at).toLocaleDateString()
                      : ""}
                  </p>
                  <p className="text-sm">{n.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No news yet...</p>
            )}
          </div>
        </div>

        {/* 🤖 AI Assistant */}
        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            🤖 PASEARCH AI Assistant
          </h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about cybercrime, IMEI change detection, or device recovery..."
            className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          ></textarea>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={askAI}
              disabled={loadingAI}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {loadingAI ? "Thinking..." : "Ask"}
            </button>
            {answer && (
              <button
                onClick={speakAnswer}
                disabled={voicePlaying}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                🔊 {voicePlaying ? "Speaking..." : "Speak"}
              </button>
            )}
          </div>
          {answer && (
            <div className="mt-3 bg-gray-50 border p-3 rounded">
              <p className="font-semibold text-gray-800 mb-1">AI Response:</p>
              <p className="whitespace-pre-line">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
