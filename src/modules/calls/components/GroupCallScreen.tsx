"use client";
// src/modules/calls/components/GroupCallScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "@/store/callStore";
import CallControls from "./CallControls";
import ParticipantTile from "./ParticipantTile";
import { formatCallDuration } from "../utils/webrtc.utils";
import { Users, LayoutGrid, Maximize2, X, Mic, MicOff, Video, VideoOff, UserPlus, User, WifiOff } from "lucide-react";
import { StaffSelectorModal } from "@/pages/chatForum/components/StaffSelectorModal";

interface GroupCallScreenProps {
  onEnd: () => void;
  onToggleMute: (muted: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  onToggleScreenShare: (enabled: boolean) => void;
  onRaiseHand: (raised: boolean) => void;
  onSendReaction: (emoji: string) => void;
  onFlipCamera: () => void;
  onMinimize: () => void;
  currentUserId: number;
  onAddParticipant?: (userId: number) => void;
}

type ViewMode = "grid" | "speaker";

export default function GroupCallScreen({
  onEnd,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onRaiseHand,
  onSendReaction,
  onFlipCamera,
  onMinimize,
  currentUserId,
  onAddParticipant,
}: GroupCallScreenProps) {
  const activeCall = useCallStore((s) => s.activeCall);
  const status = useCallStore((s) => s.status);
  const localStream = useCallStore((s) => s.localStream);
  const callDurationSeconds = useCallStore((s) => s.callDurationSeconds);
  const participants = useCallStore((s) => s.participants);
  const reactions = useCallStore((s) => s.reactions);
  const isMuted = useCallStore((s) => s.isMuted);
  const isVideoEnabled = useCallStore((s) => s.isVideoEnabled);
  const localPoorConnection = useCallStore((s) => s.localPoorConnection);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<number | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Track active speaker (loudest participant)
  useEffect(() => {
    const speakingParticipants = Object.values(participants).filter(
      (p) => p.speaking && p.userId !== currentUserId,
    );
    if (speakingParticipants.length > 0) {
      setActiveSpeakerId(speakingParticipants[0].userId);
    }
  }, [participants, currentUserId]);

  if (!activeCall || (status !== "active" && status !== "initiating" && status !== "ringing_outgoing")) return null;

  const isRinging = status === "initiating" || status === "ringing_outgoing";

  const remoteParticipants = Object.values(participants).filter(
    (p) => p.userId !== currentUserId,
  );

  const allParticipants = [
    // Create local participant entry
    {
      userId: currentUserId,
      firstName: "You",
      lastName: "",
      muted: isMuted,
      videoEnabled: isVideoEnabled,
      speaking: false,
      handRaised: false,
      screenSharing: false,
      hasPoorConnection: localPoorConnection,
      stream: localStream || undefined,
    },
    ...remoteParticipants,
  ];

  const speakerParticipant = activeSpeakerId
    ? participants[activeSpeakerId]
    : remoteParticipants[0];

  return (
    <div className="fixed inset-0 z-[9998] bg-[#040810] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#040810] border-b border-white/5">
        <div>
          <p className="text-white font-semibold text-sm">
            {activeCall.conversationName || "Group Call"}
          </p>
          <p className="text-white/50 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            {formatCallDuration(callDurationSeconds)} ·{" "}
            {allParticipants.length} participants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4">
          {activeCall.initiatorId === currentUserId && onAddParticipant && (
            <button
              onClick={() => setIsAddParticipantModalOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white relative group"
              title="Add Participant"
            >
              <UserPlus size={20} />
            </button>
          )}

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white relative group"
            title={viewMode === "grid" ? "Speaker View" : "Grid View"}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white relative group"
            title="Participants"
          >
            <Users size={20} />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {allParticipants.length}
            </span>
          </button>
          <button
            onClick={onMinimize}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Minimize"
          >
            <Maximize2 size={20} />
          </button>
          </div>
        </div>
      </div>



      {isRinging ? (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 bg-gray-800 flex items-center justify-center text-4xl text-gray-400">
            {activeCall.conversationAvatar ? (
              <img src={activeCall.conversationAvatar} alt={activeCall.conversationName || "Group"} className="w-full h-full object-cover" />
            ) : (
              activeCall.conversationName?.charAt(0).toUpperCase() || <Users size={48} />
            )}
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">{activeCall.conversationName || "Group Call"}</h2>
          <p className="text-gray-400 animate-pulse">{status === 'initiating' ? 'Connecting...' : 'Calling...'}</p>
        </div>
      ) : (
        <div className="flex-1 flex relative overflow-hidden">
          {/* Main Stage */}
          <div className="flex-1 relative p-2 overflow-hidden flex flex-col">
          {viewMode === "grid" ? (
            /* ── Grid view ─────────────────────────────────── */
            <div
              className={`grid gap-2 h-full ${
                allParticipants.length <= 1
                  ? "grid-cols-1"
                  : allParticipants.length <= 4
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {allParticipants.map((p) => (
                <ParticipantTile
                  key={p.userId}
                  participant={p as any}
                  isLocal={p.userId === currentUserId}
                />
              ))}
            </div>
          ) : (
            /* ── Speaker view ──────────────────────────────── */
            <div className="flex flex-col gap-2 h-full">
              {/* Main speaker */}
              <div className="flex-1">
                {speakerParticipant && (
                  <ParticipantTile
                    participant={speakerParticipant as any}
                    isLocal={speakerParticipant.userId === currentUserId}
                    isSpeaker
                    className="h-full"
                  />
                )}
              </div>

              {/* Others strip */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allParticipants
                  .filter((p) => p.userId !== speakerParticipant?.userId)
                  .map((p) => (
                    <div key={p.userId} className="w-24 h-28 flex-shrink-0">
                      <ParticipantTile
                        participant={p as any}
                        isLocal={p.userId === currentUserId}
                        className="h-full"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Local Poor Connection Toast */}
        {localPoorConnection && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
            <WifiOff size={16} />
            <span className="text-sm font-medium">Poor network connection</span>
          </div>
        )}

        {/* Participants panel (slide-in) */}
        {showParticipants && (
          <div className="w-64 bg-[#0f1116] border-l border-white/10 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Users size={16} />
                Participants ({allParticipants.length})
              </h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {allParticipants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(p.firstName || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {p.userId === currentUserId ? "You" : `${p.firstName} ${p.lastName}`}
                    </p>
                    {(p as any).speaking && (
                      <p className="text-green-400 text-[10px]">Speaking…</p>
                    )}
                    {(p as any).handRaised && (
                      <p className="text-yellow-400 text-[10px]">✋ Hand raised</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {p.muted ? (
                      <MicOff size={13} className="text-red-400" />
                    ) : (
                      <Mic size={13} className="text-green-400" />
                    )}
                    {p.videoEnabled ? (
                      <Video size={13} className="text-blue-400" />
                    ) : (
                      <VideoOff size={13} className="text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Floating reactions */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-28 flex flex-col-reverse items-center gap-2 pointer-events-none z-10">
        {reactions.map((r) => (
          <div key={r.id} className="text-3xl animate-float-up">
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center px-4 py-4 bg-[#040810] border-t border-white/5">
        <CallControls
          onEnd={onEnd}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleScreenShare={onToggleScreenShare}
          onRaiseHand={onRaiseHand}
          onSendReaction={onSendReaction}
          onFlipCamera={onFlipCamera}
          onToggleParticipants={() => setShowParticipants((p) => !p)}
          showParticipants={showParticipants}
          isGroup
        />
      </div>

      <StaffSelectorModal
        currentUserId={currentUserId}
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        onSelectStaff={(staffId) => {
          onAddParticipant?.(staffId);
          setIsAddParticipantModalOpen(false);
        }}
      />

      <style jsx>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 3s ease-out forwards; }
      `}</style>
    </div>
  );
}
