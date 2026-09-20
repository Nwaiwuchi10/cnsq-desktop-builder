"use client";
// src/modules/calls/components/CallLogBubble.tsx
// Renders inside chat as: "📞 Voice call · 3 min 22 sec" or "📞 Missed voice call"
import React from "react";
import { Phone, PhoneOff, Video, PhoneMissed } from "lucide-react";

interface CallLogBubbleProps {
  type: "audio" | "video";
  status: "ended" | "missed" | "declined";
  durationText?: string;
  isMe: boolean;
  time: string;
  initiatorName?: string;
  onCallBack?: () => void;
}

export default function CallLogBubble({
  type,
  status,
  durationText,
  isMe,
  time,
  initiatorName,
  onCallBack,
}: CallLogBubbleProps) {
  const isMissed = status === "missed" || status === "declined";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl max-w-xs shadow-sm border ${
        isMe
          ? "bg-[#005c4b] border-[#00866b]/30 ml-auto"
          : "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isMissed ? "bg-red-500/15" : "bg-green-500/15"
        }`}
      >
        {isMissed ? (
          <PhoneMissed
            size={18}
            className="text-red-500"
          />
        ) : type === "video" ? (
          <Video size={18} className="text-green-600 dark:text-green-400" />
        ) : (
          <Phone size={18} className="text-green-600 dark:text-green-400" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isMissed
              ? "text-red-500"
              : isMe
              ? "text-white"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {isMissed
            ? `Missed ${type === "video" ? "video" : "voice"} call`
            : `${type === "video" ? "Video" : "Voice"} call`}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isMe ? "text-white/60" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {isMissed
            ? (isMe ? "Cancelled" : "Tap to call back")
            : durationText || ""}
          {" · "}
          {time}
        </p>
      </div>

      {/* Call back button (for missed, not initiated by me) */}
      {isMissed && !isMe && onCallBack && (
        <button
          onClick={onCallBack}
          className="p-2 rounded-full bg-green-500/15 hover:bg-green-500/25 transition"
          title="Call back"
        >
          <Phone size={15} className="text-green-600" />
        </button>
      )}
    </div>
  );
}
