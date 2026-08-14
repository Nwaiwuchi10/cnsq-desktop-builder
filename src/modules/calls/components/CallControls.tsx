"use client";
// src/modules/calls/components/CallControls.tsx
import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Hand,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Users,
  SmilePlus,
  FlipHorizontal,
} from "lucide-react";
import { useCallStore } from "@/store/callStore";

interface CallControlsProps {
  onEnd: () => void;
  onToggleMute: (muted: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  onToggleScreenShare: (enabled: boolean) => void;
  onRaiseHand: (raised: boolean) => void;
  onSendReaction: (emoji: string) => void;
  onFlipCamera?: () => void;
  onToggleSpeaker?: (on: boolean) => void;
  onToggleParticipants?: () => void;
  onToggleMinimize?: () => void;
  showParticipants?: boolean;
  isGroup?: boolean;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "🎉", "👏"];

export default function CallControls({
  onEnd,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onRaiseHand,
  onSendReaction,
  onFlipCamera,
  onToggleSpeaker,
  onToggleParticipants,
  onToggleMinimize,
  showParticipants,
  isGroup,
}: CallControlsProps) {
  const isMuted = useCallStore((s) => s.isMuted);
  const isVideoEnabled = useCallStore((s) => s.isVideoEnabled);
  const isScreenSharing = useCallStore((s) => s.isScreenSharing);
  const isSpeakerOn = useCallStore((s) => s.isSpeakerOn);
  const isMinimized = useCallStore((s) => s.isMinimized);
  const setSpeakerOn = useCallStore((s) => s.setSpeakerOn);

  const [handRaised, setHandRaised] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleMute = () => onToggleMute(!isMuted);
  const handleVideo = () => onToggleVideo(!isVideoEnabled);
  const handleScreen = () => onToggleScreenShare(!isScreenSharing);
  const handleHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    onRaiseHand(next);
  };
  const handleSpeaker = () => {
    const next = !isSpeakerOn;
    setSpeakerOn(next);
    onToggleSpeaker?.(next);
  };

  return (
    <div className="relative">
      {/* Reaction picker */}
      {showReactions && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1a1a2e]/90 backdrop-blur-md border border-white/10 shadow-xl">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSendReaction(emoji);
                setShowReactions(false);
              }}
              className="text-2xl hover:scale-125 active:scale-95 transition-transform duration-150"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-[#0f1116]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
        {/* Mute */}
        <ControlButton
          id="call-mute-btn"
          active={isMuted}
          activeColor="bg-red-500/20 border-red-500/40"
          icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          label={isMuted ? "Unmute" : "Mute"}
          onClick={handleMute}
          iconColor={isMuted ? "text-red-400" : "text-white"}
        />

        {/* Video */}
        <ControlButton
          id="call-video-btn"
          active={!isVideoEnabled}
          activeColor="bg-red-500/20 border-red-500/40"
          icon={isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          label={isVideoEnabled ? "Camera" : "Camera off"}
          onClick={handleVideo}
          iconColor={!isVideoEnabled ? "text-red-400" : "text-white"}
        />

        {/* Speaker */}
        <ControlButton
          id="call-speaker-btn"
          active={false}
          icon={isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          label="Speaker"
          onClick={handleSpeaker}
        />

        {/* Screen share (desktop only) */}
        <div className="hidden md:block">
          <ControlButton
            id="call-screen-btn"
            active={isScreenSharing}
            activeColor="bg-blue-500/20 border-blue-500/40"
            icon={isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
            label={isScreenSharing ? "Stop share" : "Share"}
            onClick={handleScreen}
            iconColor={isScreenSharing ? "text-blue-400" : "text-white"}
          />
        </div>

        {/* Flip camera (mobile) */}
        {onFlipCamera && (
          <div className="md:hidden">
            <ControlButton
              id="call-flip-btn"
              active={false}
              icon={<FlipHorizontal size={20} />}
              label="Flip"
              onClick={onFlipCamera}
            />
          </div>
        )}

        {/* Raise hand (group only) */}
        {isGroup && (
          <ControlButton
            id="call-hand-btn"
            active={handRaised}
            activeColor="bg-yellow-500/20 border-yellow-500/40"
            icon={<Hand size={20} />}
            label={handRaised ? "Lower" : "Raise"}
            onClick={handleHand}
            iconColor={handRaised ? "text-yellow-400" : "text-white"}
          />
        )}

        {/* Reactions */}
        <ControlButton
          id="call-reactions-btn"
          active={showReactions}
          activeColor="bg-purple-500/20 border-purple-500/40"
          icon={<SmilePlus size={20} />}
          label="React"
          onClick={() => setShowReactions((p) => !p)}
          iconColor={showReactions ? "text-purple-400" : "text-white"}
        />

        {/* Participants (group only) */}
        {isGroup && onToggleParticipants && (
          <ControlButton
            id="call-participants-btn"
            active={!!showParticipants}
            activeColor="bg-emerald-500/20 border-emerald-500/40"
            icon={<Users size={20} />}
            label="People"
            onClick={onToggleParticipants}
            iconColor={showParticipants ? "text-emerald-400" : "text-white"}
          />
        )}

        {/* Minimize */}
        {onToggleMinimize && (
          <ControlButton
            id="call-minimize-btn"
            active={false}
            icon={isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
            label={isMinimized ? "Expand" : "Minimize"}
            onClick={onToggleMinimize}
          />
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10" />

        {/* End call */}
        <button
          id="call-end-btn"
          onClick={onEnd}
          className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-400 active:scale-95 transition-all duration-200 shadow-lg shadow-red-500/30"
          title="End call"
        >
          <PhoneOff size={22} className="text-white" />
          <span className="text-[10px] text-white/90 font-medium">End</span>
        </button>
      </div>
    </div>
  );
}

// ── Sub-component: single control button ──────────────────────────────────────

interface ControlButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  iconColor?: string;
}

function ControlButton({
  id,
  icon,
  label,
  onClick,
  active,
  activeColor = "bg-white/10 border-white/20",
  iconColor = "text-white",
}: ControlButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
        active
          ? activeColor
          : "bg-white/10 hover:bg-white/20 border-transparent"
      }`}
      title={label}
    >
      <span className={iconColor}>{icon}</span>
      <span className="text-[10px] text-white/60 font-medium">{label}</span>
    </button>
  );
}
