"use client";
// src/modules/calls/components/MinimizedCallPill.tsx
import React from "react";
import { useCallStore } from "@/store/callStore";
import { formatCallDuration } from "../utils/webrtc.utils";
import { PhoneOff, Maximize2 } from "lucide-react";

interface MinimizedCallPillProps {
  onExpand: () => void;
  onEnd: () => void;
}

export default function MinimizedCallPill({ onExpand, onEnd }: MinimizedCallPillProps) {
  const activeCall = useCallStore((s) => s.activeCall);
  const isMinimized = useCallStore((s) => s.isMinimized);
  const status = useCallStore((s) => s.status);
  const callDurationSeconds = useCallStore((s) => s.callDurationSeconds);
  const participants = useCallStore((s) => s.participants);

  if (!isMinimized || status !== "active" || !activeCall) return null;

  const participantCount = Object.keys(participants).length + 1;

  return (
    <div
      id="minimized-call-pill"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-4 py-2.5 bg-green-600 shadow-lg select-none"
      style={{ paddingTop: "env(safe-area-inset-top, 12px)" }}
    >
      {/* Left: info */}
      <button
        onClick={onExpand}
        className="flex items-center gap-3 flex-1 text-left"
      >
        {/* Pulse dot */}
        <div className="relative flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-40" />
        </div>

        <div>
          <p className="text-white text-sm font-semibold leading-tight">
            {activeCall.conversationName || "Call"} · {activeCall.type === "video" ? "Video" : "Voice"}
          </p>
          <p className="text-white/80 text-xs">
            {formatCallDuration(callDurationSeconds)}
            {activeCall.scope === "group" && ` · ${participantCount} in call`}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-3">
        {/* Return to call */}
        <button
          onClick={onExpand}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
          title="Return to call"
        >
          <Maximize2 size={16} className="text-white" />
        </button>

        {/* End call */}
        <button
          onClick={(e) => { e.stopPropagation(); onEnd(); }}
          className="p-1.5 rounded-full bg-red-500 hover:bg-red-400 transition"
          title="End call"
        >
          <PhoneOff size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
