import { Linking } from 'react-native';
import { useActionStore, useWidgetStore, usePageStore, useToastStore, WidgetContentType } from './registry';
import { useSpotifyPlayerStore } from './spotify-player-store';
import { oauth, getToken, saveToken, getPreference, savePreference, withCache } from './globals/auth';
import { playMedia } from './globals/media';
import { promptAI } from './globals/ai';

const noop = () => undefined;
const asyncNoop = async () => undefined;

// Simple event emitter — mirrors desktop's window.dispatchEvent / CustomEvent
const emitter = new Map<string, Set<Function>>();

function setupRuntime() {
  const g = global as any;

  // Allow desktop extensions that use window.xxx to resolve against our globals
  g.window = g;

  g.UI = {
    svg: (path: string, opts?: { filled?: boolean }) => ({
      type: 'svg',
      path,
      filled: opts?.filled ?? false,
    }),
    icon: (name: string) => ({ type: 'icon', name }),
    list: 'list' as WidgetContentType,
    media: 'media' as WidgetContentType,
    grid: 'grid' as WidgetContentType,
    component: noop,
  };

  g.registerAction = (name: string, config: any) => {
    // Skip share/search context actions and desktop-only actions
    if (config?.context || config?.desktopOnly) return;
    useActionStore.getState().addAction({
      name,
      label: config?.label || name,
      icon: config?.icon ?? null,
      color: config?.color,
      handler: config?.handler,
    });
  };

  g.registerWidget = (name: string, config: any) => {
    // Skip widgets with a function as content — they rely on UI.list being callable (desktop only)
    const content = config?.content;
    if (typeof content === 'function') return;
    const validContent: WidgetContentType[] = ['list', 'media', 'grid'];
    useWidgetStore.getState().addWidget({
      name,
      label: config?.label || name,
      title: config?.title,
      icon: config?.icon ?? null,
      content: validContent.includes(content) ? content : null,
    });
  };
  const dataSourceRegistry = new Map<string, any>();
  g.registerDataSource = (_type: string, name: string, config: any) => {
    dataSourceRegistry.set(name, config);
  };
  g.registerSection = noop;
  g.registerPage = noop;

  g.openPage = (config: any) => {
    usePageStore.getState().pushPage({
      title: config?.title,
      type: config?.type,
      resolve: config?.resolve,
      onReady: config?.onReady,
      action: config?.action,
      actions: config?.actions,
    });
  };
  g.openActionSheet = (config: any) => {
    usePageStore.getState().pushPage({
      title: config?.title,
      resolve: typeof config?.actions === 'function' ? config.actions : undefined,
      actions: Array.isArray(config?.actions) ? config.actions : undefined,
      isSheet: true,
    });
  };
  g.openForm = noop;
  g.openAlertForm = noop;
  g.openChoicePicker = asyncNoop;
  g.closePage = () => usePageStore.getState().popPage();

  g.oauth = oauth;
  g.getToken = getToken;
  g.saveToken = saveToken;
  g.getPreference = getPreference;
  g.savePreference = savePreference;
  g.withCache = withCache;

  g.sourceGet = async (source: any, opts: any = {}) => {
    if (typeof source === 'string') source = dataSourceRegistry.get(source);
    const handler = source?.get ?? source?.handler ?? source?.fetch;
    if (typeof handler !== 'function') return null;
    const { cacheKey, invalidateCache, ...payload } = opts;
    if (cacheKey) return withCache(cacheKey, () => handler(payload), { invalidate: invalidateCache });
    return handler(payload);
  };
  g.queryDb = asyncNoop;
  g.dataSources = new Proxy({}, { get: () => ({ latest: asyncNoop, insertRow: asyncNoop, updateRow: asyncNoop, deleteRow: asyncNoop }) });

  g.showToast = (msg: string) => useToastStore.getState().show(msg);
  g.openUrl = (url: string) => Linking.openURL(url);
  g.dispatch = (event: string, payload?: any) => {
    emitter.get(event)?.forEach((h) => h({ type: event, detail: payload }));
  };
  g.addEventListener = (event: string, handler: Function) => {
    if (!emitter.has(event)) emitter.set(event, new Set());
    emitter.get(event)!.add(handler);
  };
  g.removeEventListener = (event: string, handler: Function) => {
    emitter.get(event)?.delete(handler);
  };
  g.socketEmit = noop;
  g.onDesktop = () => false;
  g.playMedia = playMedia;
  g.promptAI = promptAI;
  g.openSpotifyPlayer = (token: string) => useSpotifyPlayerStore.getState().open(token);

  g.readClipboard = asyncNoop;
  g.copyToClipboard = asyncNoop;
  g.copyImage = asyncNoop;
  g.shareImage = asyncNoop;
  g.processShareData = noop;
  g.crawlUrl = asyncNoop;
  g.scanQRCode = asyncNoop;
  g.withLoader = (_action: any) => _action;
  g.confirmDangerousAction = asyncNoop;

  g.random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  g.shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
  g.someTime = (ms: number) => new Promise((r) => setTimeout(r, ms));
  g.randomId = () => Math.random().toString(36).slice(2);
  g.toHms = (s: number) => new Date(s * 1000).toISOString().slice(11, 19).replace(/^00:/, '');
  g.formatDate = (d: any) => new Date(d).toLocaleDateString();
  g.objectToQueryParams = (obj: Record<string, any>) =>
    Object.entries(obj).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  g.camelCaseToSentenceCase = (str: string) =>
    str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  g.isValidUrl = (str: string) => { try { new URL(str); return true; } catch { return false; } };

  g._ = require('lodash');
}

function polyfillWebAPIs() {
  const g = global as any;

  // Response.json() static method — not available in React Native / Hermes
  if (typeof Response !== 'undefined' && !Response.json) {
    (Response as any).json = (data: any, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      });
  }

  // btoa / atob — available in RN 0.64+ but guard just in case
  if (!g.btoa) {
    g.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
    g.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
  }
}

// Auto-run as a side effect on import so extensions can rely on globals
// being set before their module-level code executes.
setupRuntime();
polyfillWebAPIs();
