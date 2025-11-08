// ============================================================
// 🧭 DashboardLayout.jsx — Global Dashboard Shell (Responsive + Smart)
// Shows user info, local/UTC time, IP, and provides topbar + sidebar
// ============================================================
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clearAuth, getCurrentUser } from "../utils/auth";
import { toast } from "react-toastify";
import { Menu, X, LogOut } from "lucide-react";
import PasearchAssistant from "../components/PasearchAssistant";

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
        const localFormatted = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date);
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
          const info = `${data.city || "Unknown City"} • ${
            data.country_name || "Unknown Country"
          }`;
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
    clearAuth();
    localStorage.removeItem("lastLogin");
    localStorage.removeItem("ipInfo");
    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  // 🧭 Sidebar menu by role
  const menu = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Device Lookup", path: "/device/lookup" },
      { label: "Logout", action: handleLogout },
    ],
    police: [
      { label: "Search Devices", path: "/police/dashboard" },
      { label: "Device Lookup", path: "/device/lookup" },
      { label: "Logout", action: handleLogout },
    ],
    reporter: [
      { label: "Report Device", path: "/report" },
      { label: "Device Lookup", path: "/device/lookup" },
      { label: "Logout", action: handleLogout },
    ],
  };

  const links = menu[user?.role] || [];

  // 🖼️ Layout render
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= Sidebar ================= */}
      <aside
        className={`${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static top-0 left-0 z-40 w-64 bg-blue-700 text-white flex flex-col shadow-lg transition-transform duration-300`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between md:justify-center px-4 py-4 border-b border-blue-500">
          <h1 className="text-xl font-bold tracking-wide">PASEARCH</h1>
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {links.map((item, i) =>
            item.action ? (
              <button
                key={i}
                onClick={item.action}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={i}
                to={item.path}
                className="block px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t border-blue-500 text-sm text-center bg-blue-800">
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

      {/* ================= Main Area ================= */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-blue-700"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-blue-700">
              {user?.role ? `${user.role.toUpperCase()} PANEL` : "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-600">
              Welcome, <strong>{user?.username || "User"}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 relative">
          {children}
          {/* 💬 Pasearch AI Assistant */}
          <PasearchAssistant />
        </main>
      </div>
    </div>
  );
}
