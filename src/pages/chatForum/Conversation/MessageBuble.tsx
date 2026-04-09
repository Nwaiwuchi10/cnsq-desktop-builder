import React, { ReactNode } from "react";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean;
  onClick?: () => void;
  delivered?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  onClick,
  delivered = true,
}) => {
  return (
    <div
      className={`flex ${me ? "justify-end" : "justify-start"} flex-col ${me ? "items-end" : "items-start"}`}
    >
      <div
        onClick={onClick}
        className={`p-3 max-w-[70%] shadow-sm break-words relative cursor-pointer rounded-lg transition-all
      ${selected ? "ring-2 ring-green-500" : "hover:shadow-md"}
      ${
        me
          ? "bg-green-500 text-white rounded-br-none"
          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
      }`}
      >
        <div className="text-sm leading-relaxed">{text}</div>
      </div>

      <div
        className={`flex gap-2 items-center mt-1 ${me ? "flex-row-reverse" : "flex-row"}`}
      >
        {time && (
          <div
            className={`text-xs whitespace-nowrap ${
              me ? "text-gray-500" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {time}
          </div>
        )}
        {me && delivered && <CheckCheck size={14} className="text-gray-500" />}
      </div>
    </div>
  );
};

export default MessageBubble;
