// ==============================
// 🌐 Welcome Page — Pasearch
// ==============================
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-400 text-white text-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        👋 Welcome to <span className="text-yellow-300">Pasearch</span>
      </h1>
      <p className="max-w-md text-lg mb-6">
        Protect your devices. Report, track, and recover lost or stolen phones,
        laptops, and more — all in one secure platform.
      </p>
      <Link
        to="/login"
        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
      >
        Get Started →
      </Link>
      <div className="mt-6 text-sm opacity-80">
        Built with ❤️ by <strong>Finditn (Benny)</strong>
      </div>
    </div>
  );
}
