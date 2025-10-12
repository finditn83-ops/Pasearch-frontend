import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProtectedRoute({ allowedRoles }) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  // ⛔ No auth or missing token
  if (!auth || !auth.token) {
    toast.error("Session expired. Please log in again.");
    return <Navigate to="/login" replace />;
  }

  // ✅ Extract role safely
  const userRole = auth.user?.role;

  // 🔐 Role-based access control
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    toast.error("Unauthorized access.");
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authenticated + Role allowed → grant access
  return <Outlet />;
}
