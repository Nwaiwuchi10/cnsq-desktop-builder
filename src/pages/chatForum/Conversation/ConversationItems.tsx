"use client";
import React from "react";
import Avatar from "./Avatar";

type Attachment = {
  id: string;
  url: string;
  filename?: string;
  mimeType?: string;
};

type Reaction = {
  id: string;
  emoji: string;
};

export type Msg = {
  id: string;

  name: string;
  avatar?: string;
  text: string; // REQUIRED
  me: boolean; // REQUIRED
  preview: string;
  createdAt: string;
  time: string;

  unread?: number;
  online?: boolean;
  peerId?: number;
  attachments?: Attachment[];
  reactions?: Reaction[];
  parent?: Partial<Msg>;
};

const ConversationItem: React.FC<{ item?: Msg; onClick: () => void }> = ({
  item,
  onClick,
}) => {
  if (!item) {
    // guard clause for SSR
    return null;
  }

  const name = item.name || "Unknown User";
  const preview = item.preview || "";
  const time = item.time || "";

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1a1a1a] transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg p-4 flex gap-3 items-center cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
    >
      <div className="flex-shrink-0">
        <Avatar name={name} online={item.online} src={item.avatar} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {name}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {time}
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate line-clamp-1">
          {preview}
        </div>
      </div>
      {item.unread ? (
        <div className="flex-shrink-0 flex items-center">
          <div className="text-xs font-semibold bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            {item.unread}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ConversationItem;
