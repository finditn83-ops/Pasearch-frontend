import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function DashboardLayout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = auth?.user?.role || "reporter";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold">PASEARCH</span>
          </Link>
          <p className="text-xs text-slate-400 mt-1">
            Device Recovery & Intelligence
          </p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem to="/" label="Overview" />
          <NavItem to="/reporter" label="Report Device" />
          {(role === "police" || role === "admin") && (
            <NavItem to="/police" label="Police Tools" />
          )}
          {role === "admin" && <NavItem to="/admin" label="Admin Panel" />}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="mb-2">
            <div className="font-semibold text-slate-200 text-sm">
              {auth?.user?.username}
            </div>
            <div className="capitalize">{role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-300 hover:text-red-200 text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
          <div className="text-sm text-slate-600">
            Backend:{" "}
            <span className="font-mono bg-slate-100 px-2 py-1 rounded">
              {import.meta.env.VITE_API_URL || "http://localhost:5000"}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            PASEARCH MVP • IMEI & Account-based Matching
          </div>
        </header>

        <section className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block px-3 py-2 rounded text-sm ${
          isActive
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default DashboardLayout;
