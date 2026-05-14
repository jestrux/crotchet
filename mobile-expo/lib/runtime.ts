import { useActionStore } from './registry';

const noop = () => undefined;
const asyncNoop = async () => undefined;

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
    list: null,
    media: null,
    grid: null,
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
    });
  };

  g.registerWidget = noop;
  g.registerDataSource = noop;
  g.registerSection = noop;
  g.registerPage = noop;

  g.openPage = noop;
  g.openActionSheet = noop;
  g.openForm = noop;
  g.openAlertForm = noop;
  g.openChoicePicker = asyncNoop;
  g.closePage = noop;

  g.oauth = asyncNoop;
  g.getToken = asyncNoop;
  g.saveToken = asyncNoop;
  g.getPreference = asyncNoop;
  g.savePreference = asyncNoop;
  g.withCache = (_name: string, fn: () => any) => fn();

  g.sourceGet = asyncNoop;
  g.queryDb = asyncNoop;
  g.dataSources = new Proxy({}, { get: () => ({ latest: asyncNoop, insertRow: asyncNoop, updateRow: asyncNoop, deleteRow: asyncNoop }) });

  g.showToast = noop;
  g.openUrl = noop;
  g.dispatch = noop;
  g.socketEmit = noop;
  g.onDesktop = () => false;
  g.playMedia = asyncNoop;
  g.promptAI = asyncNoop;

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

  // Expose lodash if available
  try { g._ = require('lodash'); } catch { g._ = {}; }
}

// Auto-run as a side effect on import so extensions can rely on globals
// being set before their module-level code executes.
setupRuntime();
