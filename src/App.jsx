// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
// === Components ===
import PasearchAssistant from "./components/PasearchAssistant";

// === Protected Route Wrapper ===
function PrivateRoute({ children, allowedRole }) {
  const auth = JSON.parse(localStorage.getItem("auth"));
  if (!auth?.token) return <Navigate to="/" replace />;
  if (allowedRole && auth.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

// === App Root ===
export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Router>
        <Routes>
          {/* ===== Public Pages ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/register/owner" element={<RegisterOwner />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/success" element={<Success />} />
          {/* ===== Reporter Routes ===== */}
          <Route
            path="/reporter/dashboard"
            element={
              <PrivateRoute allowedRole="reporter">
                <ReporterDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/reporter/report"
            element={
              <PrivateRoute allowedRole="reporter">
                <Report />
              </PrivateRoute>
            }
          />

          {/* ===== Police Route ===== */}
          <Route
            path="/police/dashboard"
            element={
              <PrivateRoute allowedRole="police">
                <PoliceDashboard />
              </PrivateRoute>
            }
          />

          {/* ===== Admin Route ===== */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ===== Catch-All (Redirect) ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* ===== AI Assistant ===== */}
        <PasearchAssistant />

        {/* ===== Footer ===== */}
        <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-200 mt-6">
          © 2025 <span className="font-semibold text-blue-600">PASEARCH</span> — All rights reserved.
        </footer>
      </Router>
    </div>
  );
}
