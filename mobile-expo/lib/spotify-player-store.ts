import { create } from 'zustand';

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: string;
  image: string | null;
  duration_ms: number;
};

type SpotifyPlayerStore = {
  isOpen: boolean;
  isAlive: boolean;
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: number; // 0=off, 1=context, 2=track
  track: SpotifyTrack | null;
  context: string | null;
  queue: SpotifyTrack[];
  position: number;
  deviceId: string | null;
  token: string | null;
  open: (token: string) => void;
  close: () => void;
  kill: () => void;
  setDeviceId: (id: string) => void;
  setTrackState: (isPlaying: boolean, track: SpotifyTrack, position: number, queue: SpotifyTrack[], shuffle: boolean, repeatMode: number) => void;
  setPosition: (position: number) => void;
  setContext: (context: string | null) => void;
};

export const useSpotifyPlayerStore = create<SpotifyPlayerStore>((set) => ({
  isOpen: false,
  isAlive: false,
  isPlaying: false,
  shuffle: false,
  repeatMode: 0,
  track: null,
  context: null,
  queue: [],
  position: 0,
  deviceId: null,
  token: null,
  open: (token) => set({ isOpen: true, isAlive: true, token }),
  close: () => set({ isOpen: false }),
  kill: () => set({ isOpen: false, isAlive: false, isPlaying: false, shuffle: false, repeatMode: 0, track: null, context: null, queue: [], position: 0, deviceId: null, token: null }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setTrackState: (isPlaying, track, position, queue, shuffle, repeatMode) => set({ isPlaying, track, position, queue, shuffle, repeatMode }),
  setPosition: (position) => set({ position }),
  setContext: (context) => set({ context }),
}));

// Module-level WebView ref — set by SpotifyPlayer component on mount
let _webviewRef: { current: any } | null = null;

export function registerPlayerWebView(ref: { current: any }) {
  _webviewRef = ref;
}

export function sendPlayerCommand(cmd: Record<string, any>) {
  _webviewRef?.current?.postMessage(JSON.stringify(cmd));
}
