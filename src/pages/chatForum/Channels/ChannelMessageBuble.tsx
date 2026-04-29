import React, { ReactNode } from "react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean;
  authorName?: string;
  avatar?: string | null;
  online?: boolean;
  onClick?: () => void;
}

const ChannelMessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  authorName,
  avatar,
  online,
  onClick,
}) => {
  return (
    <div
      className={`flex items-start ${
        me ? "justify-end gap-0.5" : "justify-start gap-1"
      }`}
    >
      {/* Avatar FIRST always */}
      <div className="relative">
        {avatar && (
          <img
            src={avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        {online !== undefined && (
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white dark:border-[#1a1a1a] ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
        )}
      </div>

      {/* Message + Author */}
      <div
        className={`flex flex-col ${me ? "items-start gap-2 " : "items-start"}`}
      >
        {authorName && (
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {authorName}
          </div>
        )}

        <div
          onClick={onClick}
          className={`p-4 max-w-[100%] shadow-sm break-words relative cursor-pointer
            ${selected ? "ring-2 ring-green-500" : ""}
            ${
              me
                ? "bg-[#10b981] text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl"
                : "bg-[#E6EEF7] dark:bg-gray-800 transition-colors text-gray-800 dark:text-gray-200 rounded-br-xl rounded-tr-xl rounded-tl-xl"
            }`}
        >
          <div className="text-sm leading-relaxed">{text}</div>

          {time && (
            <div
              className={`text-xs mt-2 ${
                me ? "text-green-50/80" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelMessageBubble;
