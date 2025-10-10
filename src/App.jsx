// src/App.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

// === Utils ===
import { isTokenExpired, clearAuth } from "./utils/auth";

// === Components ===
import NavBar from "./components/NavBar";
import LoadingOverlay from "./components/LoadingOverlay";
import PasearchAssistant from "./components/PasearchAssistant";

// === Pages ===
import Home from "./pages/Home";
import RegisterOwner from "./pages/RegisterOwner";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ReporterDashboard from "./pages/ReporterDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Report from "./pages/Report";
import ResetPassword from "./pages/ResetPassword";
import Success from "./pages/Success";

// =============================================================
// 🛡️ Protected Route Wrapper
// =============================================================
function PrivateRoute({ children, allowedRoles = [] }) {
  const auth = JSON.parse(localStorage.getItem("auth"));

  // Not logged in
  if (!auth?.token) {
    toast.warning("Please log in to continue.");
    return <Navigate to="/" replace />;
  }

  // Role mismatch
  const userRole = auth.role || auth.user?.role;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    toast.error("Access denied: insufficient permissions.");
    return <Navigate to="/403" replace />;
  }

  return children;
}

// =============================================================
// 🚫 Custom Access Denied Page (403)
// =============================================================
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Access Denied
      </h2>
      <p className="text-gray-600 mb-6">
        You don’t have permission to access this page.
      </p>
      <a
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Home
      </a>
    </div>
  );
}

// =============================================================
// 🌍 App Root Content
// =============================================================
function AppContent() {
  const navigate = useNavigate();

  // ✅ Auto logout if token expired
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        clearAuth();
        toast.info("Session expired. Please log in again.");
        navigate("/");
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* === Global Loading Overlay === */}
      <LoadingOverlay />

      {/* === Navbar always visible === */}
      <NavBar />

      {/* === Routing === */}
      <Routes>
        {/* ===== Public Pages ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/register/owner" element={<RegisterOwner />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />

        {/* ===== Protected: Reporter ===== */}
        <Route
          path="/reporter/dashboard"
          element={
            <PrivateRoute allowedRoles={["reporter"]}>
              <ReporterDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/reporter/report"
          element={
            <PrivateRoute allowedRoles={["reporter"]}>
              <Report />
            </PrivateRoute>
          }
        />

        {/* ===== Protected: Police ===== */}
        <Route
          path="/police/dashboard"
          element={
            <PrivateRoute allowedRoles={["police"]}>
              <PoliceDashboard />
            </PrivateRoute>
          }
        />

        {/* ===== Protected: Admin ===== */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ===== 403 Page ===== */}
        <Route path="/403" element={<AccessDenied />} />

        {/* ===== Catch-All ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ===== Global Assistant ===== */}
      <PasearchAssistant />

      {/* ===== Footer ===== */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-200 mt-6">
        © 2025 <span className="font-semibold text-blue-600">PASEARCH</span> — All rights reserved.
      </footer>
    </div>
  );
}

// =============================================================
// 🚀 Export Default App (Used in main.jsx)
// =============================================================
export default function App() {
  return <AppContent />;
}
