import io from "socket.io-client";

let socket: any = null;

export function initChatSocket(token: string) {
  if (socket) return socket;

  socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
    query: { token: localStorage.getItem("user-token") },
    transports: ["websocket"],
  });

  return socket;
}

export function getChatSocket() {
  return socket;
}
