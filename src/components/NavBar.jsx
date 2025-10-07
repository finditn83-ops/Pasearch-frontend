// src/components/NavBar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const username = auth?.user?.username;

  // highlight active page
  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1"
      : "hover:text-blue-600 transition-colors";

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        {/* === LEFT: LOGO + NAME === */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="PASEARCH Logo"
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              document.getElementById("nav-fallback-logo").style.display =
                "block";
            }}
          />
          <h1
            id="nav-fallback-logo"
            className="text-xl font-extrabold text-blue-700 tracking-wide"
          >
            PASEARCH
          </h1>
        </div>

        {/* === RIGHT: LINKS === */}
        <div className="flex items-center space-x-10 text-gray-700 font-medium text-[15px]">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/register/owner" className={isActive("/register/owner")}>
            Register
          </Link>
          <Link to="/report" className={isActive("/report")}>
            Report
          </Link>

          {username ? (
            <>
              <span className="text-gray-500">Hi, {username}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
