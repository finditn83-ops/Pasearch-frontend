import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { register } from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reporter");
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required.");
      return;
    }

    try {
      setLoading(true);
      await register(username, email, password, role);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please check your info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-8"
    >
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        Create Account
      </h2>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username *
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Create  username"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="username"
        />
      </div>

    {/* Email */}
<div>
  <label
    htmlFor="email"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Email *
  </label>
  <input
    id="email"
    type="email"
    placeholder="Enter your email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    autoComplete="email"
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
</div>

{/* Phone */}
<div>
  <label
    htmlFor="phone"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Phone Number *
  </label>
  <input
    id="phone"
    type="tel"
    placeholder="Enter your phone number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    required
    autoComplete="tel"
    pattern="^[0-9+\s-]{7,15}$"
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
</div>

      {/* Password */}
      <div className="mt-3">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Create a password"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="new-password"
        />
      </div>

      {/* Role */}
      <div className="mt-3">
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Creating Account..." : "Register"}
      </button>

      {/* Back to Login */}
      <div className="text-center mt-4">
        <Link
          to="/"
          className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </form>
  );
}
