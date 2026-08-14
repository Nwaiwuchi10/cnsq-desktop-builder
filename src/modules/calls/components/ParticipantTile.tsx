"use client";
// src/modules/calls/components/ParticipantTile.tsx
import React, { useEffect, useRef } from "react";
import { MicOff, Hand, Monitor, WifiOff, Mic } from "lucide-react";
import { useCallStore } from "@/store/callStore";
import type { CallParticipant } from "@/store/callStore";

interface ParticipantTileProps {
  participant: CallParticipant;
  isLocal?: boolean;
  isSpeaker?: boolean; // largest tile in speaker view
  className?: string;
}

export default function ParticipantTile({
  participant,
  isLocal,
  isSpeaker,
  className = "",
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSpeakerOn = useCallStore((s) => s.isSpeakerOn);
  const { stream, videoEnabled, muted, speaking, handRaised, screenSharing, firstName, lastName, avatar, hasPoorConnection } = participant;

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const name = `${firstName} ${lastName}`.trim() || (isLocal ? "You" : `User ${participant.userId}`);
  const showVideo = videoEnabled && !!stream;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0f1116] border-2 transition-all duration-300 ${
        speaking
          ? "border-green-400 shadow-lg shadow-green-400/20"
          : "border-white/10"
      } ${isSpeaker ? "col-span-2 row-span-2" : ""} ${className}`}
    >
      {/* Video/Audio feed always mounted so audio plays */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || !isSpeakerOn} // mute local to prevent echo, or if deafened
        className={`w-full h-full object-cover ${showVideo ? "" : "hidden"}`}
      />

      {/* No video — show avatar */}
      {!showVideo && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Pulse ring when speaking (audio-only) */}
            {speaking && (
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-50" />
            )}
            <div className="w-16 h-16 rounded-full overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {firstName?.slice(0, 1)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen share indicator */}
      {screenSharing && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/80 text-white text-xs font-medium">
          <Monitor size={12} />
          Sharing
        </div>
      )}

      {/* Bottom bar: name + indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-1.5">
          {/* Speaking indicator */}
          {speaking && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-green-400 rounded-full animate-bounce"
                  style={{
                    height: `${i * 4 + 4}px`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          )}
          <span className="text-white text-xs font-medium truncate max-w-[100px]">
            {isLocal ? "You" : name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Muted */}
          {muted && (
            <div className="w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
              <MicOff size={11} className="text-white" />
            </div>
          )}
          {/* Speaking Indicator */}
          {!muted && speaking && (
            <div className="w-5 h-5 rounded-full bg-green-500/80 flex items-center justify-center animate-pulse">
              <Mic size={11} className="text-white" />
            </div>
          )}
          {/* Hand Raised Icon */}
          {handRaised && (
            <div className="bg-blue-500 rounded-full p-1 border border-[#040810]">
              <Hand size={14} className="text-white" />
            </div>
          )}

          {/* Poor Connection Icon */}
          {hasPoorConnection && (
            <div className="bg-orange-500 rounded-full p-1 border border-[#040810] animate-pulse" title="Poor network connection">
              <WifiOff size={14} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
