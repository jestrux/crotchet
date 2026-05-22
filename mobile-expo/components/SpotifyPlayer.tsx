import { useRef, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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

function FadeImage({ source, style, resizeMode = 'cover' }: { source: any; style: any; resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' }) {
  const bgOpacity = useSharedValue(1);
  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  return (
    <View style={[style, { overflow: 'hidden' }]}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoad={() => { bgOpacity.value = withTiming(0, TIMING); }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, bgStyle]} pointerEvents="none" />
    </View>
  );
}

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
  var currentToken = null;
  var currentContextUri = null;
  var currentContextName = null;
  var currentShuffle = false;
  var currentRepeatMode = 0;

  function post(data) { window.ReactNativeWebView.postMessage(JSON.stringify(data)); }

  window.onSpotifyWebPlaybackSDKReady = function() {
    sdkReady = true;
    if (pendingToken) { initPlayer(pendingToken); pendingToken = null; }
  };

  function contextNameFromUri(uri) {
    if (!uri) return null;
    if (uri.indexOf('collection') !== -1) return 'Liked Songs';
    var type = uri.split(':')[1];
    if (!type) return null;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  function initPlayer(token) {
    currentToken = token;
    if (player) { player.disconnect(); }
    player = new Spotify.Player({
      name: 'Crotchet',
      getOAuthToken: function(cb) { cb(currentToken); },
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
      var queue = (state.track_window.next_tracks || []).slice(0, 4).map(function(qt) {
        return {
          id: qt.id,
          name: qt.name,
          artists: qt.artists.map(function(a) { return a.name; }).join(', '),
          image: qt.album && qt.album.images && qt.album.images[0] ? qt.album.images[0].url : null,
          duration_ms: qt.duration_ms,
        };
      });
      currentShuffle = state.shuffle;
      currentRepeatMode = state.repeat_mode;
      post({
        type: 'STATE_CHANGED',
        isPlaying: !state.paused,
        position: state.position,
        shuffle: state.shuffle,
        repeatMode: state.repeat_mode,
        track: {
          id: t.id,
          name: t.name,
          artists: t.artists.map(function(a) { return a.name; }).join(', '),
          image: t.album.images[0] ? t.album.images[0].url : null,
          duration_ms: t.duration_ms,
        },
        queue: queue,
      });
      if (state.context && state.context.uri) {
        var uri = state.context.uri;
        var description = (state.context.metadata && state.context.metadata.context_description) || null;
        if (uri !== currentContextUri) {
          currentContextUri = uri;
          currentContextName = null;
        }
        var name = description || contextNameFromUri(uri);
        if (name && name !== currentContextName) {
          currentContextName = name;
          post({ type: 'CONTEXT_NAME', name: name });
        }
      }
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
        currentToken = cmd.token;
        currentContextUri = null;
        currentContextName = null;
        if (sdkReady) initPlayer(cmd.token); else pendingToken = cmd.token;
      } else if (player) {
        if (cmd.type === 'PLAY') player.resume();
        else if (cmd.type === 'PAUSE') player.pause();
        else if (cmd.type === 'NEXT') player.nextTrack();
        else if (cmd.type === 'PREVIOUS') player.previousTrack();
        else if (cmd.type === 'SEEK') player.seek(cmd.position);
        else if (cmd.type === 'TOGGLE_SHUFFLE') player.toggleShuffle(!currentShuffle);
        else if (cmd.type === 'TOGGLE_REPEAT') player.setRepeatMode((currentRepeatMode + 1) % 3);
        else if (cmd.type === 'SKIP') {
          var count = cmd.count || 1;
          (function step(n) { if (n <= 0) return; player.nextTrack().then(function() { setTimeout(function() { step(n - 1); }, 300); }); })(count);
        }
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
function PlayerUI({ onClose, onKill }: { onClose: () => void; onKill: () => void }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= 600;
  const [wideMode, setWideMode] = useState<0 | 1>(1); // 0=fit, 1=two-col
  const cycleMode = () => { if (isWide) setWideMode((m) => (m === 0 ? 1 : 0) as 0 | 1); };
  const { track, isPlaying, position, context, queue, shuffle, repeatMode } = useSpotifyPlayerStore();
  const translateY = useSharedValue(900);

  useEffect(() => {
    translateY.value = withTiming(0, TIMING);
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(900, TIMING, () => runOnJS(onClose)());
  };

  const kill = () => {
    translateY.value = withTiming(900, TIMING, () => runOnJS(onKill)());
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

  // Controls block — reused in fit mode and two-column card
  const controlsBlock = (
    <>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{track?.name ?? '—'}</Text>
        <Text style={styles.trackArtists} numberOfLines={1}>{track?.artists ?? ''}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressTimes}>
          <Text style={styles.timeText}>{msToTime(position)}</Text>
          <Text style={styles.timeText}>{msToTime(track?.duration_ms ?? 0)}</Text>
        </View>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={() => sendPlayerCommand({ type: 'TOGGLE_SHUFFLE' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, alignItems: 'center', width: 36 })}>
          <Ionicons name="shuffle" size={24} color={shuffle ? '#1DB954' : 'rgba(255,255,255,0.5)'} />
          {shuffle && <View style={styles.activeDot} />}
        </Pressable>
        <Pressable onPress={() => sendPlayerCommand({ type: 'PREVIOUS' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Ionicons name="play-skip-back" size={34} color="#fff" />
        </Pressable>
        <Pressable onPress={() => sendPlayerCommand({ type: isPlaying ? 'PAUSE' : 'PLAY' })} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
          <View style={styles.playBtn}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#000" />
          </View>
        </Pressable>
        <Pressable onPress={() => sendPlayerCommand({ type: 'NEXT' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Ionicons name="play-skip-forward" size={34} color="#fff" />
        </Pressable>
        <Pressable onPress={() => sendPlayerCommand({ type: 'TOGGLE_REPEAT' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, alignItems: 'center', width: 36 })}>
          <Ionicons name="repeat" size={24} color={repeatMode > 0 ? '#1DB954' : 'rgba(255,255,255,0.5)'} />
          {repeatMode === 2 ? (
            <Text style={styles.repeatOneLabel}>1</Text>
          ) : repeatMode === 1 ? (
            <View style={styles.activeDot} />
          ) : null}
        </Pressable>
      </View>
      {queue.length > 0 && (
        <View style={styles.queue}>
          <Text style={[styles.queueTitle, { marginBottom: 16 }]}>Next Up</Text>
          {queue.map((qTrack, i) => (
            <Pressable
              key={qTrack.id ?? i}
              onPress={() => sendPlayerCommand({ type: 'SKIP', count: i + 1 })}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <View style={styles.queueItem}>
                {qTrack.image ? (
                  <FadeImage source={{ uri: qTrack.image }} style={styles.queueArt} />
                ) : (
                  <View style={[styles.queueArt, styles.queueArtPlaceholder]}>
                    <Ionicons name="musical-notes" size={14} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.queueTrackName} numberOfLines={1}>{qTrack.name}</Text>
                  <Text style={styles.queueTrackArtists} numberOfLines={1}>{qTrack.artists}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.playerContainer, animStyle]}>
      {/* Blurred album art background */}
      <View style={StyleSheet.absoluteFill}>
        {track?.image ? (
          <Image source={{ uri: track.image }} style={StyleSheet.absoluteFill} blurRadius={50} resizeMode="cover" />
        ) : null}
        <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <Pressable onPress={dismiss} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
              <Ionicons name="chevron-down" size={28} color="rgba(255,255,255,0.8)" />
            </Pressable>
            <Text style={styles.contextName} numberOfLines={1}>{context ?? ''}</Text>
            <Pressable onPress={kill} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
              <Ionicons name="stop-circle-outline" size={26} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>

          {isWide && wideMode === 1 ? (
            // Two-column: artwork left, controls card right
            <View style={{ flex: 1, flexDirection: 'row', alignItems: "center", gap: 32, paddingHorizontal: 28, paddingBottom: insets.bottom }}>
              <View style={{ flex: 1, flexDirection: "column", alignItems: 'center', justifyContent: 'center' }}>
                <Pressable onPress={cycleMode}>
                  {track?.image ? (
                    <FadeImage source={{ uri: track.image }} style={styles.artworkWideSquare} />
                  ) : (
                    <View style={[styles.artworkWideSquare, styles.artworkPlaceholder]}>
                      <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                </Pressable>
              </View>
              <View style={{ width: "40%", justifyContent: 'center', gap: 12 }}>
                <View style={styles.controlsCard}>
                  <View style={[styles.trackInfo, { alignItems: 'center' }]}>
                    <Text style={[styles.trackName, { textAlign: 'center' }]} numberOfLines={1}>{track?.name ?? '—'}</Text>
                    <Text style={[styles.trackArtists, { textAlign: 'center' }]} numberOfLines={1}>{track?.artists ?? ''}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={styles.progressTimes}>
                      <Text style={styles.timeText}>{msToTime(position)}</Text>
                      <Text style={styles.timeText}>{msToTime(track?.duration_ms ?? 0)}</Text>
                    </View>
                  </View>
                  <View style={[styles.controls, { marginBottom: 0 }]}>
                    <Pressable onPress={() => sendPlayerCommand({ type: 'TOGGLE_SHUFFLE' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, alignItems: 'center', width: 36 })}>
                      <Ionicons name="shuffle" size={24} color={shuffle ? '#1DB954' : 'rgba(255,255,255,0.5)'} />
                      {shuffle && <View style={styles.activeDot} />}
                    </Pressable>
                    <Pressable onPress={() => sendPlayerCommand({ type: 'PREVIOUS' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                      <Ionicons name="play-skip-back" size={34} color="#fff" />
                    </Pressable>
                    <Pressable onPress={() => sendPlayerCommand({ type: isPlaying ? 'PAUSE' : 'PLAY' })} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                      <View style={styles.playBtn}>
                        <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#000" />
                      </View>
                    </Pressable>
                    <Pressable onPress={() => sendPlayerCommand({ type: 'NEXT' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                      <Ionicons name="play-skip-forward" size={34} color="#fff" />
                    </Pressable>
                    <Pressable onPress={() => sendPlayerCommand({ type: 'TOGGLE_REPEAT' })} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, alignItems: 'center', width: 36 })}>
                      <Ionicons name="repeat" size={24} color={repeatMode > 0 ? '#1DB954' : 'rgba(255,255,255,0.5)'} />
                      {repeatMode === 2 ? (
                        <Text style={styles.repeatOneLabel}>1</Text>
                      ) : repeatMode === 1 ? (
                        <View style={styles.activeDot} />
                      ) : null}
                    </Pressable>
                  </View>
                </View>
                {queue.length > 0 && (
                  <View style={{ gap: 4, marginTop: 8 }}>
                    <Text style={[styles.queueTitle, { textAlign: 'center' }]}>Next Up</Text>
                    <View style={styles.queueCard}>
                    {queue.map((qTrack, i) => (
                      <Pressable
                        key={qTrack.id ?? i}
                        onPress={() => sendPlayerCommand({ type: 'SKIP', count: i + 1 })}
                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {qTrack.image ? (
                            <FadeImage source={{ uri: qTrack.image }} style={{ width: 30, height: 30, borderRadius: 999, marginLeft: -4 }} />
                          ) : (
                            <View style={[{ width: 30, height: 30, borderRadius: 999, marginLeft: -4 }, styles.queueArtPlaceholder]}>
                              <Ionicons name="musical-notes" size={12} color="rgba(255,255,255,0.3)" />
                            </View>
                          )}
                          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500', maxWidth: 160, marginRight: 8 }} numberOfLines={1}>{qTrack.name}</Text>
                        </View>
                      </Pressable>
                    ))}
                    </View>
                  </View>
                )}

              </View>
            </View>
          ) : (
            // Fit mode (mobile + iPad mode 0): single column
            <View style={[styles.content, { paddingBottom: insets.bottom + 24, maxWidth: 512, width: '100%', alignSelf: 'center' }]}>
              {isWide ? (
                <View style={styles.artworkWideContainer}>
                  <Pressable onPress={cycleMode}>
                    {track?.image ? (
                      <FadeImage source={{ uri: track.image }} style={styles.artworkWide} />
                    ) : (
                      <View style={[styles.artworkWide, styles.artworkPlaceholder]}>
                        <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                  </Pressable>
                </View>
              ) : track?.image ? (
                <FadeImage source={{ uri: track.image }} style={styles.artwork} />
              ) : (
                <View style={[styles.artwork, styles.artworkPlaceholder]}>
                  <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.3)" />
                </View>
              )}
              {controlsBlock}
            </View>
          )}
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main component — always mounted in _layout, hidden WebView + conditional UI
// ---------------------------------------------------------------------------
export function SpotifyPlayer() {
  const webviewRef = useRef<any>(null);
  const lastToken = useRef<string | null>(null);
  const webviewLoaded = useRef(false);
  const { isOpen, isAlive, isPlaying, token, close, kill, setDeviceId, setTrackState, setPosition, setContext } =
    useSpotifyPlayerStore();

  useEffect(() => {
    registerPlayerWebView(webviewRef);
  }, []);

  // Reset refs when killed so re-opening works cleanly
  useEffect(() => {
    if (!isAlive) {
      lastToken.current = null;
      webviewLoaded.current = false;
    }
  }, [isAlive]);

  // Send INIT when token changes and WebView is already loaded
  useEffect(() => {
    if (token && token !== lastToken.current && webviewLoaded.current) {
      lastToken.current = token;
      sendPlayerCommand({ type: 'INIT', token });
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
        setTrackState(msg.isPlaying, msg.track, msg.position, msg.queue ?? [], msg.shuffle ?? false, msg.repeatMode ?? 0);
      } else if (msg.type === 'POSITION') {
        setPosition(msg.position);
      } else if (msg.type === 'CONTEXT_NAME') {
        setContext(msg.name);
      } else if (msg.type === 'AUTH_ERROR') {
        console.warn('[SpotifyPlayer] auth error:', msg.message);
      } else if (msg.type === 'ERROR') {
        alert('Player Error', msg.message ?? 'Unknown Spotify player error');
      } else if (msg.type === 'NOT_READY') {
        alert('Disconnected', 'Spotify player device went offline');
      }
    } catch {}
  };

  return (
    <>
      {/* Hidden WebView — alive until explicitly killed */}
      {WebView && isAlive ? (
        <View style={styles.hiddenWebView}>
          <WebView
            ref={webviewRef}
            source={{ html: PLAYER_HTML }}
            onMessage={handleMessage}
            onLoad={() => {
              webviewLoaded.current = true;
              if (token) {
                lastToken.current = token;
                sendPlayerCommand({ type: 'INIT', token });
              }
            }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            javaScriptEnabled
          />
        </View>
      ) : null}

      {/* Full-screen player UI */}
      {isOpen ? <PlayerUI onClose={close} onKill={kill} /> : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  contextName: {
    flex: 1,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  content: {
    paddingHorizontal: 28,
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    marginBottom: 32,
  },
  artworkWideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  artworkWideSquare: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  artworkWide: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 14,
  },
  controlsCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 32,
  },
  queueCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'center',
    gap: 8,
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
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1DB954',
    marginTop: 3,
  },
  repeatOneLabel: {
    color: '#1DB954',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 9,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queue: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 20,
  },
  queueTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  queueArt: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  queueArtPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueTrackName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  queueTrackArtists: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
