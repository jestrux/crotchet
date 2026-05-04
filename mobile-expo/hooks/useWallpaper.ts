import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const PREFS_KEY = 'homePagePreferences';

export function useWallpaper() {
  const [wallpaper, setWallpaper] = useState<string>('auto');

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (!raw) return;
        const prefs = JSON.parse(raw);
        if (prefs?.wallpaper) setWallpaper(prefs.wallpaper);
      })
      .catch(() => {});
  }, []);

  return wallpaper;
}
