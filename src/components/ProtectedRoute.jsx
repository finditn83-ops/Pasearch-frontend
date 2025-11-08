// =============================================
// 🔐 ProtectedRoute.jsx — Role-based Route Guard
// =============================================
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProtectedRoute({ allowedRoles }) {
  try {
    // 🧩 Load auth info from localStorage
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    const user = auth?.user;
    const token = auth?.token;
    const userRole = user?.role;

    // 1️⃣ Not logged in or token missing
    if (!auth || !token) {
      toast.error("Session expired. Please log in again.");
      return <Navigate to="/login" replace />;
    }

    // 2️⃣ Role not allowed
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      toast.error("Unauthorized access.");
      return <Navigate to="/unauthorized" replace />;
    }

    // 3️⃣ Authenticated + Role allowed → show nested route
    return <Outlet />;
  } catch (error) {
    console.error("❌ ProtectedRoute error:", error);
    toast.error("Authentication error. Please log in again.");
    return <Navigate to="/login" replace />;
  }
}
