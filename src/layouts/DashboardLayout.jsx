import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "../api";
import PasearchAssistant from "../components/PasearchAssistant"; // 👈 Added import

export default function DashboardLayout({ children }) {
  const user = getCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const menu = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Devices", path: "/device/lookup" },
      { label: "Logout", action: () => logout() },
    ],
    police: [
      { label: "Search Devices", path: "/police/dashboard" },
      { label: "Device Lookup", path: "/device/lookup" },
      { label: "Logout", action: () => logout() },
    ],
    reporter: [
      { label: "Report Device", path: "/report" },
      { label: "Lookup", path: "/device/lookup" },
      { label: "Logout", action: () => logout() },
    ],
  };

  const links = menu[user.role] || menu.reporter;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-blue-700 text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-blue-500">
          Pasearch
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {links.map((item, i) =>
            item.action ? (
              <button
                key={i}
                onClick={item.action}
                className="block w-full text-left px-3 py-2 rounded hover:bg-blue-600"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={i}
                to={item.path}
                className="block px-3 py-2 rounded hover:bg-blue-600"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="p-3 border-t border-blue-500 text-sm text-center">
          Logged in as <b>{user.username}</b>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 relative">
        {children}

        {/* 👇 Pasearch AI Chat Assistant (always available) */}
        <PasearchAssistant />
      </main>
    </div>
  );
}
