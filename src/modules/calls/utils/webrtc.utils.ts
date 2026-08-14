// src/modules/calls/utils/webrtc.utils.ts

/**
 * ICE Server configuration.
 * - Google STUN: free, no auth needed (use in dev AND prod as fallback)
 * - Self-hosted TURN: fill in your coturn server details for production
 *
 * 🔧 TO CONFIGURE COTURN:
 *   1. Install: sudo apt install coturn
 *   2. Edit /etc/turnserver.conf with your domain + credentials
 *   3. Update TURN_SERVER, TURN_USER, TURN_PASS below (or from env vars)
 */

const TURN_SERVER = process.env.NEXT_PUBLIC_TURN_SERVER || ''; // e.g. 'turn:yourdomain.com:3478'
const TURN_USER = process.env.NEXT_PUBLIC_TURN_USER || '';
const TURN_PASS = process.env.NEXT_PUBLIC_TURN_PASS || '';

export const ICE_SERVERS: RTCIceServer[] = [
  // Free Google STUN (no account needed — works for most NAT scenarios)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Self-hosted STUN (your coturn server)
  ...(TURN_SERVER ? [{ urls: TURN_SERVER.replace('turn:', 'stun:') }] : []),
  // Self-hosted TURN (relay — needed for users behind strict firewalls)
  ...(TURN_SERVER && TURN_USER && TURN_PASS
    ? [{ urls: TURN_SERVER, username: TURN_USER, credential: TURN_PASS }]
    : []),
];

/**
 * Create a configured RTCPeerConnection with optimal settings
 */
export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceTransportPolicy: 'all', // use 'relay' to force TURN only
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  });
}

/**
 * Get user media with constraints
 */
export async function getUserMedia(video: boolean, audio = true): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: video
      ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
        }
      : false,
  });
}

/**
 * Get display media (screen share)
 */
export async function getDisplayMedia(): Promise<MediaStream> {
  return (navigator.mediaDevices as any).getDisplayMedia({
    video: {
      cursor: 'always',
      displaySurface: 'monitor',
    },
    audio: true,
  });
}

/**
 * Format duration in seconds to human readable (e.g. "3 min 22 sec")
 */
export function formatCallDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0 sec';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sec`;
  return `${mins} min ${secs > 0 ? ` ${secs} sec` : ''}`;
}

/**
 * Detect speaking via AudioContext AnalyserNode
 * Returns a cleanup function
 */
export function setupSpeakingDetection(
  stream: MediaStream,
  onSpeaking: (speaking: boolean) => void,
  threshold = 20,
): () => void {
  let animFrameId: number;
  let isSpeaking = false;

  try {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const check = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const speaking = avg > threshold;

      if (speaking !== isSpeaking) {
        isSpeaking = speaking;
        onSpeaking(speaking);
      }

      animFrameId = requestAnimationFrame(check);
    };

    animFrameId = requestAnimationFrame(check);

    return () => {
      cancelAnimationFrame(animFrameId);
      audioCtx.close();
    };
  } catch (e) {
    return () => {};
  }
}
