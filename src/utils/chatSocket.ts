// src/utils/chatSocket.ts
import io from "socket.io-client";
let socket: any = null;
// let socket: Socket | null = null;

export function initChatSocket(userId?: number) {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem("user-token");

  socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat` || "", {
    query: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect_error", (err: any) => {
    console.error("Socket connect_error", err);
  });

  return socket;
}

export function getChatSocket() {
  return socket;
}
