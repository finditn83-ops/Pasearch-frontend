import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ Toastify for notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Global loading context
import { LoadingProvider } from "./context/LoadingContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap app in LoadingProvider so all components can use useLoading() */}
    <LoadingProvider>
      <App />
      {/* Global Toasts */}
      <ToastContainer position="top-center" autoClose={3000} />
    </LoadingProvider>
  </StrictMode>
);
