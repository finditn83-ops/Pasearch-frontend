import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";

function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "reporter",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);
      const token = res.data.token;

      // decode token payload
      const payload = JSON.parse(atob(token.split(".")[1] || ""));

      login({ token, user: payload });

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-white mb-1">
          Create a PASEARCH Account
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Register as a reporter, police officer, or admin.
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
              name="username"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
              value={form.username}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Phone</label>
            <input
              name="phone"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Role</label>
            <select
              name="role"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
              value={form.role}
              onChange={onChange}
            >
              <option value="reporter">Reporter</option>
              <option value="police">Police</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100"
              value={form.password}
              onChange={onChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
