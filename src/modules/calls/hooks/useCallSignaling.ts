// src/modules/calls/hooks/useCallSignaling.ts
/**
 * useCallSignaling — the master call hook.
 *
 * Manages the entire call lifecycle:
 * - Connects to /calls Socket.IO namespace
 * - Handles incoming calls (ringing, accept, decline)
 * - Initiates outgoing calls
 * - Orchestrates WebRTC peer connections via useWebRTC
 * - Manages in-call controls (mute, video, screen share, raise hand, reactions)
 * - Duration timer
 *
 * Mount this ONCE globally in StaffLayout so it persists across navigation.
 */
import { useCallback, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useCallStore } from '@/store/callStore';
import { useMediaDevices } from './useMediaDevices';
import { useWebRTC } from './useWebRTC';
import { setupSpeakingDetection } from '../utils/webrtc.utils';

export function useCallSignaling() {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakingCleanupRef = useRef<(() => void) | null>(null);

  const {
    status,
    setStatus,
    setActiveCall,
    setIncomingCall,
    incomingCall,
    activeCall,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    localStream,
    screenStream,
    addParticipant,
    updateParticipant,
    addReaction,
    setCallStartTime,
    tickDuration,
    resetCall,
    removeParticipant,
  } = useCallStore();

  const {
    startLocalMedia,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    stopAllMedia,
  } = useMediaDevices();

  const {
    createPeer,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleIceCandidate,
    replaceVideoTrack,
    closePeer,
    closeAllPeers,
  } = useWebRTC(socketRef);

  // ─────────────────────────────── CONNECT ──────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('user-token');
    if (!token) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/calls`,
      { query: { token } },
    );
    socketRef.current = socket;

    // ── Incoming call ──
    socket.on('call:incoming', (data: any) => {
      setIncomingCall(data);
      setStatus('ringing_incoming');
      // Play ring sound
      playRingtone(true);
    });

    // ── Outgoing call confirmed ──
    socket.on('call:initiated', (_data: any) => {
      setStatus('ringing_outgoing');
    });

    // ── Callee accepted our call ──
    socket.on('call:accepted', async ({ callId, userId }: { callId: string; userId: number }) => {
      stopRingtone();
      setStatus('active');
      setCallStartTime(new Date());
      startDurationTimer();

      // Create peer connection to the user who just accepted
      if (activeCall) {
        createPeer(userId, callId, true /* we are initiator */);
      }
    });

    // ── Callee declined ──
    socket.on('call:declined', ({ callId: _cid, userId: _uid }: { callId: string; userId: number }) => {
      stopRingtone();
      setStatus('ended');
      setTimeout(() => endAndReset(), 2000);
    });

    // ── Call ended by remote ──
    socket.on('call:ended', ({ callId: _cid, durationSeconds: _ds, durationText: _dt }: { callId: string; durationSeconds: number; durationText: string }) => {
      stopRingtone();
      stopDurationTimer();
      setStatus('ended');
      setTimeout(() => endAndReset(), 3000);
    });

    // ── Missed call ──
    socket.on('call:missed', ({ callId: _cid }: { callId: string }) => {
      stopRingtone();
      setIncomingCall(null);
      setStatus('idle');
    });

    // ── WebRTC signaling ──
    socket.on('call:webrtc-offer', async ({ callId, fromUserId, sdp }: { callId: string; fromUserId: number; sdp: RTCSessionDescriptionInit }) => {
      await handleRemoteOffer(fromUserId, callId, sdp);
    });

    socket.on('call:webrtc-answer', async ({ fromUserId, sdp }: { fromUserId: number; sdp: RTCSessionDescriptionInit }) => {
      await handleRemoteAnswer(fromUserId, sdp);
    });

    socket.on('call:ice-candidate', async ({ fromUserId, candidate }: { fromUserId: number; candidate: RTCIceCandidateInit }) => {
      await handleIceCandidate(fromUserId, candidate);
    });

    // ── In-call control events ──
    socket.on('call:peer-muted', ({ userId, muted }: { userId: number; muted: boolean }) => {
      updateParticipant(userId, { muted });
    });

    socket.on('call:peer-video', ({ userId, videoEnabled }: { userId: number; videoEnabled: boolean }) => {
      updateParticipant(userId, { videoEnabled });
    });

    socket.on('call:peer-screen', ({ userId, sharing }: { userId: number; sharing: boolean }) => {
      updateParticipant(userId, { screenSharing: sharing });
    });

    socket.on('call:hand-raised', ({ userId, raised }: { userId: number; raised: boolean }) => {
      updateParticipant(userId, { handRaised: raised });
    });

    socket.on('call:peer-speaking', ({ userId, speaking }: { userId: number; speaking: boolean }) => {
      updateParticipant(userId, { speaking });
    });

    socket.on('call:reaction', ({ userId, emoji }: { userId: number; emoji: string }) => {
      addReaction({ userId, emoji });
    });

    socket.on('call:participant-added', ({ callId, participant }: { callId: string; participant: any }) => {
      if (activeCall?.callId === callId) {
        updateParticipant(participant.userId, {
          firstName: participant.firstName,
          lastName: participant.lastName,
          avatar: participant.avatar,
          muted: false,
          videoEnabled: true,
          speaking: false,
          handRaised: false,
          screenSharing: false,
        });
      }
    });

    socket.on('call:left', ({ callId, userId }: { callId: string; userId: number }) => {
      if (activeCall?.callId === callId) {
        removeParticipant(userId);
      }
    });

    socket.on('call:network-quality', ({ userId, hasPoorConnection }: { userId: number; hasPoorConnection: boolean }) => {
      updateParticipant(userId, { hasPoorConnection });
    });

    return () => {
      socket.disconnect();
      stopRingtone();
      stopDurationTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────── SPEAKING DETECTION ───────────────────────

  useEffect(() => {
    if (localStream && status === 'active') {
      speakingCleanupRef.current?.();
      speakingCleanupRef.current = setupSpeakingDetection(
        localStream,
        (speaking) => {
          if (socketRef.current && activeCall) {
            socketRef.current.emit('call:speaking', {
              callId: activeCall.callId,
              speaking,
            });
          }
        },
      );
    }
    return () => {
      speakingCleanupRef.current?.();
    };
  }, [localStream, status]);

  // ─────────────────────────────── RING SOUND ───────────────────────────────

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playRingtone = (incoming: boolean) => {
    try {
      // Use Web Audio API oscillator for ringtone (no external files needed)
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(incoming ? 440 : 480, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      // Store reference to stop later
      (window as any).__callRingCtx = ctx;
      (window as any).__callRingOsc = osc;
    } catch (e) {}
  };

  const stopRingtone = () => {
    try {
      (window as any).__callRingOsc?.stop();
      (window as any).__callRingCtx?.close();
    } catch (e) {}
  };

  // ─────────────────────────────── DURATION TIMER ───────────────────────────

  const startDurationTimer = () => {
    stopDurationTimer();
    durationTimerRef.current = setInterval(() => {
      tickDuration();
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  // ─────────────────────────────── ACTIONS ──────────────────────────────────

  /**
   * Initiate a call from the DM or Channel header
   */
  const initiateCall = useCallback(
    async (
      conversationId: string,
      type: 'audio' | 'video',
      scope: 'dm' | 'group',
      conversationName?: string,
      conversationAvatar?: string,
    ) => {
      if (status !== 'idle') return; // prevent double-call

      setStatus('initiating');

      // Start capturing local media first
      const stream = await startLocalMedia(type === 'video');
      if (!stream) {
        setStatus('idle');
        return;
      }

      // Set active call info
      setActiveCall({
        callId: '', // will be set when server confirms
        type,
        scope,
        conversationId,
        conversationName,
        conversationAvatar,
        startedAt: null,
      });

      // Emit to server
      socketRef.current?.emit('call:initiate', {
        conversationId,
        type,
        scope,
      });

      // Update activeCall.callId when server replies
      socketRef.current?.once('call:initiated', (data: { callId: string, initiatorId?: number }) => {
        setActiveCall({
          callId: data.callId,
          type,
          scope,
          conversationId,
          conversationName,
          conversationAvatar,
          startedAt: null,
          initiatorId: data.initiatorId,
        });
      });
    },
    [status, startLocalMedia, setStatus, setActiveCall],
  );

  /**
   * Accept an incoming call
   */
  const acceptCall = useCallback(
    async (callId: string) => {
      const incoming = incomingCall;
      if (!incoming) return;

      stopRingtone();

      const stream = await startLocalMedia(incoming.type === 'video');
      if (!stream) return;

      setActiveCall({
        callId,
        type: incoming.type,
        scope: incoming.scope,
        conversationId: incoming.conversationId,
        conversationName: incoming.conversationName,
        startedAt: null,
      });

      setIncomingCall(null);
      setStatus('active');
      setCallStartTime(new Date());
      startDurationTimer();

      socketRef.current?.emit('call:accept', { callId });
    },
    [incomingCall, startLocalMedia, setActiveCall, setIncomingCall, setStatus, setCallStartTime],
  );

  /**
   * Decline an incoming call
   */
  const declineCall = useCallback(
    (callId: string) => {
      stopRingtone();
      socketRef.current?.emit('call:decline', { callId });
      setIncomingCall(null);
      setStatus('idle');
    },
    [setIncomingCall, setStatus],
  );

  /**
   * End the active call
   */
  const endCall = useCallback(() => {
    if (!activeCall?.callId) return;
    socketRef.current?.emit('call:end', { callId: activeCall.callId });
    stopDurationTimer();
    closeAllPeers();
    stopAllMedia();
    setStatus('ended');
    setTimeout(() => endAndReset(), 2500);
  }, [activeCall, closeAllPeers, stopAllMedia, setStatus]);

  const endAndReset = useCallback(() => {
    stopDurationTimer();
    speakingCleanupRef.current?.();
    closeAllPeers();
    stopAllMedia();
    resetCall();
  }, [closeAllPeers, stopAllMedia, resetCall]);

  /**
   * Toggle mute and emit to peers
   */
  const handleToggleMute = useCallback(
    (muted: boolean) => {
      toggleMute(muted);
      if (activeCall?.callId) {
        socketRef.current?.emit('call:mute-toggle', {
          callId: activeCall.callId,
          muted,
        });
      }
    },
    [toggleMute, activeCall],
  );

  /**
   * Toggle video and emit to peers
   */
  const handleToggleVideo = useCallback(
    (enabled: boolean) => {
      toggleVideo(enabled);
      if (activeCall?.callId) {
        socketRef.current?.emit('call:video-toggle', {
          callId: activeCall.callId,
          videoEnabled: enabled,
        });
      }
    },
    [toggleVideo, activeCall],
  );

  /**
   * Start/stop screen share and replace tracks in peer connections
   */
  const handleScreenShare = useCallback(
    async (enable: boolean) => {
      if (enable) {
        const stream = await startScreenShare();
        if (stream) {
          replaceVideoTrack(stream);
          socketRef.current?.emit('call:screen-share', {
            callId: activeCall?.callId,
            sharing: true,
          });
        }
      } else {
        stopScreenShare();
        if (localStream) replaceVideoTrack(localStream);
        socketRef.current?.emit('call:screen-share', {
          callId: activeCall?.callId,
          sharing: false,
        });
      }
    },
    [startScreenShare, stopScreenShare, replaceVideoTrack, localStream, activeCall],
  );

  /**
   * Raise / lower hand
   */
  const handleRaiseHand = useCallback(
    (raised: boolean) => {
      socketRef.current?.emit('call:raise-hand', {
        callId: activeCall?.callId,
        raised,
      });
    },
    [activeCall],
  );

  /**
   * Send in-call emoji reaction
   */
  const sendReaction = useCallback(
    (emoji: string) => {
      socketRef.current?.emit('call:reaction', {
        callId: activeCall?.callId,
        emoji,
      });
    },
    [activeCall],
  );

  const inviteParticipant = useCallback((targetUserId: number) => {
    if (activeCall?.callId) {
      socketRef.current?.emit('call:add-participant', {
        callId: activeCall.callId,
        targetUserId,
      });
    }
  }, [activeCall]);

  return {
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
  };
}
