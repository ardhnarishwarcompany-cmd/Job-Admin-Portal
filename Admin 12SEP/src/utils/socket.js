import { io } from "socket.io-client";

const SOCKET_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`;

let socket = null;

// Reuses a single connection across the whole app — call this wherever the chat UI mounts.
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
