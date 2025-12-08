"use client";
import React from "react";
import { Msg } from "../Conversation/ConversationItems";

const ChannelConversationItem: React.FC<{
  item?: Msg;
  onClick: () => void;
}> = ({ item, onClick }) => {
  if (!item) return null;

  const name = item.name || "Unknown Channel";
  const preview = item.preview || "";
  const time = item.time || "";

  return (
    <div
      onClick={onClick}
      className="bg-white text-gray-600 rounded-xl mb-4 p-3 flex gap-4 items-start shadow-md cursor-pointer border border-transparent hover:border-lime-500 transition-shadow transition-colors"
    >
      {/* <Avatar name={name} src={item.avatar} /> */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="font-semibold text-gray-800">{name}</div>
          <div className="text-xs text-gray-400">{time}</div>
        </div>
        <div className="text-sm text-gray-500 mt-1 truncate">{preview}</div>
      </div>

      {item.unread ? (
        <div className="flex items-center">
          <div className="text-xs bg-orange-400 text-white rounded-full px-2 py-0.5">
            {item.unread}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChannelConversationItem;
