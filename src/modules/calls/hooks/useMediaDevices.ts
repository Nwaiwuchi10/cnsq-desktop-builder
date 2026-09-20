// src/modules/calls/hooks/useMediaDevices.ts
import { useCallback, useRef } from 'react';
import { useCallStore } from '@/store/callStore';
import { getUserMedia, getDisplayMedia } from '../utils/webrtc.utils';

export function useMediaDevices() {
  const setLocalStream = useCallStore((s) => s.setLocalStream);
  const setScreenStream = useCallStore((s) => s.setScreenStream);
  const setVideoEnabled = useCallStore((s) => s.setVideoEnabled);
  const setScreenSharing = useCallStore((s) => s.setScreenSharing);
  const setMuted = useCallStore((s) => s.setMuted);
  const localStream = useCallStore((s) => s.localStream);
  const screenStream = useCallStore((s) => s.screenStream);
  const currentCamera = useCallStore((s) => s.currentCamera);
  const setCurrentCamera = useCallStore((s) => s.setCurrentCamera);

  /**
   * Start capturing local media (audio-only or audio+video)
   */
  const startLocalMedia = useCallback(
    async (withVideo: boolean): Promise<MediaStream | null> => {
      try {
        const stream = await getUserMedia(withVideo);
        setLocalStream(stream);
        setVideoEnabled(withVideo);
        return stream;
      } catch (err) {
        console.error('[Media] getUserMedia failed:', err);
        // Fallback: try audio only
        try {
          const audioStream = await getUserMedia(false);
          setLocalStream(audioStream);
          setVideoEnabled(false);
          return audioStream;
        } catch (e) {
          console.error('[Media] Audio fallback failed:', e);
          return null;
        }
      }
    },
    [setLocalStream, setVideoEnabled],
  );

  /**
   * Toggle microphone mute on the existing stream
   */
  const toggleMute = useCallback(
    (muted: boolean) => {
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
      setMuted(muted);
    },
    [localStream, setMuted],
  );

  /**
   * Toggle video on/off on the existing stream
   */
  const toggleVideo = useCallback(
    (enabled: boolean) => {
      localStream?.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      setVideoEnabled(enabled);
    },
    [localStream, setVideoEnabled],
  );

  /**
   * Flip camera (front/back) — replaces video track
   */
  const flipCamera = useCallback(async () => {
    const nextCamera = currentCamera === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextCamera },
        audio: false,
      });
      const newTrack = newStream.getVideoTracks()[0];
      // Replace track in existing stream
      if (localStream) {
        const oldTrack = localStream.getVideoTracks()[0];
        if (oldTrack) {
          localStream.removeTrack(oldTrack);
          oldTrack.stop();
        }
        localStream.addTrack(newTrack);
      }
      setCurrentCamera(nextCamera);
    } catch (err) {
      console.error('[Media] Flip camera failed:', err);
    }
  }, [currentCamera, localStream, setCurrentCamera]);

  /**
   * Start screen sharing — returns the screen stream
   */
  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await getDisplayMedia();
      setScreenStream(stream);
      setScreenSharing(true);

      // Auto-cleanup when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenStream(null);
        setScreenSharing(false);
      });

      return stream;
    } catch (err) {
      console.error('[Media] Screen share failed:', err);
      return null;
    }
  }, [setScreenStream, setScreenSharing]);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach((t) => t.stop());
    setScreenStream(null);
    setScreenSharing(false);
  }, [screenStream, setScreenStream, setScreenSharing]);

  /**
   * Stop all local media and clean up
   */
  const stopAllMedia = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setScreenStream(null);
  }, [localStream, screenStream, setLocalStream, setScreenStream]);

  return {
    startLocalMedia,
    toggleMute,
    toggleVideo,
    flipCamera,
    startScreenShare,
    stopScreenShare,
    stopAllMedia,
  };
}
