import { useLoading } from "../context/LoadingContext";

export default function LoadingOverlay({ message = "Please wait..." }) {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
      
      {/* Message */}
      <p className="text-white text-lg font-medium tracking-wide drop-shadow">
        {message}
      </p>
    </div>
  );
}
