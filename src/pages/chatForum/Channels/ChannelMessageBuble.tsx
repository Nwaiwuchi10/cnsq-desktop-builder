import React, { ReactNode, useState } from "react";
import parseMentions from "@/utils/ParseMention";
import TruncatedText from "../components/TruncatedText";
import EmojiPicker from "emoji-picker-react";
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
      <div className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${me ? "items-end" : "items-start"}`}>
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

        {/* Content Wrapper supporting unified hover reactions menu */}
        <div
          className="relative w-full flex flex-col items-stretch"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {text ? (
            /* Render wrapped inside bubble if there is text */
            <div
              onClick={onClick}
              className={`p-3 shadow-sm break-words cursor-pointer transition-all duration-200
                ${selected ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900" : ""}
                ${me
                  ? "bg-green-600 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-br-xl rounded-tr-xl rounded-tl-xl"
                }`}
            >
              {/* Attachments on top */}
              {attachments && attachments.length > 0 && (
                <div
                  className="flex flex-col mb-2"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.tagName === "A" ||
                      target.tagName === "AUDIO" ||
                      target.tagName === "VIDEO" ||
                      target.closest("audio") ||
                      target.closest("video")
                    ) {
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((a: any) => {
                      const ext = a.filename?.split(".").pop()?.toLowerCase();
                      if (a.mimeType?.startsWith("audio/")) {
                        return (
                          <div key={a.id} className="mt-1">
                            <audio controls className="w-64 h-8">
                              <source src={a.url} type={a.mimeType} />
                            </audio>
                          </div>
                        );
                      }
                      if (a.mimeType?.startsWith("video/") || (ext && ["mp4", "mov", "webm", "mkv", "avi"].includes(ext))) {
                        return (
                          <div key={a.id} className="mt-1">
                            <video src={a.url} controls className="max-w-xs max-h-64 rounded-lg shadow-sm border dark:border-gray-700" />
                          </div>
                        );
                      }
                      if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                        return (
                          <div key={a.id} className="mt-1">
                            <img src={a.url} className="w-48 h-48 object-cover rounded-lg shadow-sm border dark:border-gray-700" alt="attachment" />
                          </div>
                        );
                      }
                      return (
                        <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className={`underline text-xs mt-1 block ${me ? 'text-green-200 hover:text-white' : 'text-blue-500'}`}>
                          {a.filename || "Attachment"}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text underneath */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                <TruncatedText text={text} maxLength={300} isMe={me} />
              </div>

              {/* Message Time status */}
              {time && (
                <div
                  className={`text-[10px] mt-1.5 text-right opacity-70 ${me ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {time}
                </div>
              )}
            </div>
          ) : (
            /* Render directly if only attachments, no bubble background/padding */
            <div
              onClick={onClick}
              className={`relative max-w-[85%] group/content ${selected ? "ring-2 ring-green-500 p-1 rounded-lg" : ""}`}
            >
              {attachments && attachments.length > 0 && (
                <div
                  className={`flex flex-col mt-1 cursor-pointer ${me ? "items-end" : "items-start"}`}
                >
                  <div
                    className="flex flex-wrap gap-2"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.tagName === "A" ||
                        target.tagName === "AUDIO" ||
                        target.tagName === "VIDEO" ||
                        target.closest("audio") ||
                        target.closest("video")
                      ) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {attachments.map((a: any) => {
                      const ext = a.filename?.split(".").pop()?.toLowerCase();
                      if (a.mimeType?.startsWith("audio/")) {
                        return (
                          <div key={a.id} className="mt-1">
                            <audio controls className="w-64 h-8">
                              <source src={a.url} type={a.mimeType} />
                            </audio>
                          </div>
                        );
                      }
                      if (a.mimeType?.startsWith("video/") || (ext && ["mp4", "mov", "webm", "mkv", "avi"].includes(ext))) {
                        return (
                          <div key={a.id} className="mt-1">
                            <video src={a.url} controls className="max-w-xs max-h-64 rounded-lg shadow-sm border dark:border-gray-700" />
                          </div>
                        );
                      }
                      if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                        return (
                          <div key={a.id} className="mt-1">
                            <img src={a.url} className="w-48 h-48 object-cover rounded-lg shadow-sm border dark:border-gray-700" alt="attachment" />
                          </div>
                        );
                      }
                      return (
                        <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className={`underline text-xs mt-1 block ${me ? 'text-green-600 dark:text-green-400' : 'text-blue-500'}`}>
                          {a.filename || "Attachment"}
                        </a>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 px-1">
                    {time}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reaction Quick Hover Menu (Pin removed, available via message click action bar) */}
          {hovered && (
            <div
              onMouseEnter={() => setHovered(true)}
              className={`absolute -top-9 ${me ? 'right-2' : 'left-2'} flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 z-20 backdrop-blur-sm bg-opacity-90`}
            >
              {["👍", "❤️", "😂"].map((emoji) => (
                <button
                  key={emoji}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onReact?.(emoji); }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {emoji}
                </button>
              ))}
              <button
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowLocalPicker((prev) => !prev); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-bold text-gray-500 dark:text-gray-400"
                title="React with any emoji"
              >
                ➕
              </button>
            </div>
          )}

          {showLocalPicker && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={(e) => { e.stopPropagation(); setShowLocalPicker(false); }} />
              <div 
                className="absolute z-50 bottom-10 left-0 shadow-2xl rounded-lg overflow-hidden border dark:border-gray-700 bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    onReact?.(emojiData.emoji);
                    setShowLocalPicker(false);
                  }}
                  width={280}
                  height={320}
                  skinTonesDisabled
                  searchDisabled
                />
              </div>
            </>
          )}
        </div>

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

        {/* Thread Summary Bar (Matching UI with avatars, unread badge, total replies, last reply time) */}
        {threadRepliesCount !== undefined && threadRepliesCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewThread?.();
            }}
            className="flex items-center gap-2 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline group/thread"
          >
            {/* Participant Avatars */}
            {threadParticipants && threadParticipants.length > 0 ? (
              <div className="flex -space-x-1.5 overflow-hidden">
                {threadParticipants.slice(0, 3).map((p, idx) => (
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
                ))}
              </div>
            ) : (
              <div className="flex -space-x-1.5">
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
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {threadRepliesCount} {threadRepliesCount === 1 ? 'reply' : 'replies'}
            </span>

            {/* Last reply timestamp */}
            {lastThreadReplyTime && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">
                {lastThreadReplyTime}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChannelMessageBubble;
