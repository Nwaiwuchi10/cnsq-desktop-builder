// src/modules/calls/hooks/useWebRTC.ts
import { useCallback, useRef } from 'react';
import { useCallStore } from '@/store/callStore';
import { createPeerConnection } from '../utils/webrtc.utils';
import type { Socket } from 'socket.io-client';

/**
 * useWebRTC — manages P2P WebRTC peer connections for DM and group calls.
 *
 * For DM calls: 1 peer connection (caller ↔ callee)
 * For group calls: mesh — each participant connects to all others
 */
export function useWebRTC(socketRef: React.RefObject<any>) {
  // peerConnections: Map<userId, RTCPeerConnection>
  const peerConnections = useRef<Map<number, RTCPeerConnection>>(new Map());

  const setParticipantStream = useCallStore((s) => s.setParticipantStream);
  const addParticipant = useCallStore((s) => s.addParticipant);
  const removeParticipant = useCallStore((s) => s.removeParticipant);
  const localStream = useCallStore((s) => s.localStream);
  const setLocalPoorConnection = useCallStore((s) => s.setLocalPoorConnection);

  /**
   * Create a peer connection to a specific remote user
   * and set up ICE / track relay via socket
   */
  const createPeer = useCallback(
    (
      targetUserId: number,
      callId: string,
      isInitiator: boolean,
    ): RTCPeerConnection => {
      // Clean up existing connection if any
      const existing = peerConnections.current.get(targetUserId);
      if (existing) {
        existing.close();
        peerConnections.current.delete(targetUserId);
      }

      const pc = createPeerConnection();

      // Add local tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // ICE candidate — relay via socket
      pc.onicecandidate = ({ candidate }) => {
        if (candidate && socketRef.current) {
          socketRef.current.emit('call:ice-candidate', {
            callId,
            targetUserId,
            candidate: candidate.toJSON(),
          });
        }
      };

      // When remote tracks arrive — store stream in Zustand
      pc.ontrack = ({ streams }) => {
        if (streams && streams[0]) {
          setParticipantStream(targetUserId, streams[0]);
        }
      };

      // Connection state logging & network quality monitoring
      pc.onconnectionstatechange = () => {
        console.log(
          `[WebRTC] Peer ${targetUserId} connection: ${pc.connectionState}`,
        );
        if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected'
        ) {
          setLocalPoorConnection(true);
          // Notify poor connection
          if (socketRef.current) {
            socketRef.current.emit('call:network-quality', {
              callId,
              hasPoorConnection: true,
            });
          }
          // Attempt restart ICE
          try {
            pc.restartIce();
          } catch (e) {
            console.warn('[WebRTC] ICE restart failed:', e);
          }
        } else if (pc.connectionState === 'connected') {
          setLocalPoorConnection(false);
          // Connection restored
          if (socketRef.current) {
            socketRef.current.emit('call:network-quality', {
              callId,
              hasPoorConnection: false,
            });
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected') {
          setLocalPoorConnection(true);
          if (socketRef.current) {
            socketRef.current.emit('call:network-quality', {
              callId,
              hasPoorConnection: true,
            });
          }
        } else if (pc.iceConnectionState === 'connected') {
          setLocalPoorConnection(false);
          if (socketRef.current) {
            socketRef.current.emit('call:network-quality', {
              callId,
              hasPoorConnection: false,
            });
          }
        }
      };

      peerConnections.current.set(targetUserId, pc);

      // If caller — create and send offer
      if (isInitiator) {
        pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (socketRef.current && pc.localDescription) {
              socketRef.current.emit('call:webrtc-offer', {
                callId,
                targetUserId,
                sdp: pc.localDescription,
              });
            }
          })
          .catch((e) => console.error('[WebRTC] Offer failed:', e));
      }

      return pc;
    },
    [localStream, socketRef, setParticipantStream],
  );

  /**
   * Handle incoming SDP offer from a remote peer
   */
  const handleRemoteOffer = useCallback(
    async (
      fromUserId: number,
      callId: string,
      sdp: RTCSessionDescriptionInit,
    ) => {
      let pc = peerConnections.current.get(fromUserId);
      if (!pc) {
        pc = createPeer(fromUserId, callId, false);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (socketRef.current && pc.localDescription) {
          socketRef.current.emit('call:webrtc-answer', {
            callId,
            targetUserId: fromUserId,
            sdp: pc.localDescription,
          });
        }
      } catch (e) {
        console.error('[WebRTC] Handle offer failed:', e);
      }
    },
    [createPeer, socketRef],
  );

  /**
   * Handle incoming SDP answer from a remote peer
   */
  const handleRemoteAnswer = useCallback(
    async (fromUserId: number, sdp: RTCSessionDescriptionInit) => {
      const pc = peerConnections.current.get(fromUserId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (e) {
        console.error('[WebRTC] Handle answer failed:', e);
      }
    },
    [],
  );

  /**
   * Handle incoming ICE candidate
   */
  const handleIceCandidate = useCallback(
    async (fromUserId: number, candidate: RTCIceCandidateInit) => {
      const pc = peerConnections.current.get(fromUserId);
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('[WebRTC] Add ICE candidate failed:', e);
      }
    },
    [],
  );

  /**
   * Replace local video track in all peer connections (screen share / camera toggle)
   */
  const replaceVideoTrack = useCallback((newStream: MediaStream) => {
    const newTrack = newStream.getVideoTracks()[0];
    if (!newTrack) return;

    peerConnections.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(newTrack).catch((e) =>
          console.error('[WebRTC] replaceTrack failed:', e),
        );
      }
    });
  }, []);

  /**
   * Close peer connection for a specific user (left the call)
   */
  const closePeer = useCallback((userId: number) => {
    const pc = peerConnections.current.get(userId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(userId);
    }
    removeParticipant(userId);
  }, [removeParticipant]);

  /**
   * Close ALL peer connections (call ended)
   */
  const closeAllPeers = useCallback(() => {
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
  }, []);

  return {
    peerConnections,
    createPeer,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleIceCandidate,
    replaceVideoTrack,
    closePeer,
    closeAllPeers,
  };
}
