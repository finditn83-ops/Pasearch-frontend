import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * ToastContainerConfig
 * 
 * Provides a global, consistent setup for all toast messages.
 * Include this once at the root of your app (e.g., in App.jsx).
 */
export default function ToastContainerConfig() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="colored" // Options: "light", "dark", "colored"
      toastClassName="rounded-md shadow-lg font-medium"
    />
  );
}
