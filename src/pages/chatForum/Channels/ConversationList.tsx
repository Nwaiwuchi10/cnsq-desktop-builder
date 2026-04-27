// ChannelConversationList.tsx
"use client";
import React from "react";
import ChannelConversationItem from "./ConversationItemshannel";
import { Msg } from "../Conversation/ConversationItems";

const ChannelConversationList: React.FC<{
  items?: Msg[];
  onSelect: (id: string) => void;
}> = ({ items = [], onSelect }) => {
  if (items.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">No channels yet.</div>
    );
  }

  return (
    <div className="space-y-3 text-gray-600 dark:text-gray-400">
      {items.map((c) => (
        <ChannelConversationItem
          key={c.id}
          item={c}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
};

export default ChannelConversationList;
