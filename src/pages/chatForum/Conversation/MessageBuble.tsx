import React, { ReactNode, useState } from "react";
import { CheckCheck } from "lucide-react";
import { ReactionsState } from "../Channels/ChannelMessageBuble";
import TruncatedText from "../components/TruncatedText";
import EmojiPicker from "emoji-picker-react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean;
  pinned?: boolean;
  reactions?: ReactionsState;
  threadRepliesCount?: number;
  threadUnreadCount?: number;
  lastThreadReplyTime?: string;
  threadParticipants?: Array<{ id?: number; photoUrl?: string | null; firstName?: string; name?: string }>;
  onClick?: () => void;
  onReact?: (emoji: string) => void;
  onTogglePin?: () => void;
  onViewThread?: () => void;
  onViewReactors?: () => void;
  currentUserId?: number | null;
  delivered?: boolean;
  attachments?: any[];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  pinned,
  reactions,
  threadRepliesCount,
  threadUnreadCount,
  lastThreadReplyTime,
  threadParticipants,
  onClick,
  onReact,
  onTogglePin,
  onViewThread,
  onViewReactors,
  currentUserId,
  delivered = true,
  attachments,
}) => {
  const [showLocalPicker, setShowLocalPicker] = useState(false);
  const [hovered, setHovered] = useState(false);

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

      {text ? (
        /* Render wrapped inside bubble if there is text */
        <div
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`relative cursor-pointer rounded-lg transition-all
            ${selected ? "ring-2 ring-green-500 p-1" : ""}
            p-3 max-w-[88%] sm:max-w-[82%] shadow-sm break-words ${
              me
                ? "bg-green-600 text-white rounded-br-none"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
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
                        <audio controls className="w-64">
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

          {/* Reaction Quick Hover Menu (Pin removed, available via message click action bar) */}
          {hovered && (
            <div
              onMouseEnter={() => setHovered(true)}
              className={`absolute -top-9 ${me ? 'right-2' : 'left-2'} flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-1 z-20 text-gray-800`}
            >
              {["👍", "❤️", "😂"].map((emoji) => (
                <button
                  key={emoji}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onReact?.(emoji); }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs"
                >
                  {emoji}
                </button>
              ))}
              <button
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowLocalPicker((prev) => !prev); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs font-bold text-gray-500 dark:text-gray-300"
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
      ) : (
        /* Render directly if only attachments, no bubble background/padding */
        <div
          onClick={onClick}
          className={`relative max-w-[70%] group/content ${selected ? "ring-2 ring-green-500 p-1 rounded-lg" : ""}`}
        >
          {attachments && attachments.length > 0 && (
            <div
              className="flex flex-col"
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
                        <audio controls className="w-64">
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
            </div>
          )}

          {/* Quick Actions Hover Menu */}
          <div className={`absolute -top-10 ${me ? 'right-2' : 'left-2'} hidden group-hover/content:flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-1 z-20 text-gray-800`}>
            {["👍", "❤️", "😂"].map((emoji) => (
              <button 
                key={emoji}
                onClick={(e) => { e.stopPropagation(); onReact?.(emoji); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs"
              >
                {emoji}
              </button>
            ))}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLocalPicker((prev) => !prev); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs font-bold"
              title="React with any emoji"
            >
              ➕
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePin?.(); }}
              className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded ${pinned ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
              title={pinned ? "Unpin" : "Pin"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m16 4-4 4-4-4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 12H9"/></svg>
            </button>
          </div>

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
      )}

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

      {/* Thread Summary Bar (Matching UI with avatars, unread badge, total replies, last reply time) */}
      {threadRepliesCount !== undefined && threadRepliesCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewThread?.();
          }}
          className={`flex items-center gap-2 mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline group/thread ${me ? 'justify-end' : 'justify-start'}`}
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
                U
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
