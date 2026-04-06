import React, { ReactNode } from "react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean; // NEW
  onClick?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  onClick,
}) => {
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"} `}>
      <div
        onClick={onClick}
        className={`p-4 max-w-[70%] shadow-sm break-words relative cursor-pointer
      ${selected ? "ring-2 ring-green-500 cursor-pointer" : ""}
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
  );
};

export default MessageBubble;
