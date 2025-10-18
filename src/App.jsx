import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Report from "./pages/Report";
import AdminDashboard from "./pages/AdminDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import DeviceLookup from "./pages/DeviceLookup";
import DashboardLayout from "./layouts/DashboardLayout";
import { isLoggedIn, getCurrentUser } from "./api";

function PrivateRoute({ children, roles }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Default: redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/report" element={<Report />} />

      {/* Reporter/Owner */}
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

      {/* Admin */}
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

      {/* Police */}
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
