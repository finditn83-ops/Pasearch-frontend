// ==============================
// 📝 Register Page — Pasearch
// ==============================
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { register } from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // ✅ Added missing state
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reporter");
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  // ✅ Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      await register(username, email, phone, password, role); // ✅ Include phone
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          ✨ Create Your Pasearch Account
        </h2>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Create a username"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoComplete="username"
          />
        </div>

        {/* Email */}
        <div className="mt-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
            autoComplete="email"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Phone */}
        <div className="mt-3">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Enter your phone number"
            autoComplete="tel"
            pattern="^[0-9+\\s-]{7,15}$"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mt-3">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password"
            autoComplete="new-password"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Role */}
        <div className="mt-3">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Select Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="reporter">Reporter</option>
            <option value="police">Police</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition-all duration-200"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
