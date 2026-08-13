import React, { ReactNode, useState } from "react";
import parseMentions from "@/utils/ParseMention";
import TruncatedText from "../components/TruncatedText";
import EmojiPicker from "emoji-picker-react";
import MediaGrid from "@/component/MediaGrid";

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
  threadUnreadCount?: number;
  lastThreadReplyTime?: string;
  threadParticipants?: Array<{ id?: number; photoUrl?: string | null; firstName?: string; name?: string }>;
  attachments?: any[];
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
  threadUnreadCount,
  lastThreadReplyTime,
  threadParticipants,
  currentUserId,
  onClick,
  onReact,
  onViewThread,
  onTogglePin,
  onViewReactors,
  attachments,
}) => {
  const [showLocalPicker, setShowLocalPicker] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Parse custom date stamp format or use time as-is
  const formattedTime = (() => {
    try {
      if (!time) return "";
      // If it's already a clean format like "09:20 AM", return it
      if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(time)) {
        return time;
      }
      const date = new Date(time);
      if (isNaN(date.getTime())) return time;
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return time;
    }
  })();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex items-start gap-3 w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer ${
        selected ? "bg-green-50 dark:bg-green-950/20" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 mt-0.5">
        {avatar ? (
          <img
            src={avatar}
            alt={authorName || "User"}
            className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100 dark:border-gray-800"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
            {authorName?.charAt(0) || "U"}
          </div>
        )}
        {online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full shadow-sm" />
        )}
      </div>

      {/* Message Content Container */}
      <div className="flex flex-col flex-grow min-w-0">
        {/* Name and Timestamp (Pumble style: inline, name bold, timestamp muted next to it) */}
        <div className="flex items-baseline gap-2 mb-1">
          {authorName && (
            <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100 hover:underline">
              {authorName}
            </span>
          )}
          {formattedTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formattedTime}
            </span>
          )}
          {pinned && (
            <span className="text-[10px] text-blue-500 flex items-center gap-0.5 font-medium ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z" />
              </svg>
              Pinned
            </span>
          )}
        </div>

        {/* Message Text / Attachments */}
        <div className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap">
          {text && (
            <div className="mt-0.5">
              <TruncatedText text={text} maxLength={300} isMe={me} />
            </div>
          )}

          {/* Attachments Section */}
          {attachments && attachments.length > 0 && (() => {
            const mediaItems = attachments.filter((a: any) => {
              const ext = a.filename?.split(".").pop()?.toLowerCase();
              return (
                a.mimeType?.startsWith("video/") ||
                (ext && ["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) ||
                (ext && ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) ||
                a.mimeType?.startsWith("image/")
              );
            });
            const otherItems = attachments.filter((a: any) => !mediaItems.includes(a));
            return (
              <div className="flex flex-col gap-1.5 mb-2 mt-1.5" onClick={(e) => e.stopPropagation()}>
                {mediaItems.length > 0 && (
                  <MediaGrid media={mediaItems} maxWidth={320} />
                )}
                {otherItems.map((a: any) => {
                  if (a.mimeType?.startsWith("audio/")) {
                    return (
                      <div key={a.id} className="mt-1">
                        <audio controls className="w-64 h-8">
                          <source src={a.url} type={a.mimeType} />
                        </audio>
                      </div>
                    );
                  }
                  return (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-xs mt-1 block text-blue-500 hover:text-blue-600 font-medium"
                    >
                      {a.filename || "Attachment"}
                    </a>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Reactions Section */}
        {reactions && Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2 justify-start">
            {Object.entries(reactions).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact?.(emoji);
                }}
                title="Click to toggle reaction. Click the list icon next to it to see who reacted."
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all duration-200 border
                  ${
                    data.me
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
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className="text-[10px] font-medium">Reactors</span>
            </button>
          </div>
        )}

        {/* Thread Summary Bar (Pumble Style: inline link with reply count/last active text) */}
        {threadRepliesCount !== undefined && threadRepliesCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewThread?.();
            }}
            className="flex items-center gap-2 mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline group/thread w-fit"
          >
            {/* Participant Avatars */}
            {threadParticipants && threadParticipants.length > 0 ? (
              <div className="flex -space-x-1.5 overflow-hidden mr-1">
                {threadParticipants.slice(0, 3).map((p, idx) =>
                  p.photoUrl ? (
                    <img
                      key={idx}
                      src={p.photoUrl}
                      alt={p.firstName || "User"}
                      className="w-5 h-5 rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-sm"
                    />
                  ) : (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm"
                    >
                      {(p.firstName || p.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex -space-x-1.5 mr-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                  {authorName ? authorName.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
            )}

            {/* Unread count badge */}
            {threadUnreadCount !== undefined && threadUnreadCount > 0 && (
              <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-md">
                {threadUnreadCount} unread
              </span>
            )}

            {/* Total replies */}
            <span className="font-semibold">
              {threadRepliesCount} {threadRepliesCount === 1 ? "reply" : "replies"}
            </span>

            {/* Last reply timestamp */}
            {lastThreadReplyTime && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1 font-normal">
                Last reply {lastThreadReplyTime}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Hover Toolbar (Top Left) */}
      {hovered && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-3.5 left-4 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-0.5 z-20"
        >
          {["👍", "❤️", "😂", "🔥"].map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReact?.(emoji);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm active:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLocalPicker((prev) => !prev);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-bold text-gray-500 dark:text-gray-400"
            title="React with any emoji"
          >
            ➕
          </button>
          {onViewThread && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewThread();
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs font-semibold text-gray-600 dark:text-gray-300"
              title="Reply in thread"
            >
              💬
            </button>
          )}
        </div>
      )}

      {showLocalPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setShowLocalPicker(false);
          }}
        >
          <div
            className="shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 max-w-sm w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 mb-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">React with Emoji</span>
              <button
                onClick={() => setShowLocalPicker(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                onReact?.(emojiData.emoji);
                setShowLocalPicker(false);
              }}
              width="100%"
              height={320}
              skinTonesDisabled
              searchDisabled
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelMessageBubble;
