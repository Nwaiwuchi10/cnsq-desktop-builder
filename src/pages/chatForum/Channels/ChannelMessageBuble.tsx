import React, { ReactNode } from "react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean;
  authorName?: string;
  avatar?: string | null;
  onClick?: () => void;
}

const ChannelMessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  authorName,
  avatar,
  onClick,
}) => {
  return (
    <div
      className={`flex items-start ${
        me ? "justify-end gap-0.5" : "justify-start gap-1"
      }`}
    >
      {/* Avatar FIRST always */}
      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      {/* Message + Author */}
      <div
        className={`flex flex-col ${me ? "items-start gap-2 " : "items-start"}`}
      >
        {authorName && (
          <div className="text-xs font-semibold text-gray-600 mb-1">
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
                : "bg-[#E6EEF7] text-gray-800 rounded-br-xl rounded-tr-xl rounded-tl-xl"
            }`}
        >
          <div className="text-sm leading-relaxed">{text}</div>

          {time && (
            <div
              className={`text-xs mt-2 ${
                me ? "text-green-50/80" : "text-gray-500"
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
