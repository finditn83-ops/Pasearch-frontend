// =============================================================
// 🧠 CyberIntelFeed.jsx — Live Cyber Law & Cybercrime Intelligence
//   - Auto-refresh every 30s
//   - Shows "Last updated" timestamp
// =============================================================
import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import { RefreshCw, Clock } from "lucide-react";
import { toast } from "react-toastify";

export default function CyberIntelFeed({ intervalMs = 30000 }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  // Fetch once
  const fetchNews = async (opts = { showToastOnError: true }) => {
    try {
      setLoading(true);
      const res = await API.get("/ai/news");
      const items = res.data?.articles || [];
      setNews(items.slice(0, 10));
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (opts.showToastOnError) toast.error("Failed to load cyber intelligence feed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    // initial load
    fetchNews({ showToastOnError: false });

    // set interval
    timerRef.current = setInterval(() => {
      fetchNews({ showToastOnError: false });
    }, intervalMs);

    // cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs]);

  const fmt = (d) =>
    d ? `${d.toLocaleDateString()} ${d.toLocaleTimeString()}` : "—";

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-blue-700">
          🧠 Cyber Intelligence Feed
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={14} />
            <span>Last updated: {fmt(lastUpdated)}</span>
          </div>
          <button
            onClick={() => fetchNews()}
            disabled={loading}
            className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            <RefreshCw size={14} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {news.length === 0 && !loading && (
        <p className="text-gray-500 italic">
          No cyber intelligence news available yet. Try refreshing.
        </p>
      )}

      <ul className="divide-y divide-gray-200">
        {news.map((item, i) => (
          <li key={i} className="py-3">
            <a
              href={item.link || item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 hover:underline"
            >
              {item.title}
            </a>

            {item.summary && (
              <p className="text-sm text-gray-700 mt-1">
                {item.summary.length > 180
                  ? item.summary.slice(0, 180) + "…"
                  : item.summary}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1">
              Source: {item.source || "Unknown"} •{" "}
              {new Date(item.pubDate || item.published_at || Date.now()).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
