"use client";
// src/modules/calls/components/CallScreen.tsx
// DM Call Screen — audio-only and video calls
import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "@/store/callStore";
import CallControls from "./CallControls";
import { formatCallDuration } from "../utils/webrtc.utils";
import { User, Maximize2, Minimize2, MicOff, Mic } from "lucide-react";

interface CallScreenProps {
  onEnd: () => void;
  onToggleMute: (muted: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  onToggleScreenShare: (enabled: boolean) => void;
  onRaiseHand: (raised: boolean) => void;
  onSendReaction: (emoji: string) => void;
  onFlipCamera: () => void;
  onMinimize: () => void;
}

export default function CallScreen({
  onEnd,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onRaiseHand,
  onSendReaction,
  onFlipCamera,
  onMinimize,
}: CallScreenProps) {
  const activeCall = useCallStore((s) => s.activeCall);
  const status = useCallStore((s) => s.status);
  const localStream = useCallStore((s) => s.localStream);
  const screenStream = useCallStore((s) => s.screenStream);
  const isVideoEnabled = useCallStore((s) => s.isVideoEnabled);
  const isSpeakerOn = useCallStore((s) => s.isSpeakerOn);
  const isScreenSharing = useCallStore((s) => s.isScreenSharing);
  const callDurationSeconds = useCallStore((s) => s.callDurationSeconds);
  const participants = useCallStore((s) => s.participants);
  const reactions = useCallStore((s) => s.reactions);
  const isMuted = useCallStore((s) => s.isMuted);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [pipPosition, setPipPosition] = useState({ x: 16, y: 16 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current) {
      const src = isScreenSharing && screenStream ? screenStream : localStream;
      localVideoRef.current.srcObject = src || null;
    }
  }, [localStream, screenStream, isScreenSharing]);

  // Attach remote stream (first participant that isn't us)
  const remoteParticipant = Object.values(participants)[0];
  useEffect(() => {
    if (remoteVideoRef.current && remoteParticipant?.stream) {
      remoteVideoRef.current.srcObject = remoteParticipant.stream;
    }
  }, [remoteParticipant?.stream]);

  // PiP drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pipPosition.x,
      y: e.clientY - pipPosition.y,
    };
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setPipPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };
  const handleMouseUp = () => { dragging.current = false; };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pipPosition]);

  if (!activeCall || (status !== "active" && status !== "initiating" && status !== "ringing_outgoing")) return null;

  const isRinging = status === "initiating" || status === "ringing_outgoing";

  const hasRemoteVideo = remoteParticipant?.videoEnabled && !!remoteParticipant?.stream;

  return (
    <div className="fixed inset-0 z-[9998] bg-[#040810] flex flex-col">
      {/* Remote / Main view */}
      <div className="flex-1 relative overflow-hidden">
        {isRinging ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-gray-800 flex items-center justify-center text-4xl text-gray-400">
              {activeCall.conversationAvatar ? (
                <img src={activeCall.conversationAvatar} alt={activeCall.conversationName || "Contact"} className="w-full h-full object-cover" />
              ) : (
                activeCall.conversationName?.charAt(0).toUpperCase() || <User size={48} />
              )}
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">{activeCall.conversationName || "Unknown Contact"}</h2>
            <p className="text-gray-400 animate-pulse">{status === 'initiating' ? 'Connecting...' : 'Calling...'}</p>
          </div>
        ) : (
          <>
            {/* Always mount video so audio track plays, hide it if not needed */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={!isSpeakerOn}
              className={`w-full h-full object-cover ${hasRemoteVideo ? "" : "hidden"}`}
            />

            {/* Audio-only — show avatar with pulse */}
            {!hasRemoteVideo && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0f1929] to-[#040810]">
                <div className="relative">
                  {/* Outer rings */}
                  <div className="absolute inset-[-24px] rounded-full border border-white/10 animate-pulse" />
                  <div className="absolute inset-[-48px] rounded-full border border-white/5 animate-pulse" style={{ animationDelay: "0.5s" }} />

                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/20 bg-gray-800">
                    {activeCall.conversationAvatar || remoteParticipant?.avatar ? (
                      <img
                        src={remoteParticipant?.avatar || activeCall.conversationAvatar || ""}
                        alt={remoteParticipant?.firstName || activeCall.conversationName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        {remoteParticipant?.firstName?.charAt(0) || <User size={48} />}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">
                    {remoteParticipant
                      ? `${remoteParticipant.firstName} ${remoteParticipant.lastName}`
                      : activeCall.conversationName}
                  </h2>
                  <p className="text-sm text-white/50 mt-1">
                    {status === "active"
                      ? formatCallDuration(callDurationSeconds)
                      : "Connecting..."}
                  </p>
                  {remoteParticipant?.muted && (
                    <div className="mt-4 px-4 py-2 bg-black/50 rounded-full flex items-center justify-center gap-2 text-white mx-auto w-fit">
                      <MicOff size={16} className="text-red-500" />
                      <span className="text-sm">User is muted</span>
                    </div>
                  )}
                  {!remoteParticipant?.muted && remoteParticipant?.speaking && (
                    <div className="mt-4 px-4 py-2 bg-black/50 rounded-full flex items-center justify-center gap-2 text-white mx-auto w-fit">
                      <Mic size={16} className="text-green-500 animate-pulse" />
                      <span className="text-sm">Speaking</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Top bar overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 pb-6 bg-gradient-to-b from-black/60 to-transparent">
          <div>
            <p className="text-white font-semibold text-sm">
              {activeCall.conversationName ||
                `${remoteParticipant?.firstName ?? ""} ${remoteParticipant?.lastName ?? ""}`.trim()}
            </p>
            <p className="text-white/60 text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              {status === "active"
                ? formatCallDuration(callDurationSeconds)
                : "Connecting..."}
            </p>
          </div>
          <button
            onClick={onMinimize}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <Minimize2 size={18} className="text-white" />
          </button>
        </div>

        {/* PiP: Local video (draggable) */}
        {isVideoEnabled && (
          <div
            className="absolute w-28 h-36 rounded-2xl overflow-hidden ring-2 ring-white/20 cursor-move shadow-2xl z-10"
            style={{ left: pipPosition.x, top: pipPosition.y }}
            onMouseDown={handleMouseDown}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isMuted && (
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
                <MicOff size={11} className="text-white" />
              </div>
            )}
            {!isMuted && localStream && (
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500/80 flex items-center justify-center animate-pulse">
                <Mic size={11} className="text-white" />
              </div>
            )}
          </div>
        )}

        {/* Floating reactions */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-28 flex flex-col-reverse items-center gap-2 pointer-events-none">
          {reactions.map((r) => (
            <div
              key={r.id}
              className="text-3xl animate-float-up"
            >
              {r.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center px-4 py-5 bg-[#040810]">
        <CallControls
          onEnd={onEnd}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleScreenShare={onToggleScreenShare}
          onRaiseHand={onRaiseHand}
          onSendReaction={onSendReaction}
          onFlipCamera={onFlipCamera}
          isGroup={false}
        />
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 3s ease-out forwards; }
      `}</style>
    </div>
  );
}
