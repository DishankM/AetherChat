import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();

  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  // 🔌 Initialize socket ONLY ONCE after login
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (socketRef.current) return; // 🚫 prevent duplicates

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("⚠️ Socket error:", err.message);
    });

    newSocket.on("user_status", ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        isOnline ? updated.set(userId, true) : updated.delete(userId);
        return updated;
      });
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, token]);

  // =====================
  // Socket action helpers
  // =====================

  const joinConversation = useCallback(
    (conversationId) => {
      socket?.emit("join_conversation", conversationId);
    },
    [socket]
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      socket?.emit("leave_conversation", conversationId);
    },
    [socket]
  );

  const sendMessage = useCallback(
    (data) => {
      if (socket && connected) socket.emit("send_message", data);
    },
    [socket, connected]
  );

  const askAI = useCallback(
    (data) => {
      if (socket && connected) socket.emit("ask_ai", data);
    },
    [socket, connected]
  );

  const startTyping = useCallback(
    (conversationId) => {
      socket?.emit("typing_start", { conversationId });
    },
    [socket]
  );

  const stopTyping = useCallback(
    (conversationId) => {
      socket?.emit("typing_stop", { conversationId });
    },
    [socket]
  );

  const markAsRead = useCallback(
    (conversationId) => {
      socket?.emit("mark_read", { conversationId });
    },
    [socket]
  );

  const isUserOnline = useCallback(
    (userId) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinConversation,
        leaveConversation,
        sendMessage,
        askAI,
        startTyping,
        stopTyping,
        markAsRead,
        isUserOnline
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
}
