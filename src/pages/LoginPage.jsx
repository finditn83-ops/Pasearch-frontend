import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { username, password });
      const token = res.data.token;

      // decode token payload
      const payload = JSON.parse(atob(token.split(".")[1] || ""));

      login({ token, user: payload });

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Invalid login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-white mb-1">
          Welcome to Pasearch
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Secure portal for everyone.
        </p>

        {error && (
          <div className="mb-3 text-xs text-red-200 bg-red-950/50 border border-red-500/40 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Username
            </label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-4">
          No account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
