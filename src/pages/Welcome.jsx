// ==============================
// 🌐 Welcome Page — Pasearch (with Typewriter Effect)
// ==============================
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Welcome() {
  const text = "Welcome to Pasearch";
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const speed = isDeleting ? 80 : 150; // typing speed
    const timer = setTimeout(() => {
      if (!isDeleting && index < text.length) {
        // typing forward
        setDisplayed(text.slice(0, index + 1));
        setIndex(index + 1);
      } else if (isDeleting && index > 0) {
        // deleting backward
        setDisplayed(text.slice(0, index - 1));
        setIndex(index - 1);
      } else if (!isDeleting && index === text.length) {
        // pause then start deleting
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && index === 0) {
        // pause then start typing again
        setIsDeleting(false);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [index, isDeleting]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white px-4 select-none">
      <h1 className="text-4xl font-bold mb-6 text-center h-16">
        <span className="text-yellow-300">{displayed}</span>
        <span className="border-r-2 border-yellow-300 animate-pulse ml-1"></span>
      </h1>

      <p className="max-w-md text-lg mb-6 text-center">
        Protect your devices. Report, track, and recover lost or stolen phones,
        laptops, and more — all in one secure platform.
      </p>

      <Link
        to="/login"
        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-100 transition-all duration-200"
      >
        Get Started →
      </Link>

      <div className="mt-6 text-sm opacity-80 text-center">
        Built with ❤️ by <strong>Finditn</strong>
      </div>
    </div>
  );
}
