import React, { ReactNode } from "react";
import { CheckCheck } from "lucide-react";
import { ReactionsState } from "../Channels/ChannelMessageBuble";
import TruncatedText from "../components/TruncatedText";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean;
  pinned?: boolean;
  reactions?: ReactionsState;
  onClick?: () => void;
  onReact?: (emoji: string) => void;
  onTogglePin?: () => void;
  onViewReactors?: () => void;
  currentUserId?: number | null;
  delivered?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  pinned,
  reactions,
  onClick,
  onReact,
  onTogglePin,
  onViewReactors,
  currentUserId,
  delivered = true,
}) => {
  return (
    <div
      className={`flex group ${me ? "justify-end" : "justify-start"} flex-col ${me ? "items-end" : "items-start"}`}
    >
      {pinned && (
        <span className="text-[10px] text-blue-500 flex items-center gap-0.5 mb-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z"/></svg>
          Pinned
        </span>
      )}

      <div
        onClick={onClick}
        className={`p-3 max-w-[70%] shadow-sm break-words relative cursor-pointer rounded-lg transition-all group/content
      ${selected ? "ring-2 ring-green-500" : "hover:shadow-md"}
      ${
        me
          ? "bg-green-600 text-white rounded-br-none"
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
      }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          <TruncatedText text={text} maxLength={300} isMe={me} />
        </div>

        {/* Quick Actions Hover Menu */}
        <div className={`absolute -top-4 ${me ? 'left-0' : 'right-0'} hidden group-hover/content:flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-1 z-10 text-gray-800`}>
          <button 
            onClick={(e) => { e.stopPropagation(); onReact?.("👍"); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs"
          >
            👍
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onReact?.("❤️"); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs"
          >
            ❤️
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin?.(); }}
            className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded ${pinned ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
            title={pinned ? "Unpin" : "Pin"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m16 4-4 4-4-4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 12H9"/></svg>
          </button>
        </div>
      </div>

      {/* Reactions List */}
      {reactions && Object.keys(reactions).length > 0 && (
        <div className={`flex flex-wrap items-center gap-1 mt-1 ${me ? "justify-end" : "justify-start"}`}>
          {Object.entries(reactions).map(([emoji, group]) => (
            <button
              key={emoji}
              onClick={(e) => { e.stopPropagation(); onReact?.(emoji); }}
              title="Click to toggle reaction. Click the list icon next to it to see who reacted."
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors
                ${group.me 
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700" 
                  : "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300"}
              `}
            >
              <span>{emoji}</span>
              <span className="font-medium">{group.count}</span>
            </button>
          ))}

          {/* View reactors list icon button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewReactors?.();
            }}
            title="Who reacted? (View list)"
            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 text-xs flex items-center gap-0.5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="text-[10px] font-medium">Reactors</span>
          </button>
        </div>
      )}

      <div
        className={`flex gap-2 items-center mt-1 ${me ? "flex-row-reverse" : "flex-row"}`}
      >
        {time && (
          <div
            className={`text-[10px] whitespace-nowrap ${
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
