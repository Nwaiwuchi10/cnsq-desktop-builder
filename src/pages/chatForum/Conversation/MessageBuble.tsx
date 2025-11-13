import React, { ReactNode } from "react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, me, time }) => {
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div
        className={`p-4 max-w-[70%] shadow-sm break-words ${
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
  );
};

export default MessageBubble;
