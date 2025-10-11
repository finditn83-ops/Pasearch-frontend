import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProtectedRoute({ allowedRoles }) {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth || !auth.token) {
    toast.error("Session expired. Please log in again.");
    return <Navigate to="/" replace />;
  }

  // If specific roles are required, enforce them
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    toast.error("Unauthorized access.");
    return <Navigate to="/" replace />;
  }

  // ✅ Allow access if authenticated (and role matches)
  return <Outlet />;
}
