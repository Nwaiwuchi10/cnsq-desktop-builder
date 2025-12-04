"use client";
import { useChatStore } from "@/store/ChatStore";
import { useEffect } from "react";
import { initChatSocket } from "@/utils/chatSocket";
export default function AppEvents() {
  const updateMembers = useChatStore((s) => s.updateMembers);

  useEffect(() => {
    // const socket = getChatSocket();
    const socket = initChatSocket();
    if (!socket) return;

    socket.on("conversation:membersAdded", (payload: any) => {
      updateMembers(payload.conversationId, payload.members);
    });

    return () => {
      socket.off("conversation:membersAdded");
    };
  }, []);

  return null;
}
