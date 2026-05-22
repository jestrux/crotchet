import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

// ---------------------------------------------------------------------------
// Backend base URL
// ---------------------------------------------------------------------------

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? '';

// ---------------------------------------------------------------------------
// Token storage (expo-secure-store)
// Format matches desktop: { value: string, expiresAt: number }
// where value is JSON.stringify(tokenObject) or a plain string token
// ---------------------------------------------------------------------------

const sanitiseKey = (key: string) => `tok_${key.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 250)}`;

export async function getToken(key: string): Promise<any> {
  try {
    const raw = await SecureStore.getItemAsync(sanitiseKey(key));
    if (!raw) return null;
    const stored = JSON.parse(raw) as { value: string; expiresAt: number };
    if (stored.expiresAt && Date.now() > stored.expiresAt) {
      await SecureStore.deleteItemAsync(sanitiseKey(key));
      return null;
    }
    try { return JSON.parse(stored.value); } catch { return stored.value; }
  } catch {
    return null;
  }
}

export async function saveToken(key: string, value: any, expiresIn?: number): Promise<void> {
  const k = sanitiseKey(key);
  try {
    if (value === null || value === undefined) {
      await SecureStore.deleteItemAsync(k);
      return;
    }
    const stored = {
      value: typeof value === 'string' ? value : JSON.stringify(value),
      expiresAt: Date.now() + (expiresIn ?? 365 * 24 * 3600) * 1000,
    };
    await SecureStore.setItemAsync(k, JSON.stringify(stored));
  } catch {
    // SecureStore unavailable in some simulators — silent fail
  }
}

// ---------------------------------------------------------------------------
// Preference storage (AsyncStorage) — non-sensitive settings
// ---------------------------------------------------------------------------

export async function getPreference(key: string): Promise<any> {
  try {
    const raw = await AsyncStorage.getItem(`pref:${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function savePreference(key: string, value: any): Promise<void> {
  try {
    await AsyncStorage.setItem(`pref:${key}`, JSON.stringify(value));
  } catch {}
}

// ---------------------------------------------------------------------------
// Cache (AsyncStorage) with TTL
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes default

type CacheEntry = { value: any; expiresAt: number };

export async function withCache(
  name: string,
  fn: () => Promise<any>,
  opts?: { invalidate?: boolean }
): Promise<any> {
  const key = `cache:${name}`;
  if (!opts?.invalidate) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() < entry.expiresAt) return entry.value;
      }
    } catch {}
  }
  const value = await fn();
  try {
    const entry: CacheEntry = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {}
  return value;
}

// ---------------------------------------------------------------------------
// OAuth token refresh
// ---------------------------------------------------------------------------

async function refreshOAuthToken({
  tokenExchangeUrl,
  preferenceKey,
  params,
}: {
  tokenExchangeUrl: string;
  preferenceKey: string;
  params: Record<string, string>;
}): Promise<{ access_token: string } | null> {
  try {
    const saved = await getToken(preferenceKey);
    if (!saved?.refresh_token) return null;

    const res = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ...params,
        grant_type: 'refresh_token',
        refresh_token: saved.refresh_token,
      }).toString(),
    });

    if (!res.ok) return null;

    const tokenDetails = await res.json();
    if (!tokenDetails.refresh_token) {
      console.log('[refreshOAuthToken] no new refresh_token in response — preserving existing');
    }
    await saveToken(preferenceKey, {
      refresh_token: saved.refresh_token, // preserve old refresh_token as fallback
      ...tokenDetails,
      expires_at: Date.now() + Number(tokenDetails.expires_in ?? 3600) * 1000,
    });

    return tokenDetails;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// OAuth redirect handler — call from your deep-link listener at app startup
// Parses token data from crotchet:// URL params and persists the token.
// ---------------------------------------------------------------------------

export async function handleOauthRedirect(url: string): Promise<void> {
  try {
    const { queryParams } = Linking.parse(url);
    if (!queryParams?.access_token) return;

    const { from_oauth: _fo, preferenceKey, ...tokenData } =
      queryParams as Record<string, string>;
    if (!preferenceKey) return;

    await saveToken(preferenceKey, {
      ...tokenData,
      expires_at: Date.now() + Number(tokenData.expires_in ?? 3600) * 1000,
    });
  } catch {
    // silent
  }
}

// ---------------------------------------------------------------------------
// OAuth via backend proxy (mirrors the desktop crotchet app flow)
// ---------------------------------------------------------------------------

type OAuthConfig = {
  authorizeUrl: string;
  tokenExchangeUrl: string;
  preferenceKey: string;
  params: Record<string, string>;
  readOnly?: boolean;
};

export async function oauth(config: OAuthConfig): Promise<string | null> {
  const { authorizeUrl, tokenExchangeUrl, preferenceKey, params, readOnly } = config;

  // Always check storage first — skip the browser if a valid token exists
  const saved = await getToken(preferenceKey);
  if (saved?.access_token) {
    const expiresAt = saved.expires_at ?? Date.now() - 20_000;
    if (Date.now() <= expiresAt) return saved.access_token;
    // Expired — try refresh
    return (await refreshOAuthToken({ tokenExchangeUrl, preferenceKey, params }))?.access_token ?? null;
  }

  if (readOnly) return null;

  // Build auth URL — merge params into query string
  const authUrl = new URL(authorizeUrl);
  const mergedParams = {
    ...Object.fromEntries(authUrl.searchParams.entries()),
    ...(params ?? {}),
  };
  authUrl.search = new URLSearchParams(mergedParams).toString();

  // Build redirect URL — backend will redirect here with token data
  const appScheme = (Constants.expoConfig?.scheme as string) ?? 'crotchet';
  const redirectUrl = new URL(`${appScheme}://`);
  redirectUrl.search = new URLSearchParams({
    ...mergedParams,
    tokenExchangeUrl,
    preferenceKey,
  }).toString();

  // Ask backend to create a proxy auth URL
  let proxyAuthUrl: string;
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: authUrl.toString(), redirectUrl: redirectUrl.toString() }),
    });
    proxyAuthUrl = await res.json();
  } catch {
    return null;
  }

  if (!proxyAuthUrl) return null;

  // ASWebAuthenticationSession — watches for our scheme and closes automatically
  const result = await WebBrowser.openAuthSessionAsync(proxyAuthUrl, `${appScheme}://`);

  if (result.type !== 'success') return null;

  await handleOauthRedirect(result.url);
  return (await getToken(preferenceKey))?.access_token ?? null;
}
