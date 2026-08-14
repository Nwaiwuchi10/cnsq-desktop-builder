// src/store/callStore.ts
import { create } from 'zustand';

export type CallType = 'audio' | 'video';
export type CallScope = 'dm' | 'group';
export type CallStatus =
  | 'idle'
  | 'initiating'
  | 'ringing_outgoing'
  | 'ringing_incoming'
  | 'active'
  | 'ended';

export interface CallParticipant {
  userId: number;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  muted: boolean;
  videoEnabled: boolean;
  speaking: boolean;
  handRaised: boolean;
  screenSharing: boolean;
  stream?: MediaStream;
  hasPoorConnection?: boolean;
}

export interface IncomingCallInfo {
  callId: string;
  type: CallType;
  scope: CallScope;
  conversationId: string;
  caller: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  conversationName?: string | null;
}

export interface ActiveCallInfo {
  callId: string;
  type: CallType;
  scope: CallScope;
  conversationId: string;
  conversationName?: string | null;
  conversationAvatar?: string | null;
  initiatorId?: number;
  startedAt: Date | null;
}

interface CallState {
  // Current call lifecycle state
  status: CallStatus;
  activeCall: ActiveCallInfo | null;
  incomingCall: IncomingCallInfo | null;

  // Media
  localStream: MediaStream | null;
  screenStream: MediaStream | null;

  // Self state
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  isMinimized: boolean;
  currentCamera: 'user' | 'environment';
  localPoorConnection: boolean;

  // Participants (for group calls / to track remote peers)
  participants: Record<number, CallParticipant>;

  // Duration timer
  callStartTime: Date | null;
  callDurationSeconds: number;

  // Reactions queue
  reactions: Array<{ userId: number; emoji: string; id: string }>;

  // Actions
  setStatus: (status: CallStatus) => void;
  setActiveCall: (call: ActiveCallInfo | null) => void;
  setIncomingCall: (call: IncomingCallInfo | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  setMuted: (muted: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setSpeakerOn: (on: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setCurrentCamera: (cam: 'user' | 'environment') => void;
  setLocalPoorConnection: (poor: boolean) => void;
  addParticipant: (participant: CallParticipant) => void;
  removeParticipant: (userId: number) => void;
  updateParticipant: (userId: number, update: Partial<CallParticipant>) => void;
  setParticipantStream: (userId: number, stream: MediaStream) => void;
  setCallStartTime: (t: Date | null) => void;
  tickDuration: () => void;
  addReaction: (reaction: { userId: number; emoji: string }) => void;
  resetCall: () => void;
}

const initialState = {
  status: 'idle' as CallStatus,
  activeCall: null,
  incomingCall: null,
  localStream: null,
  screenStream: null,
  isMuted: false,
  isVideoEnabled: false,
  isSpeakerOn: true,
  isScreenSharing: false,
  isMinimized: false,
  currentCamera: 'user' as 'user' | 'environment',
  localPoorConnection: false,
  participants: {},
  callStartTime: null,
  callDurationSeconds: 0,
  reactions: [],
};

export const useCallStore = create<CallState>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setActiveCall: (call) => set({ activeCall: call }),
  setIncomingCall: (call) => set({ incomingCall: call }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  setMuted: (muted) => set({ isMuted: muted }),
  setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
  setSpeakerOn: (on) => set({ isSpeakerOn: on }),
  setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
  setMinimized: (minimized) => set({ isMinimized: minimized }),
  setCurrentCamera: (cam) => set({ currentCamera: cam }),
  setLocalPoorConnection: (poor) => set({ localPoorConnection: poor }),

  addParticipant: (p) =>
    set((s) => ({
      participants: { ...s.participants, [p.userId]: p },
    })),

  removeParticipant: (userId) =>
    set((s) => {
      const next = { ...s.participants };
      delete next[userId];
      return { participants: next };
    }),

  updateParticipant: (userId, update) =>
    set((s) => {
      if (!s.participants[userId]) return s;
      return {
        participants: {
          ...s.participants,
          [userId]: { ...s.participants[userId], ...update },
        },
      };
    }),

  setParticipantStream: (userId, stream) =>
    set((s) => ({
      participants: {
        ...s.participants,
        [userId]: s.participants[userId]
          ? { ...s.participants[userId], stream }
          : {
              userId,
              firstName: '',
              lastName: '',
              muted: false,
              videoEnabled: true,
              speaking: false,
              handRaised: false,
              screenSharing: false,
              stream,
            },
      },
    })),

  setCallStartTime: (t) => set({ callStartTime: t }),

  tickDuration: () =>
    set((s) => ({ callDurationSeconds: s.callDurationSeconds + 1 })),

  addReaction: ({ userId, emoji }) => {
    const id = `${Date.now()}-${userId}-${emoji}`;
    set((s) => ({
      reactions: [...s.reactions, { userId, emoji, id }],
    }));
    // Auto-remove after 3.5s
    setTimeout(() => {
      set((s) => ({
        reactions: s.reactions.filter((r) => r.id !== id),
      }));
    }, 3500);
  },

  resetCall: () => {
    // Stop local streams before resetting
    const { localStream, screenStream } = get();
    localStream?.getTracks().forEach((t) => t.stop());
    screenStream?.getTracks().forEach((t) => t.stop());
    set({ ...initialState });
  },
}));
