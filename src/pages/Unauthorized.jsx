import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
      <p className="mb-4 text-gray-700">
        You are not authorized to view this page.
      </p>
      <Link
        to="/"
        className="text-blue-600 hover:underline font-medium"
      >
        ← Return to Home
      </Link>
    </div>
  );
}
