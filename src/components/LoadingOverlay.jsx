import { useLoading } from "../context/LoadingContext";

export default function LoadingOverlay() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      {/* Spinning Circle */}
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>

      {/* Optional Text */}
      <p className="text-white text-lg font-medium tracking-wide">
        Please wait...
      </p>
    </div>
  );
}
