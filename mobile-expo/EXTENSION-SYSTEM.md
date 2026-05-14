# Extension System — mobile-expo

How the crotchet extension system works on Expo, from runtime to developer experience.

---

## Overview

Extensions are single `.ts` files that call global registration functions (`registerAction`, `registerWidget`, etc.) as side effects. The runtime populates these globals before any extension runs, so extensions work identically across desktop (Electron) and mobile (Expo/Hermes).

- **Built-in extensions** — bundled statically, imported at app startup
- **User-installed extensions** — fetched from public gists, stored in Firebase, loaded dynamically
- **Dev mode** — desktop edits sync to Firebase (`__crotchetExtensions`), mobile picks up changes in real time
- **Prod mode** — built-ins load from bundle; user-installed load from Firebase on startup with an update button per extension

---

## Monorepo structure

Extensions live once in `desktop/extensions/` and are shared across platforms:

```
crotchet/
  desktop/extensions/        <- source of truth for all extensions
    spotify.ts
    unsplash.ts
    youtubeClips.ts
    watchlist.ts
    reader.ts
    text-to-qr.ts
    __crotchet.ts
  mobile-expo/
    lib/
      runtime.ts             <- global API surface (registerAction, openPage, etc.)
      registry.ts            <- Zustand store (actions, widgets, pages, dataSources)
      extension-loader.ts    <- loads + executes extension source strings
      firebase-sync.ts       <- Firebase listener for dev hot-reload + installed extensions
    extensions/
      index.ts               <- imports all built-ins at startup
```

---

## How extensions execute

**Desktop:** raw `.ts` source is injected as a `<script>` tag; globals come from `window`.

**Mobile:** globals are set on `global` before execution, then extension source is transpiled and run via `new Function()`:

```ts
// Before any extension runs (lib/runtime.ts — auto-runs on import):
global.window = global;            // desktop extensions use window.xxx — map to global
global.registerAction = ...;       // real implementation
global.registerWidget = noop;      // Phase 3
global.openPage = noop;            // Phase 4
// ... all other globals as noops until their phase

// Execute extension (lib/extension-loader.ts):
const cleaned = source
  .replace(/^import\s+["'][^"']*@types[^"']*["'];?\s*/m, '') // strip type-only import
  .replace(/\bwindow\./g, 'global.');                          // remap window → global

// Hermes' new Function() can't parse async/await — transpile to ES5 first
const result = Babel.transform(cleaned, {
  presets: [['env', { targets: { ie: 11 }, modules: false }]],
  plugins: ['transform-regenerator'],
  sourceType: 'script',
});

// Pass globalThis as 'global' so global.xxx assignments work inside the function
new Function('global', result.code)(globalThis);
```

Key details:
- **`@babel/standalone`** (~1 MB) is used for runtime transpilation — Hermes' `new Function()` rejects `async/await` syntax, so all extension source must be transformed to ES5 before execution
- **`window.` → `global.`** — desktop extensions assign to `window.promptConnectSpotify` etc.; we remap rather than strip to avoid illegal const re-assignment in Babel's strict-mode output
- **`globalThis` injection** — inside `new Function()`, `global` is not in scope in Hermes; we pass it explicitly as a parameter

---

## Developer experience

The `@types/index.d.ts` file at the monorepo root is the SDK — it provides ambient TypeScript declarations for all globals. Any `.ts` file in a project that references it gets full autocomplete with no imports needed.

To develop an extension:
1. Add a `.ts` file to `desktop/extensions/`
2. The desktop app picks it up from the filesystem immediately
3. The desktop syncs the source to Firebase (`__crotchetExtensions`)
4. The mobile app (in dev mode) receives the update via Firebase listener and re-executes the extension
5. Publish by pushing to a public gist — users install via URL paste or QR scan

---

## API surface

### Registration
| API | Status |
|---|---|
| `registerAction(name, config)` | Phase 2 ✅ |
| `registerWidget(name, config)` | Phase 3 |
| `registerDataSource(type, name, config)` | Phase 6 ✅ |
| `registerSection(name, config)` | Phase 12 |

### Navigation
| API | Status |
|---|---|
| `openPage(props)` | Phase 4 |
| `openActionSheet(props)` | Phase 4 |
| `openForm(props)` | Phase 10 |
| `openAlertForm(props)` | Phase 10 |
| `openChoicePicker(choices)` | Phase 10 |
| `closePage()` | Phase 4 |

### Data / Database
| API | Status |
|---|---|
| `sourceGet(source, opts)` | Phase 6 ✅ |
| `queryDb(table, opts)` | Phase 8 |
| `dataSources.x.insertRow()` | Phase 9 |
| `dataSources.x.updateRow()` | Phase 9 |
| `dataSources.x.deleteRow()` | Phase 9 |
| `dataSources.x.latest()` | Phase 8 |

### Auth / Tokens / Storage
| API | Status |
|---|---|
| `oauth(props)` | Phase 5 ✅ |
| `getToken(key)` / `saveToken(key, val)` | Phase 5 ✅ |
| `getPreference(key)` / `savePreference(key, val)` | Phase 5 ✅ |
| `withCache(name, fn)` | Phase 5 ✅ |

### Network
| API | Status |
|---|---|
| `crawlUrl(url, opts)` | Phase 11 — fetch + og:meta parse |
| `readNetworkFile(url)` | Phase 14 |
| `uploadStringAsFile(data, opts)` | Phase 14 |
| `scanNetwork()` | Phase 14 |

### Clipboard / Share
| API | Status |
|---|---|
| `readClipboard()` | Phase 11 — expo-clipboard |
| `copyToClipboard(text)` | Phase 11 — expo-clipboard |
| `copyImage(url)` | Phase 14 — expo-media-library |
| `shareImage(url)` | Phase 14 — expo-sharing |
| `processShareData(val, type)` | Phase 11 |
| `scanQRCode()` | Phase 13 — expo-camera |

### Events / Remote
| API | Status |
|---|---|
| `dispatch(event, payload)` | Phase 6 ✅ |
| `socketEmit(event, payload)` | Phase 13 — existing socket bridge |

### Media / AI
| API | Status |
|---|---|
| `playMedia(media)` | Phase 7 ✅ |
| `promptAI(prompt, opts)` | Phase 7 ✅ |
| `UI.youtubePlayer` | Phase 3 — expo-av + WebView |

### UI Components
| API | Status |
|---|---|
| `UI.svg(path, opts)` | Phase 3 — react-native-svg |
| `UI.icon(name)` | Phase 3 — Ionicons |
| `UI.list` | Phase 3 — FlatList renderer |
| `UI.media` | Phase 3 — image + gradient overlay |
| `UI.grid` | Phase 3 — grid FlatList renderer |
| `UI.component` | **Not ported** — no-op, extensions that call it render nothing for that slot |

### Utilities
| API | Status |
|---|---|
| `showToast(msg)` | Phase 6 ✅ |
| `openUrl(url)` | Phase 6 ✅ |
| `withLoader(action, opts)` | Phase 9 |
| `confirmDangerousAction()` | Phase 9 — Alert |
| `onDesktop()` | Phase 2 ✅ — always false |
| `random(arr)`, `shuffle(arr)` | Phase 6 ✅ |
| `someTime(ms)`, `randomId()` | Phase 6 ✅ |
| `toHms(s)`, `formatDate(d)` | Phase 6 ✅ |
| `objectToQueryParams(obj)` | Phase 6 ✅ |
| `camelCaseToSentenceCase(str)` | Phase 6 ✅ |
| `isValidUrl(str)` | Phase 6 ✅ |
| `_` (lodash) | Phase 6 ✅ |
| `moment` | Phase 14 — exposed as global |
| `tinycolor` | Phase 14 — exposed as global |

---

## Phases

Each phase ships something you can see and interact with. Phases are small by design — fast turnaround, real feedback.

---

### Phase 1 — Extensions page ✅

**Ship:** A dedicated Extensions screen. On first launch, extensions are fetched from Firebase and stored locally. After that, they load from local storage — Firebase is only hit when you explicitly update.

**Build:**
- `lib/registry.ts` — Zustand store with `extensions` map: `{ name, source, installedAt, updatedAt }`
- `lib/firebase-sync.ts` — two modes:
  - **Prod**: one-time fetch from `__crotchetExtensions` on first launch (no extensions in AsyncStorage yet), persists to AsyncStorage; subsequent launches load from AsyncStorage
  - **`__DEV__` only**: real-time Firestore listener for hot-reload while actively developing
- Extensions screen (reachable from BottomNav or settings) — flat list showing `@name`, `@description`, `@icon`, `@version` parsed from the top comment block of each extension source; each row has an **Update** button that re-fetches that extension from Firebase on demand

**Verify:** (all extensions — `spotify.ts`, `unsplash.ts`, `youtubeClips.ts`, `watchlist.ts`, `reader.ts`, `text-to-qr.ts`, `__crotchet.ts`)
- [ ] First launch: spinner appears briefly, then extensions list populates
- [ ] Subsequent launches: list appears instantly from local storage (no network)
- [ ] Each row shows the extension name, icon, description, and version from its comment block
- [ ] Tapping Update on a row re-fetches that extension from Firebase
- [ ] In `__DEV__`: editing an extension on desktop and saving it syncs to the list in real time

---

### Phase 2 — registerAction → BottomNav ✅

**Ship:** Extensions execute. Registered actions appear in the BottomNav even though tapping them does nothing yet.

**Build:**
- `lib/runtime.ts` — sets all globals on `global` as a side effect on import; `global.window = global` for desktop extension compat
- `lib/extension-loader.ts` — strips type-only import, remaps `window.` → `global.`, transpiles to ES5 via `@babel/standalone` (Hermes compat), executes via `new Function('global', code)(globalThis)`
- `global.registerAction` — pushes `{ name, label, icon, color }` into Zustand `actions` store; all other globals are no-ops
- BottomNav quick-action chips + section list wired to the `actions` store

**Verify:** (`spotify.ts`, `unsplash.ts`, `reader.ts`, `watchlist.ts`, `youtubeClips.ts`)
- [x] BottomNav quick-action chips show real actions registered by extensions (Spotify, Reader, etc.)
- [x] BottomNav section list shows all registered actions grouped (not the hardcoded placeholders)
- [x] Tapping any action shows a "not yet implemented" Alert
- [x] Search in BottomNav filters real registered actions

---

### Phase 3 — registerWidget → Home widgets

**Ship:** Widgets from extensions render on the home screen.

**Build:**
- `global.registerWidget` stub — pushes widget config into Zustand `widgets` store
- Home screen widget renderer — iterates registered widgets, renders based on `UI.list` or `UI.media` shape
- `UI.list` renderer — `FlatList` with title/subtitle/icon rows
- `UI.media` renderer — full-bleed image card with gradient overlay
- `UI.svg`, `UI.icon` — `react-native-svg` + Ionicons wrappers
- `UI.component` — no-op (returns null)

**Verify:** (`spotify.ts` → `UI.list` widget, `unsplash.ts` → `UI.media` widget, `youtubeClips.ts` → `UI.list` widget)
- [ ] Home screen shows widget shells registered by extensions (Spotify, Unsplash, youtubeClips)
- [ ] Widgets render in registration order, replacing the hardcoded home screen placeholders
- [ ] `UI.list` widget shows correct header icon + title, empty list body
- [ ] `UI.media` widget shows correct aspect ratio card with gradient, no image yet

---

### Phase 4 — openPage ✅

**Ship:** Extensions can open pages. A page layer slides up with content.

**Build:**
- `ActionRecord` now stores `handler` — registered by `registerAction`, called by BottomNav instead of Alert
- `PageRecord` type + `usePageStore` — a push/pop stack of pages in Zustand
- `global.openPage(config)` — pushes `{ title, type, resolve, onReady, action, actions }` onto the page stack; `title` may be a string or `({ pageData }) => string`
- `global.openActionSheet(config)` — pushes a sheet-type page (bottom-anchored, renders action list)
- `global.closePage()` — pops the top page; also passed as a parameter to `onReady`
- `components/PageLayer.tsx` — renders top of stack as a slide-up modal; calls `resolve()`, shows loading → empty state; drag-down or close button dismisses
- `app/_layout.tsx` — `AppShell` wrapper: when any page is open, the Stack scales to 0.92, gains 16px border radius, and dims to 0.85 opacity (iOS card-stack feel); background is black so the gap shows depth

**Verify:**
- [x] Tapping a BottomNav action slides up a page modal
- [x] Page shows the title from the extension's `openPage` call
- [x] Empty list / error state renders gracefully when data isn't available yet
- [x] Back gesture or close button dismisses the page
- [x] Tapping an action sheet option logs to console (no-op is fine)

---

### Phase 5 — oauth + tokens

**Ship:** OAuth flow works. Extensions can authenticate with external services.

**Build:**
- `global.oauth({ authUrl, tokenUrl, clientId, scopes, redirectUri })` — `expo-auth-session` PKCE flow
- `global.getToken(key)` / `global.saveToken(key, val)` — `expo-secure-store`
- `global.getPreference(key)` / `global.savePreference(key, val)` — `AsyncStorage`
- `global.withCache(name, fn)` — `AsyncStorage` TTL cache

**Verify:** (`spotify.ts` — only extension using `oauth` at this stage)
- [ ] Tapping Spotify's "Connect" action opens a browser OAuth window
- [ ] After authorizing, the browser closes and the app resumes
- [ ] Tapping "Connect" again skips the browser (token already stored)
- [ ] `getPreference` / `savePreference` round-trips correctly (can test with a debug log)

---

### Phase 6 — sourceGet + real data

**Ship:** Extensions fetch real data. Spotify loads tracks. Unsplash loads photos.

**Build:**
- `global.sourceGet(source, opts)` — calls `source.handler(opts)`, returns data
- `global.showToast(msg)` — toast notification
- `global.openUrl(url)` — `Linking.openURL`
- `global.dispatch(event, payload)` — local event emitter (`mitt`)
- `global.onDesktop()` — always returns `false`
- Utility globals: `random`, `shuffle`, `someTime`, `randomId`, `toHms`, `formatDate`, `objectToQueryParams`, `camelCaseToSentenceCase`, `isValidUrl`
- `global._` — lodash

**Verify:** (`spotify.ts` → tracks/playlists, `unsplash.ts` → photos via `sourceGet` handler)
- [ ] Spotify widget populates with real tracks from your library
- [ ] Unsplash widget shows a real photo with title + photographer name
- [ ] Tapping a Spotify action opens a page with a real track list
- [ ] Toast appears on `showToast` calls
- [ ] `openUrl` opens a URL in the system browser

---

### Phase 7 — playMedia + keep-awake

**Ship:** Audio plays. Screen stays on while Spotify is playing.

**Build:**
- `global.playMedia(media)` — `expo-av` Audio playback
- `global.promptAI(prompt, opts)` — Claude API call (streaming optional)
- `expo-keep-awake` — `activateKeepAwake` / `deactivateKeepAwake` based on Spotify `is_playing` state

**Verify:** (`spotify.ts` — `playMedia` for preview clips, `promptAI` for AI track insights)
- [ ] Tapping a track preview plays audio through the device speaker
- [ ] Screen stays on while audio is playing, locks again after it stops
- [ ] "Add AI insights" on a track returns a response from Claude
- [ ] Killing and reopening the app resumes from the correct playback state

---

### Phase 8 — registerDataSource (db) + queryDb

**Ship:** Firestore-backed data sources register and read data.

**Build:**
- `lib/db.ts` — shared Firestore path helper: all tables live at `__db/{table}/data`. Centralises this so nothing else needs to know the path structure:
  ```ts
  export const dbPath = (table: string) => ['__db', table, 'data'] as const;
  ```
- `global.registerDataSource("db", name, config)` — wraps a Firestore collection via `dbPath`
- `global.queryDb(table, opts)` — Firestore query helper using `dbPath`
- `global.dataSources[name].latest()` — most recent N rows

**Verify:** (`youtubeClips.ts`, `watchlist.ts`, `reader.ts` — all use `registerDataSource("db", ...)`)
- [ ] Opening the youtubeClips page shows real clips from Firestore
- [ ] Opening the watchlist page shows real titles from Firestore
- [ ] Pulling to refresh (or tapping refresh) re-fetches from Firestore
- [ ] Empty state renders correctly when the collection has no documents

---

### Phase 9 — CRUD operations

**Ship:** Extensions can add, edit, and delete rows. Watchlist and reader are fully functional.

**Build:**
- `global.dataSources[name].insertRow(data)`
- `global.dataSources[name].updateRow(id, data)`
- `global.dataSources[name].deleteRow(id)`
- `global.confirmDangerousAction()` — `Alert.alert` confirmation
- `global.withLoader(action, opts)` — loading/success/error state wrapper

**Verify:** (`watchlist.ts` → add/delete titles, `reader.ts` → add/delete bookmarks, `youtubeClips.ts` → add/delete clips)
- [ ] Tapping "Add" in watchlist adds a row to Firestore and it appears in the list immediately
- [ ] Tapping "Delete" shows a confirmation, then removes the row from Firestore and the list
- [ ] Editing a row updates the Firestore document and the list reflects the change
- [ ] `withLoader` shows a spinner during the async operation and a success state after

---

### Phase 10 — openForm + openAlertForm

**Ship:** Extensions can present forms for user input.

**Build:**
- `global.openForm({ fields, onSubmit })` — modal form renderer (text, url, select field types)
- `global.openAlertForm({ message, fields, onSubmit })` — inline alert-style form
- `global.openChoicePicker(choices)` — bottom sheet choice list

**Verify:** (`reader.ts` → `openForm` for adding URLs, `watchlist.ts` → `openAlertForm`, `youtubeClips.ts` → `openForm` for adding clips + `openChoicePicker` for quality selection)
- [ ] "Add to watchlist" opens a form modal with the correct fields
- [ ] Submitting the form saves the data and dismisses the modal
- [ ] `openAlertForm` shows an inline alert with input fields
- [ ] `openChoicePicker` shows a bottom sheet list; selecting an option returns the value to the extension

---

### Phase 11 — clipboard + crawlUrl

**Ship:** Clipboard reads/writes work. URLs can be scraped for metadata.

**Build:**
- `global.readClipboard()` — `expo-clipboard`
- `global.copyToClipboard(text)` — `expo-clipboard`
- `global.processShareData(val, type)` — normalise clipboard/share payloads
- `global.crawlUrl(url, opts)` — `fetch` + parse `og:` meta tags

**Verify:** (`reader.ts` → `readClipboard`, `crawlUrl`, `processShareData`; `youtubeClips.ts` → `readClipboard` for pasting YouTube URLs)
- [ ] "Add from clipboard" in reader reads a URL from the clipboard
- [ ] Pasting a URL into reader's add form auto-fills the title and description via `crawlUrl`
- [ ] `copyToClipboard` copies text and a toast confirms it
- [ ] `processShareData` normalises a shared URL correctly

---

### Phase 12 — registerDataSource (custom) + sections

**Ship:** Custom fetch-backed data sources work. Home page sections from extensions render.

**Build:**
- `global.registerDataSource("custom", name, config)` — arbitrary async fetch handler
- `global.registerSection(name, config)` — home page section slots
- Home screen section renderer — renders registered sections between fixed widgets

**Verify:** (`unsplash.ts` → `registerDataSource("custom", ...)`, `youtubeClips.ts` + `reader.ts` → `registerSection`)
- [ ] Unsplash widget loads a real photo via the custom data source handler
- [ ] youtubeClips section appears on the home screen between other widgets
- [ ] Sections render in registration order
- [ ] Navigating to the Unsplash action page shows a grid/list of photos from the custom source

---

### Phase 13 — socketEmit + remote

**Ship:** Cross-device actions work. Tapping an action on mobile triggers it on desktop.

**Build:**
- `global.socketEmit(event, payload)` — wired to existing desktop socket bridge
- `global.scanQRCode()` — `expo-camera` barcode scanner

**Verify:** (`youtubeClips.ts` → `socketEmit` for desktop playback; `watchlist.ts` → `scanQRCode` for lookup)
- [ ] Tapping "Play on desktop" in youtubeClips triggers playback on the connected desktop
- [ ] The desktop receives the socket event and responds (confirm in desktop logs)
- [ ] QR scanner opens the camera and reads a code
- [ ] Scanned QR result is passed back to the calling extension correctly

---

### Phase 14 — Complete coverage

**Ship:** Every remaining API implemented. All extensions fully functional.

**Build:**
- `global.copyImage(url)` — `expo-media-library`
- `global.shareImage(url)` — `expo-sharing`
- `global.readNetworkFile(url)` — fetch from network path
- `global.uploadStringAsFile(data, opts)` — Firebase Storage upload
- `global.scanNetwork()` — local network scanner
- `global.moment` — exposed as global
- `global.tinycolor` — exposed as global
- Extension update button — re-fetches from stored gist URL, updates Firebase doc
- Extension install via URL paste or QR scan

**Extensions working:** `text-to-qr.ts`, `__crotchet.ts`, `fun-with-ai.ts`, `prompt-fun.ts`

**Verify:** (`unsplash.ts` → `copyImage`, `shareImage`; `__crotchet.ts` → `readNetworkFile`, `uploadStringAsFile`, `scanNetwork`, `moment`, `tinycolor`; `text-to-qr.ts` → extension install flow)
- [ ] `copyImage` saves an image to the camera roll and a toast confirms
- [ ] `shareImage` opens the native share sheet with the image
- [ ] Extension install via pasted gist URL fetches and registers the extension
- [ ] Extension install via QR code scan fetches and registers the extension
- [ ] Update button on an installed extension re-fetches the latest source from its gist URL
- [ ] `scanNetwork` returns a list of devices on the local network

---

## What is not ported

| Feature | Reason |
|---|---|
| `UI.component({content: htmlString})` | HTML string rendering has no clean native equivalent. Extensions that call it get a no-op — the rest of the extension still works. |
| Desktop-only actions (`desktopOnly: true`) | Filtered out at registration time — never appear in mobile registry. |
| `openFloatingWindow` | Desktop-specific, no mobile equivalent. |
