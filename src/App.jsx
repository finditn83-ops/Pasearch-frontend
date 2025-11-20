import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Context
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ReporterDashboard from "./pages/ReporterDashboard.jsx";
import PoliceDashboard from "./pages/PoliceDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import LiveMap from "./pages/LiveMap.jsx"; // ⭐ NEW – live tracking map

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >

            {/* Default — Reporter Dashboard */}
            <Route index element={<ReporterDashboard />} />

            {/* Reporter */}
            <Route path="reporter" element={<ReporterDashboard />} />

            {/* Police */}
            <Route path="police" element={<PoliceDashboard />} />

            {/* 🔴 NEW: Live GPS Map */}
            <Route path="map" element={<LiveMap />} />

            {/* Admin */}
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
