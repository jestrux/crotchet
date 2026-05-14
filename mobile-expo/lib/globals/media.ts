let currentSound: any = null;

export async function playMedia(media: {
  src?: string;
  title?: string;
  subtitle?: string;
  duration?: number;
  actions?: any[];
}): Promise<void> {
  let Audio: any, activateKeepAwakeAsync: any, deactivateKeepAwake: any;

  try {
    ({ Audio } = require('expo-av'));
    ({ activateKeepAwakeAsync, deactivateKeepAwake } = require('expo-keep-awake'));
  } catch {
    console.warn('[playMedia] expo-av / expo-keep-awake not available — rebuild dev client');
    return;
  }

  // Stop anything currently playing
  if (currentSound) {
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
    deactivateKeepAwake();
  }

  if (!media.src) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: media.src },
      { shouldPlay: true }
    );

    currentSound = sound;
    await activateKeepAwakeAsync();

    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        deactivateKeepAwake();
        currentSound = null;
      }
    });
  } catch {
    deactivateKeepAwake?.();
    currentSound = null;
  }
}
