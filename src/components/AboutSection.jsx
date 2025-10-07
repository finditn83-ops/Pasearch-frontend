// src/components/AboutSection.jsx
export default function AboutSection() {
  return (
    <section
      className="relative bg-gray-50 py-12 px-6 overflow-hidden"
      style={{
        backgroundImage: "url('/looking.jpeg')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        opacity: 0.98,
      }}
    >
      {/* Semi-transparent overlay to keep text readable */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">
          About
        </h2>

        <p className="text-gray-700 leading-relaxed text-lg mb-6">
          <strong>Device Tracker</strong> is a community-driven security platform
          dedicated to helping individuals recover lost or stolen phones,
          laptops and smart TVs. By collaborating with local authorities,
          telecom providers and community members, Device Tracker enables a
          faster, more transparent and effective recovery process — empowering
          users to protect what matters most.
        </p>

        <div className="mt-8">
          <a
            href="/register/owner"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
