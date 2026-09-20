"use client";
// src/modules/calls/components/CallProvider.tsx
/**
 * CallProvider — Mount ONCE in StaffLayout.
 *
 * Handles:
 * - Socket.IO connection to /calls namespace
 * - Rendering IncomingCallModal
 * - Rendering active CallScreen or GroupCallScreen
 * - Rendering MinimizedCallPill when minimized
 */
import React, { useEffect, useState } from "react";
import { useCallSignaling } from "../hooks/useCallSignaling";
import { useCallStore } from "@/store/callStore";
import IncomingCallModal from "./IncomingCallModal";
import CallScreen from "./CallScreen";
import GroupCallScreen from "./GroupCallScreen";
import MinimizedCallPill from "./MinimizedCallPill";
import { useMediaDevices } from "../hooks/useMediaDevices";

export default function CallProvider() {
  const {
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    inviteParticipant,
    handleToggleMute,
    handleToggleVideo,
    handleScreenShare,
    handleRaiseHand,
    sendReaction,
  } = useCallSignaling();

  const status = useCallStore((s) => s.status);
  const activeCall = useCallStore((s) => s.activeCall);
  const isMinimized = useCallStore((s) => s.isMinimized);
  const setMinimized = useCallStore((s) => s.setMinimized);
  const { flipCamera } = useMediaDevices();

  const [currentUserId, setCurrentUserId] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.staffId || payload.id || payload.sub || 0);
      } catch (e) {}
    }
  }, []);

  const isInCall = status === "active" || status === "initiating" || status === "ringing_outgoing";
  const isGroupCall = activeCall?.scope === "group";

  return (
    <>
      {/* Incoming call overlay */}
      <IncomingCallModal onAccept={acceptCall} onDecline={declineCall} />

      {/* Active DM call screen */}
      {isInCall && !isGroupCall && !isMinimized && (
        <CallScreen
          onEnd={endCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleScreenShare}
          onRaiseHand={handleRaiseHand}
          onSendReaction={sendReaction}
          onFlipCamera={flipCamera}
          onMinimize={() => setMinimized(true)}
        />
      )}

      {/* Active Group call screen */}
      {isInCall && isGroupCall && !isMinimized && (
        <GroupCallScreen
          onEnd={endCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleScreenShare}
          onRaiseHand={handleRaiseHand}
          onSendReaction={sendReaction}
          onFlipCamera={flipCamera}
          onMinimize={() => setMinimized(true)}
          currentUserId={currentUserId}
          onAddParticipant={inviteParticipant}
        />
      )}

      {/* Minimized call pill */}
      {isMinimized && isInCall && (
        <MinimizedCallPill
          onExpand={() => setMinimized(false)}
          onEnd={endCall}
        />
      )}
    </>
  );
}

// ── Export initiateCall for use in ConversationView / ChannelConversationView ──
export { useCallSignaling };
