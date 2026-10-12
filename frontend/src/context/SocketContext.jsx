import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection
    // In Vite dev, this connects to the proxy or directly.
    // We use the same host as the API.
    const newSocket = io("/", {
      path: "/socket.io", // default path
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      // Register the user with the backend
      newSocket.emit("register", user.id || user._id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]); // Re-run when user changes (e.g. login/logout)

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
