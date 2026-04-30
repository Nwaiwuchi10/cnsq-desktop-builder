"use client";
import { useChatStore } from "@/store/ChatStore";
import { useEffect } from "react";
import { initChatSocket } from "@/utils/chatSocket";
export default function AppEvents() {
  const updateMembers = useChatStore((s) => s.updateMembers);
  const setOnlineStaff = useChatStore((s) => s.setOnlineStaff);

  useEffect(() => {
    // const socket = getChatSocket();
    const socket = initChatSocket();
    if (!socket) return;

    socket.on("conversation:membersAdded", (payload: any) => {
      updateMembers(payload.conversationId, payload.members);
    });

    socket.on("staff:online", (payload: any) => {
      if (payload.userId) setOnlineStaff(payload.userId, true);
    });

    socket.on("staff:offline", (payload: any) => {
      if (payload.userId) setOnlineStaff(payload.userId, false);
    });

    return () => {
      socket.off("conversation:membersAdded");
      socket.off("staff:online");
      socket.off("staff:offline");
    };
  }, []);

  return null;
}
