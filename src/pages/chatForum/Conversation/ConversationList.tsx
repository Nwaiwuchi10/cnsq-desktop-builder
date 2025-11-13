"use client";
import React from "react";
import ConversationItem, { Msg } from "./ConversationItems";

const ConversationList: React.FC<{
  items: Msg[];
  onSelect: (id: string) => void;
}> = ({ items, onSelect }) => {
  return (
    <div className="space-y-3 text-gray-600">
      {/* Filter pills */}

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
