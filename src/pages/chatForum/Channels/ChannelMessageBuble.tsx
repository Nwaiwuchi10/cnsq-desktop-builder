import React, { ReactNode } from "react";
import parseMentions from "@/utils/ParseMention";
import TruncatedText from "../components/TruncatedText";
// import parseLinks from "@/utils/ParseLink";

export type ReactionsState = {
  [emoji: string]: {
    count: number;
    me: boolean;
    users: number[];
  };
};

export interface MessageBubbleProps {
  text: string | ReactNode;
  me: boolean;
  time: string;
  selected?: boolean;
  authorName?: string;
  avatar?: string | null;
  online?: boolean;
  pinned?: boolean;
  reactions?: ReactionsState;
  threadRepliesCount?: number;
  currentUserId?: number | null;
  onClick?: () => void;
  onReact?: (emoji: string) => void;
  onViewThread?: () => void;
  onTogglePin?: () => void;
  onViewReactors?: () => void;
}

const ChannelMessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  authorName,
  avatar,
  online,
  pinned,
  reactions,
  threadRepliesCount,
  currentUserId,
  onClick,
  onReact,
  onViewThread,
  onTogglePin,
  onViewReactors,
}) => {
  return (
    <div className={`flex items-start gap-3 w-full group ${me ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="relative flex-shrink-0 mt-1">
        {avatar ? (
          <img
            src={avatar}
            alt={authorName || "User"}
            className="w-9 h-9 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-800"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {authorName?.charAt(0) || "U"}
          </div>
        )}
        {online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full shadow-sm" />
        )}
      </div>

      {/* Message + Author */}
      <div className={`flex flex-col max-w-[85%] ${me ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          {authorName && (
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {authorName}
            </div>
          )}
          {pinned && (
            <span className="text-[10px] text-blue-500 flex items-center gap-0.5 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z" /></svg>
              Pinned
            </span>
          )}
        </div>

        {/* The Text Bubble */}
        {text && (
          <div
            onClick={onClick}
            className={`p-3 shadow-sm break-words relative cursor-pointer group/content transition-all duration-200
              ${selected ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900" : ""}
              ${me
                ? "bg-green-600 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-br-xl rounded-tr-xl rounded-tl-xl"
              }`}
          >
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              <TruncatedText text={text} maxLength={300} isMe={me} />
            </div>

            {time && (
              <div
                className={`text-[10px] mt-1.5 text-right opacity-70 ${me ? "text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                {time}
              </div>
            )}

            {/* Quick Actions Hover Menu */}
            <div className={`absolute -top-10 ${me ? 'left-0' : 'right-0'} hidden group-hover/content:flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 z-20 backdrop-blur-sm bg-opacity-90`}>
              <button
                onClick={(e) => { e.stopPropagation(); onReact?.("👍"); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                title="Quick React 👍"
              >
                👍
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReact?.("❤️"); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                title="Quick React ❤️"
              >
                ❤️
              </button>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePin?.(); }}
                className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${pinned ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                title={pinned ? "Unpin" : "Pin"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8" /><path d="m16 4-4 4-4-4" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 12H9" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Reactions Section */}
        {reactions && Object.keys(reactions).length > 0 && (
          <div className={`flex flex-wrap items-center gap-1 mt-2 ${me ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactions).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact?.(emoji);
                }}
                title="Click to toggle reaction. Click the list icon next to it to see who reacted."
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all duration-200 border
                  ${data.me
                    ? "bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 scale-105 shadow-sm"
                    : "bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
              >
                <span>{emoji}</span>
                <span className="font-medium">{data.count}</span>
              </button>
            ))}

            {/* View reactors list icon button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewReactors?.();
              }}
              title="Who reacted? (View list)"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-xs flex items-center gap-0.5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              <span className="text-[10px] font-medium">Reactors</span>
            </button>
          </div>
        )}

        {/* Thread Replies Link */}
        {threadRepliesCount !== undefined && threadRepliesCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewThread?.();
            }}
            className="flex items-center gap-2 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline group/thread"
          >
            <div className="flex -space-x-1.5">
              {/* Small avatars placeholder */}
              <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 border border-white dark:border-gray-900 flex items-center justify-center text-[8px]">
                R
              </div>
            </div>
            <span>{threadRepliesCount} {threadRepliesCount === 1 ? 'reply' : 'replies'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover/thread:opacity-100 transition-opacity"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChannelMessageBubble;
