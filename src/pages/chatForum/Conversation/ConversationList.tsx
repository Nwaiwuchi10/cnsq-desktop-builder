"use client";
import React from "react";
import ConversationItem, { Msg } from "./ConversationItems";

const ConversationList: React.FC<{
  items?: Msg[]; // make optional
  onSelect: (id: string) => void;
}> = ({ items = [], onSelect }) => {
  // Handle empty state


  if (items.length===0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-gray-600">
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <ConversationItem
            key={it.id}
            item={it}
            onClick={() => onSelect(it.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
