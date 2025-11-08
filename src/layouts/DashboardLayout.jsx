// ============================================================
// 🧭 DashboardLayout.jsx — Global Dashboard Shell
// Works worldwide — shows user info, local time, UTC time, IP & logout
// ============================================================
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../api";
import { toast } from "react-toastify";
import PasearchAssistant from "../components/PasearchAssistant";

export default function DashboardLayout({ children }) {
  const [lastLoginLocal, setLastLoginLocal] = useState(null);
  const [lastLoginUTC, setLastLoginUTC] = useState(null);
  const [ipInfo, setIpInfo] = useState(null);
  const user = getCurrentUser();
  const navigate = useNavigate();

  // 🧠 Load and format last login (Local + UTC)
  useEffect(() => {
    const stored = localStorage.getItem("lastLogin");
    if (stored) {
      try {
        const date = new Date(stored);

        // ✅ User's device local time
        const localFormatted = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date);

        // 🌐 UTC time (global standard)
        const utcFormatted = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        }).format(date);

        setLastLoginLocal(localFormatted);
        setLastLoginUTC(utcFormatted);
      } catch {
        setLastLoginLocal(stored);
      }
    }
  }, []);

  // 🌍 Fetch public IP and approximate location
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip) {
          const info = `${data.city || "Unknown City"} • ${data.country_name || "Unknown Country"} • ${data.ip}`;
          setIpInfo(info);
          localStorage.setItem("ipInfo", info);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem("ipInfo");
        if (stored) setIpInfo(stored);
      });
  }, []);

  // 🚦 Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.warn("Please log in to continue.");
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // 🚪 Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem("auth");
      localStorage.removeItem("lastLogin");
      localStorage.removeItem("ipInfo");
      sessionStorage.clear();
      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("❌ Logout error:", err);
      toast.error("Failed to log out.");
    }
  };

  // 🧭 Sidebar menu by role
  const menu = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Devices", path: "/device/lookup" },
      { label: "Logout", action: handleLogout },
    ],
    police: [
      { label: "Search Devices", path: "/police/dashboard" },
      { label: "Device Lookup", path: "/device/lookup" },
      { label: "Logout", action: handleLogout },
    ],
    reporter: [
      { label: "Report Device", path: "/report" },
      { label: "Lookup", path: "/device/lookup" },
      { label: "Logout", action: handleLogout },
    ],
  };

  const links = menu[user?.role] || [];

  // 🖼️ Layout render
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= Sidebar ================= */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col shadow-lg">
        {/* Logo / Title */}
        <div className="p-4 font-bold text-lg border-b border-blue-500">
          PASEARCH
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1">
          {links.map((item, i) =>
            item.action ? (
              <button
                key={i}
                onClick={item.action}
                className="block w-full text-left px-3 py-2 rounded hover:bg-blue-600 transition"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={i}
                to={item.path}
                className="block px-3 py-2 rounded hover:bg-blue-600 transition"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Footer — user info */}
        <div className="p-3 border-t border-blue-500 text-sm text-center bg-blue-800/40">
          {user ? (
            <>
              <div>
                Logged in as <b>{user.name || user.username}</b>
              </div>
              <div className="text-xs text-gray-200 italic">{user.role}</div>

              {lastLoginLocal && (
                <div className="text-[11px] text-gray-300 mt-1 leading-tight">
                  🕒 <b>Local:</b> {lastLoginLocal.replace(",", " •")}
                </div>
              )}
              {lastLoginUTC && (
                <div className="text-[11px] text-gray-300 mt-1 leading-tight">
                  🌐 <b>UTC:</b> {lastLoginUTC.replace(",", " •")}
                </div>
              )}

              {ipInfo && (
                <div className="text-[11px] text-gray-400 mt-1 leading-tight">
                  🌍 {ipInfo}
                </div>
              )}
            </>
          ) : (
            <span>Guest</span>
          )}
        </div>
      </aside>

      {/* ================= Main Content ================= */}
      <main className="flex-1 p-4 relative">
        {children}
        {/* 💬 Pasearch AI Assistant */}
        <PasearchAssistant />
      </main>
    </div>
  );
}
