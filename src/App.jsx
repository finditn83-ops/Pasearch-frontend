import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
// === Utils ===
import { isTokenExpired, clearAuth } from "./utils/auth";
// === Context ===
import { ConnectionProvider } from "./context/ConnectionContext";
// === Components ===
import NavBar from "./components/NavBar";
import LoadingOverlay from "./components/LoadingOverlay";
import PasearchAssistant from "./components/PasearchAssistant";
import ToastContainerConfig from "./components/ToastContainerConfig";
import OfflineBanner from "./components/OfflineBanner";
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
import MyReports from "./pages/MyReports";

// =============================================================
// 🛡️ Private Route Wrapper (Role-Based)
// =============================================================
function PrivateRoute({ children, allowedRoles = [] }) {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth?.token) {
      toast.warning("Please log in to continue.");
      return <Navigate to="/" replace />;
    }

    const userRole = auth.role || auth.user?.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      toast.error("Access denied: insufficient permissions.");
      return <Navigate to="/403" replace />;
    }

    return children;
  } catch {
    toast.error("Authentication error. Please log in again.");
    return <Navigate to="/" replace />;
  }
}

// =============================================================
// 🚫 403 Access Denied Page
// =============================================================
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-6">You don’t have permission to access this page.</p>
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
// 🚫 404 Page Not Found
// =============================================================
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <p className="text-gray-600 mb-6">The page you requested could not be found.</p>
      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Go Home
      </a>
    </div>
  );
}

// =============================================================
// 🌀 Scroll to Top on Route Change
// =============================================================
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// =============================================================
// 🌍 Main App Content
// =============================================================
function AppContent() {
  const navigate = useNavigate();

  // ✅ Auto logout when token expires
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        clearAuth();
        toast.info("Session expired. Please log in again.");
        navigate("/");
      }
    }, 180000); // every 3 minutes
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* === Global Loading Overlay === */}
      <LoadingOverlay />

      {/* === Navbar always visible === */}
      <NavBar />

      {/* === Global Offline Banner (shows if backend offline) === */}
      <OfflineBanner />

      {/* === Scroll Reset === */}
      <ScrollToTop />

      {/* === Main Routes === */}
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
        <Route
          path="/reporter/my-reports"
          element={
            <PrivateRoute allowedRoles={["reporter"]}>
              <MyReports />
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

        {/* ===== Access Denied & 404 ===== */}
        <Route path="/403" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ===== Global AI Assistant ===== */}
      <PasearchAssistant />

      {/* ===== Global Toasts ===== */}
      <ToastContainerConfig />

      {/* ===== Footer ===== */}
      <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-200 mt-6">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-blue-600">PASEARCH</span> — All rights reserved.
      </footer>
    </div>
  );
}

// =============================================================
// 🚀 Export Default App (Wrapped with ConnectionProvider)
// =============================================================
export default function App() {
  return (
    <ConnectionProvider>
      <AppContent />
    </ConnectionProvider>
  );
}
