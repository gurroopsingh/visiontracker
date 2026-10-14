import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  // Keep a ref to the current socket so the cleanup function always closes the
  // right instance even if state updates haven't flushed yet.
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // User logged out — disconnect and clear
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Use the same origin so this works in:
    //   - Vite dev: proxy rule in vite.config.js forwards /socket.io → backend:5000
    //   - Docker/Nginx: nginx.conf forwards /socket.io → backend:5000
    const newSocket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      // Always send the userId as a plain string so socket.js stores a
      // consistent Map key regardless of how the auth context serialised it.
      const uid = String(user.id || user._id);
      newSocket.emit("register", uid);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("[SocketContext] Connection error:", err.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user]); // Re-run when user changes (login / logout)

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
