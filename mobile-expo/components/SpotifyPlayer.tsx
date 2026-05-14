import { useRef, useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useSpotifyPlayerStore,
  registerPlayerWebView,
  sendPlayerCommand,
} from '@/lib/spotify-player-store';
import { Alert } from 'react-native';

const alert = (title: string, msg: string) => Alert.alert(title, msg);

let WebView: any = null;
try {
  const { NativeModules } = require('react-native');
  if (NativeModules.RNCWebView) {
    WebView = require('react-native-webview').WebView;
  }
} catch {}

let activateKeepAwakeAsync: any;
let deactivateKeepAwake: any;
try {
  ({ activateKeepAwakeAsync, deactivateKeepAwake } = require('expo-keep-awake'));
} catch {}

const TIMING = { duration: 320, easing: Easing.out(Easing.cubic) };

function msToTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

async function transferPlayback(deviceId: string, token: string) {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });
    if (!res.ok) alert('Transfer Failed', `Status ${res.status} — is Spotify open on another device?`);
  } catch (e: any) {
    alert('Transfer Failed', e?.message ?? 'Could not reach Spotify');
  }
}

// ---------------------------------------------------------------------------
// Inline HTML for the hidden Spotify Web Playback SDK WebView
// ---------------------------------------------------------------------------
const PLAYER_HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#000">
<script src="https://sdk.scdn.co/spotify-player.js"></script>
<script>
  var player = null;
  var sdkReady = false;
  var pendingToken = null;

  function post(data) { window.ReactNativeWebView.postMessage(JSON.stringify(data)); }

  window.onSpotifyWebPlaybackSDKReady = function() {
    sdkReady = true;
    if (pendingToken) { initPlayer(pendingToken); pendingToken = null; }
  };

  function initPlayer(token) {
    if (player) { player.disconnect(); }
    player = new Spotify.Player({
      name: 'Crotchet',
      getOAuthToken: function(cb) { cb(token); },
      volume: 1.0,
    });
    player.addListener('ready', function(r) {
      post({ type: 'READY', device_id: r.device_id });
    });
    player.addListener('not_ready', function() {
      post({ type: 'NOT_READY' });
    });
    player.addListener('player_state_changed', function(state) {
      if (!state) return;
      var t = state.track_window.current_track;
      post({
        type: 'STATE_CHANGED',
        isPlaying: !state.paused,
        position: state.position,
        track: {
          id: t.id,
          name: t.name,
          artists: t.artists.map(function(a) { return a.name; }).join(', '),
          image: t.album.images[0] ? t.album.images[0].url : null,
          duration_ms: t.duration_ms,
        },
      });
    });
    player.addListener('initialization_error', function(e) { post({ type: 'ERROR', message: e.message }); });
    player.addListener('authentication_error', function(e) { post({ type: 'AUTH_ERROR', message: e.message }); });
    player.connect();
    setInterval(function() {
      if (!player) return;
      player.getCurrentState().then(function(s) {
        if (s && !s.paused) post({ type: 'POSITION', position: s.position });
      });
    }, 1000);
  }

  function handleMessage(e) {
    try {
      var cmd = JSON.parse(e.data);
      if (cmd.type === 'INIT') {
        if (sdkReady) initPlayer(cmd.token); else pendingToken = cmd.token;
      } else if (player) {
        if (cmd.type === 'PLAY') player.resume();
        else if (cmd.type === 'PAUSE') player.pause();
        else if (cmd.type === 'NEXT') player.nextTrack();
        else if (cmd.type === 'PREVIOUS') player.previousTrack();
        else if (cmd.type === 'SEEK') player.seek(cmd.position);
      }
    } catch(err) {}
  }

  document.addEventListener('message', handleMessage);
  window.addEventListener('message', handleMessage);
</script>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Player UI
// ---------------------------------------------------------------------------
function PlayerUI({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { track, isPlaying, position } = useSpotifyPlayerStore();
  const translateY = useSharedValue(900);

  useEffect(() => {
    translateY.value = withTiming(0, TIMING);
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(900, TIMING, () => runOnJS(onClose)());
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => { if (e.translationY > 0) translateY.value = e.translationY; })
    .onEnd((e) => {
      if (e.translationY > 100) runOnJS(dismiss)();
      else translateY.value = withTiming(0, TIMING);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const progress = track ? Math.min(position / track.duration_ms, 1) : 0;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.playerContainer, animStyle]}>
      {/* Blurred album art background */}
      <View style={StyleSheet.absoluteFill}>
        {track?.image ? (
          <Image
            source={{ uri: track.image }}
            style={StyleSheet.absoluteFill}
            blurRadius={50}
            resizeMode="cover"
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      </View>

      {/* Drag handle */}
      <GestureDetector gesture={panGesture}>
        <View style={[styles.handleArea, { paddingTop: insets.top + 8 }]}>
          <View style={styles.handleBar} />
        </View>
      </GestureDetector>

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Close */}
        <Pressable
          onPress={dismiss}
          style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Ionicons name="chevron-down" size={28} color="rgba(255,255,255,0.8)" />
        </Pressable>

        {/* Album art */}
        {track?.image ? (
          <Image
            source={{ uri: track.image }}
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.artwork, styles.artworkPlaceholder]}>
            <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.3)" />
          </View>
        )}

        {/* Track info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {track?.name ?? '—'}
          </Text>
          <Text style={styles.trackArtists} numberOfLines={1}>
            {track?.artists ?? ''}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressTimes}>
            <Text style={styles.timeText}>{msToTime(position)}</Text>
            <Text style={styles.timeText}>{msToTime(track?.duration_ms ?? 0)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={() => sendPlayerCommand({ type: 'PREVIOUS' })}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons name="play-skip-back" size={34} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => sendPlayerCommand({ type: isPlaying ? 'PAUSE' : 'PLAY' })}
            style={({ pressed }) => [styles.playBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="#000" />
          </Pressable>

          <Pressable
            onPress={() => sendPlayerCommand({ type: 'NEXT' })}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons name="play-skip-forward" size={34} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main component — always mounted in _layout, hidden WebView + conditional UI
// ---------------------------------------------------------------------------
export function SpotifyPlayer() {
  const webviewRef = useRef<any>(null);
  const lastToken = useRef<string | null>(null);
  const { isOpen, isPlaying, token, close, setDeviceId, setTrackState, setPosition } =
    useSpotifyPlayerStore();

  useEffect(() => {
    registerPlayerWebView(webviewRef);
  }, []);

  // Send INIT whenever a new token is set
  useEffect(() => {
    if (token && token !== lastToken.current) {
      lastToken.current = token;
      if (WebView) sendPlayerCommand({ type: 'INIT', token });
      else alert('Rebuild Required', 'react-native-webview native module not found.\n\nRun: npx expo run:ios');
    }
  }, [token]);

  // Keep screen on while playing
  useEffect(() => {
    if (isPlaying) activateKeepAwakeAsync?.();
    else deactivateKeepAwake?.();
  }, [isPlaying]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'READY') {
        setDeviceId(msg.device_id);
        if (token) transferPlayback(msg.device_id, token);
      } else if (msg.type === 'STATE_CHANGED') {
        setTrackState(msg.isPlaying, msg.track, msg.position);
      } else if (msg.type === 'POSITION') {
        setPosition(msg.position);
      } else if (msg.type === 'AUTH_ERROR') {
        alert('Auth Error', msg.message ?? 'Spotify auth failed — try reconnecting');
      } else if (msg.type === 'ERROR') {
        alert('Player Error', msg.message ?? 'Unknown Spotify player error');
      } else if (msg.type === 'NOT_READY') {
        alert('Disconnected', 'Spotify player device went offline');
      }
    } catch {}
  };

  return (
    <>
      {/* Hidden WebView — always alive so audio keeps playing */}
      {WebView ? (
        <View style={styles.hiddenWebView}>
          <WebView
            ref={webviewRef}
            source={{ html: PLAYER_HTML }}
            onMessage={handleMessage}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            javaScriptEnabled
          />
        </View>
      ) : null}

      {/* Full-screen player UI */}
      {isOpen ? <PlayerUI onClose={close} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  hiddenWebView: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 1,
    height: 1,
    opacity: 0,
  },
  playerContainer: {
    backgroundColor: '#111',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  handleArea: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  closeBtn: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    marginBottom: 32,
  },
  artworkPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    marginBottom: 28,
  },
  trackName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  trackArtists: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
