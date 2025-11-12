import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import { register } from "../api";
export default function RegisterOwner() {
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  // ✅ Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!ownerName.trim() || !password.trim()) {
      toast.error("Full name and password are required.");
      return;
    }
    if (phone && !/^[0-9+\-\s()]{6,15}$/.test(phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);
      // ✅ Use correct variable name and existing register() API
      await register(ownerName, email, phone, password, "reporter");
      toast.success("Owner account created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Failed to register owner. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🖥️ UI
  // ==========================================================
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-md p-6 rounded-lg mt-8"
    >
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        Register Owner
      </h2>

      {/* Owner Name */}
      <div>
        <label
          htmlFor="ownerName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name *
        </label>
        <input
          id="ownerName"
          name="ownerName"
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          placeholder="Enter full name"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="name"
        />
      </div>

      {/* Email */}
      <div className="mt-3">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email (optional)"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          autoComplete="email"
        />
      </div>

{/* Phone */}
<div className="mt-3">
  <label
    htmlFor="phone"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Phone Number
  </label>
  <input
    id="phone"
    name="phone"
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="Enter phone number (optional)"
    pattern="^[0-9+\s-]{7,15}$"
    title="Phone number (7–15 digits, can include +, -, or spaces)"
    autoComplete="tel"
    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Registering..." : "Register Owner"}
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
