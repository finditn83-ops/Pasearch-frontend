import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { clearAuth, getAuth } from "../utils/auth";
import { pingBackend } from "../api";
import { toast } from "react-toastify";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(null);

  const auth = getAuth();
  const user = auth?.user;
  const username = user?.username;
  const role = user?.role;

  // 🟢 Check backend connection every 60s
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await pingBackend();
        if (res?.ok || res?.message?.includes("Backend reachable")) {
          setOnline(true);
        } else {
          setOnline(false);
        }
      } catch {
        setOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 60000);
    return () => clearInterval(interval);
  }, []);

  // highlight active link
  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
      : "hover:text-blue-600 transition-colors";

  // logout
  const handleLogout = () => {
    clearAuth();
    toast.info("You have logged out.");
    navigate("/");
  };

  // hide navbar on these pages
  const hideNavbar = [
    "/",
    "/register/owner",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/success",
  ];
  if (hideNavbar.includes(location.pathname)) return null;

  // 🧭 Role-based navigation
  const renderLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/register/owner" className={isActive("/register/owner")}>
            Register
          </Link>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </>
      );
    }

    switch (role) {
      case "admin":
        return (
          <>
            <Link
              to="/admin/dashboard"
              className={isActive("/admin/dashboard")}
            >
              Dashboard
            </Link>
            <Link
              to="/reporter/dashboard"
              className={isActive("/reporter/dashboard")}
            >
              Reporter View
            </Link>
            <Link
              to="/admin/activity"
              className={isActive("/admin/activity")}
            >
              Activity Logs
            </Link>
          </>
        );

      case "police":
        return (
          <>
            <Link
              to="/police/dashboard"
              className={isActive("/police/dashboard")}
            >
              Police Dashboard
            </Link>
          </>
        );

      case "reporter":
        return (
          <>
            <Link
              to="/reporter/dashboard"
              className={isActive("/reporter/dashboard")}
            >
              My Dashboard
            </Link>
            <Link
              to="/reporter/report"
              className={isActive("/reporter/report")}
            >
              Report Device
            </Link>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        {/* === LEFT: Logo + Backend Status Light === */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="PASEARCH Logo"
            className="w-10 h-10 object-contain"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <h1 className="text-xl font-extrabold text-blue-700 tracking-wide">
            PASEARCH
          </h1>
          <div
            className={`ml-2 w-3 h-3 rounded-full ${
              online === null
                ? "bg-gray-400 animate-pulse"
                : online
                ? "bg-green-500"
                : "bg-red-500"
            }`}
            title={
              online === null
                ? "Checking backend..."
                : online
                ? "Backend connected"
                : "Backend offline"
            }
          ></div>
        </div>

        {/* === RIGHT: Desktop Links === */}
        <div className="hidden md:flex items-center space-x-10 text-gray-700 font-medium text-[15px]">
          {renderLinks()}
          {username && (
            <>
              <span className="text-gray-500">Hi, {username}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* === Mobile Menu Toggle === */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* === Mobile Dropdown === */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 pb-4 space-y-3 text-gray-700 font-medium">
          {renderLinks()}
          {username && (
            <>
              <p className="text-gray-500">Hi, {username}</p>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline block"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
