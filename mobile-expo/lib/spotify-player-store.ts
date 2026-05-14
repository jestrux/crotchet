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
  isPlaying: boolean;
  track: SpotifyTrack | null;
  position: number;
  deviceId: string | null;
  token: string | null;
  open: (token: string) => void;
  close: () => void;
  setDeviceId: (id: string) => void;
  setTrackState: (isPlaying: boolean, track: SpotifyTrack, position: number) => void;
  setPosition: (position: number) => void;
};

export const useSpotifyPlayerStore = create<SpotifyPlayerStore>((set) => ({
  isOpen: false,
  isPlaying: false,
  track: null,
  position: 0,
  deviceId: null,
  token: null,
  open: (token) => set({ isOpen: true, token }),
  close: () => set({ isOpen: false, isPlaying: false }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setTrackState: (isPlaying, track, position) => set({ isPlaying, track, position }),
  setPosition: (position) => set({ position }),
}));

// Module-level WebView ref — set by SpotifyPlayer component on mount
let _webviewRef: { current: any } | null = null;

export function registerPlayerWebView(ref: { current: any }) {
  _webviewRef = ref;
}

export function sendPlayerCommand(cmd: Record<string, any>) {
  _webviewRef?.current?.postMessage(JSON.stringify(cmd));
}
