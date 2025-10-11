import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// ✅ Toastify for notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Global loading context
import { LoadingProvider } from "./context/LoadingContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Router context must wrap the entire app */}
    <BrowserRouter>
      <LoadingProvider>
        <App />
        {/* Global toasts available on every page */}
        <ToastContainer position="top-center" autoClose={3000} />
      </LoadingProvider>
    </BrowserRouter>
  </StrictMode>
);
