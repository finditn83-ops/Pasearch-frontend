import { createContext, useContext, useEffect, useState } from "react";
import { pingBackend } from "../api";

const ConnectionContext = createContext();

export function ConnectionProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [checking, setChecking] = useState(false);

  // ✅ Check connection every 60 seconds
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setChecking(true);
        const res = await pingBackend();
        if (res?.ok || res?.message?.includes("healthy")) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline, checking }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext);
}
