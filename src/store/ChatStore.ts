import { Conversation, Member, Staff } from "@/dataTypes/Data-Types";
import { create } from "zustand";

type ChatState = {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  staffSearchResults: Staff[];

  setActiveConversation: (c: Conversation | null) => void;
  addConversation: (c: Conversation) => void;
  updateMembers: (conversationId: string, members: Member[]) => void;
  setStaffSearchResults: (results: Staff[]) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  staffSearchResults: [],

  setActiveConversation: (c) => set({ activeConversation: c }),
  addConversation: (c) =>
    set((state) => ({ conversations: [...state.conversations, c] })),

  updateMembers: (conversationId, members) =>
    set((state: any) => ({
      conversations: state.conversations.map((conv: any) =>
        conv.id === conversationId
          ? { ...conv, members: [...conv.members, ...members] }
          : conv
      ),
    })),

  setStaffSearchResults: (results) => set({ staffSearchResults: results }),
}));
