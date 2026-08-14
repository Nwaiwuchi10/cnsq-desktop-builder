"use client";
// src/modules/calls/components/IncomingCallModal.tsx
import React, { useEffect, useRef } from "react";
import { useCallStore } from "@/store/callStore";
import { Phone, PhoneOff, Video, Mic } from "lucide-react";

interface IncomingCallModalProps {
  onAccept: (callId: string) => void;
  onDecline: (callId: string) => void;
}

export default function IncomingCallModal({
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  const incomingCall = useCallStore((s) => s.incomingCall);
  const status = useCallStore((s) => s.status);
  const pulseRef = useRef<HTMLDivElement>(null);

  if (!incomingCall || status !== "ringing_incoming") return null;

  const { callId, type, caller, conversationName, scope } = incomingCall;

  const callerName = `${caller.firstName} ${caller.lastName}`;
  const callLabel =
    scope === "group"
      ? `${conversationName || "Group"} · ${type === "video" ? "Video" : "Voice"} call`
      : `Incoming ${type === "video" ? "video" : "voice"} call`;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        {/* Card */}
        <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2236] via-[#0f1929] to-[#071020]" />

          {/* Animated ring pulses */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full border border-white/10 animate-ping-slow" />
            <div className="absolute w-56 h-56 rounded-full border border-white/5 animate-ping-slower" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-8 py-10 gap-6">
            {/* Call type label */}
            <div className="flex items-center gap-2 text-xs text-white/60 font-medium tracking-widest uppercase">
              {type === "video" ? (
                <Video size={12} className="text-blue-400" />
              ) : (
                <Mic size={12} className="text-emerald-400" />
              )}
              {callLabel}
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                {caller.avatar ? (
                  <img
                    src={caller.avatar}
                    alt={callerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {caller.firstName?.slice(0, 1)?.toUpperCase()}
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-[#0f1929]" />
            </div>

            {/* Caller name */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{callerName}</h2>
              <p className="text-sm text-white/50 mt-1">
                {scope === "group" && conversationName
                  ? `from ${conversationName}`
                  : "CNSquad"}
              </p>
            </div>

            {/* Ringing dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-16 mt-2">
              {/* Decline */}
              <div className="flex flex-col items-center gap-2">
                <button
                  id="call-decline-btn"
                  onClick={() => onDecline(callId)}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all duration-200"
                >
                  <PhoneOff size={24} className="text-white" />
                </button>
                <span className="text-xs text-white/60">Decline</span>
              </div>

              {/* Accept */}
              <div className="flex flex-col items-center gap-2">
                <button
                  id="call-accept-btn"
                  onClick={() => onAccept(callId)}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 active:scale-95 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-200 animate-pulse-accept"
                >
                  {type === "video" ? (
                    <Video size={24} className="text-white" />
                  ) : (
                    <Phone size={24} className="text-white" />
                  )}
                </button>
                <span className="text-xs text-white/60">Accept</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.1; }
        }
        @keyframes ping-slower {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.2); opacity: 0.05; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-accept {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
        }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-ping-slower { animation: ping-slower 2.5s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
        .animate-pulse-accept { animation: pulse-accept 1.5s ease infinite; }
      `}</style>
    </>
  );
}
