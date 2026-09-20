"use client";
import React from "react";
import Avatar from "./Avatar";
import { ReactionsState } from "../Channels/ChannelMessageBuble";

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
  text: string; 
  me: boolean; 
  preview: string;
  createdAt: string;
  time: string;
  unread?: number;
  online?: boolean;
  peerId?: number;
  attachments?: Attachment[];
  reactions?: ReactionsState;
  parent?: Partial<Msg>;
  isChannel?: boolean;
  isLocked?: boolean;
  activeThreadParentId?: string | null;
};

const ConversationItem: React.FC<{ item?: Msg; onClick: () => void }> = ({
  item,
  onClick,
}) => {
  if (!item) {
    return null;
  }

  const name = item.name || "Unknown User";
  const preview = item.preview || "";
  const time = item.time || "";

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#141414] rounded-2xl p-4 flex gap-3 items-center shadow-sm cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-lime-500 transition-colors mb-3"
    >
      <div className="flex-shrink-0">
        <Avatar name={name} online={item.online} src={item.avatar} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="font-bold text-gray-900 dark:text-gray-100 text-[15px] truncate">
            {name}
          </div>
          <div className="text-[11px] text-gray-400 font-medium">
            {time}
          </div>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="text-[13px] text-gray-500 dark:text-gray-400 truncate pr-2">
            {preview || " "}
          </div>
          {item.unread ? (
            <div className="flex-shrink-0 bg-[#F58220] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {item.unread}
            </div>
          ) : (
            <div className="w-5 h-5 flex-shrink-0"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
