// ==============================
// ⚙️ App Routing — Pasearch Frontend (Full Final Version)
// ==============================
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ✅ Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Report from "./pages/Report";
import AdminDashboard from "./pages/AdminDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import DeviceLookup from "./pages/DeviceLookup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ✅ Layout
import DashboardLayout from "./layouts/DashboardLayout";

// ✅ Auth Helpers
import { isLoggedIn, getCurrentUser } from "./api";

// ==============================
// 🔐 Private Route Wrapper
// ==============================
function PrivateRoute({ children, roles }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const user = getCurrentUser();
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

// ==============================
// 🚀 App Component
// ==============================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/owner" element={<Register />} />
        <Route path="/report" element={<Report />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔍 Device Lookup (Reporter/Admin/Police) */}
        <Route
          path="/device/lookup"
          element={
            <PrivateRoute roles={["reporter", "admin", "police"]}>
              <DashboardLayout>
                <DeviceLookup />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* 🧑‍💼 Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={["admin"]}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* 👮 Police Dashboard */}
        <Route
          path="/police/dashboard"
          element={
            <PrivateRoute roles={["police", "admin"]}>
              <DashboardLayout>
                <PoliceDashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* 🚫 Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
