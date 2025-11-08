// ===========================================================
// 👤 LogoutButton.jsx — Shows current user info + logout action
// ===========================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function LogoutButton({ className = "" }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🧠 Load current user info from localStorage on mount
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      setUser(auth?.user || null);
    } catch {
      setUser(null);
    }
  }, []);

  // 🚪 Logout logic
  const handleLogout = () => {
    try {
      localStorage.removeItem("auth");
      sessionStorage.clear();

      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ Logout error:", error);
      toast.error("Something went wrong while logging out.");
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {user ? (
        <div className="text-sm text-white/90">
          <span className="font-semibold">{user.name}</span>{" "}
          <span className="text-xs text-gray-200">({user.role})</span>
        </div>
      ) : (
        <span className="text-sm text-gray-300">Guest</span>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-all"
      >
        Logout
      </button>
    </div>
  );
}
