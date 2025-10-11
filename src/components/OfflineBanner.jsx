import { useEffect, useState } from "react";
import { useConnection } from "../context/ConnectionContext";

/**
 * Shows a red banner when offline,
 * and a blue "Reconnected" banner when the backend comes back online.
 */
export default function OfflineBanner() {
  const { isOnline, checking } = useConnection();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // ✅ Detect transition from offline → online
  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000); // hide after 3s
    }
    setWasOffline(!isOnline);
  }, [isOnline]);

  // 🟥 Show red banner when offline
  if (!isOnline) {
    return (
      <div className="offline-banner animate-fade-in" role="alert">
        ⚠️ Offline Mode — Unable to reach backend server.
        <small>{checking ? "Rechecking..." : "Auto retrying every minute"}</small>
      </div>
    );
  }

  // 🟦 Show blue banner briefly when reconnected
  if (showReconnected) {
    return (
      <div className="online-banner animate-fade-in" role="alert">
        ✅ Reconnected — Backend is online again.
      </div>
    );
  }

  return null;
}
