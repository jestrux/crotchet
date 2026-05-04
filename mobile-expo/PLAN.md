# Crotchet Mobile — Expo

Recreating the Crotchet home screen shell in Expo, phased simple to complex.

**Reference project:** `/Users/waky/Documents/web/brandy-native/mobile`
**Source of truth:** `/Users/waky/Documents/web/crotchet/app/MobileApp/CrotchetHomePage/`

## Setup

```bash
bun install
# or: npx expo install --fix  (resolves SDK 55 compatible versions)
bun run ios
```

---

## Phase 1 — Shell

**Goal:** Runnable app with wallpaper and collapsed nav pill. No animation yet.

- [x] Expo SDK 55, TypeScript, NativeWind 4, Expo Router
- [x] `ThemeProvider` — light/dark/system, crotchet color tokens
- [x] `NativeTheme` — applies `dark` class to root View on native
- [x] `WallpaperBackground` — blurred images from `AsyncStorage` preference
  - Light: Unsplash nature photo, covers bottom half, `blurRadius=30`
  - Dark: Unsplash night photo, covers full screen, `blurRadius=12`
  - Reads `homePagePreferences.wallpaper` → `"none" | "auto" | <url>`
  - `LinearGradient` overlay fades wallpaper into background
- [x] `ScrollView` with placeholder content (header scrolls away with content)
- [x] `BottomNav` — static collapsed pill: search icon + "Search", full-width, safe area aware

**Color tokens (crotchet mapping):**

| Token | Light | Dark |
|---|---|---|
| `background` (canvas) | `240 240 240` | `0 0 0` |
| `card` | `255 255 255` | `20 20 20` |
| `foreground` (content) | `0 0 0` | `255 255 255` |
| `stroke` (border) | `226 232 240` | `53 53 53` |

---

## Phase 2 — Nav Expand

**Goal:** The nav pill animates into a full-height panel (Arc Search style).

- [ ] Reanimated spring expand/collapse (`withSpring`, bounce ~0.1, 300ms)
- [ ] Border radius animates `0 → 32px` on top corners as panel opens
- [ ] Dark backdrop overlay fades in (`black/20` light, `black/80` dark)
- [ ] Tap backdrop to dismiss
- [ ] `PanGestureHandler` drag-to-collapse: 90%/10% snap threshold
- [ ] Search `TextInput` appears sticky at top of expanded panel
  - Rounded-full, border, search icon left, clear button right
  - Auto-focus after 80ms delay on expand

**Collapsed position:** `bottom: -(screenHeight - 64 - safeAreaBottom * 0.6)`
**Expanded position:** `bottom: -(screenHeight * 0.35 - 64 - safeAreaBottom * 0.6)`
(65vh of panel visible when expanded)

---

## Phase 3 — Default Expanded Content

**Goal:** Non-searching state shows pinned item pills + action list.

- [ ] `QuickActions` — flex-wrap row of colorful `rounded-xl` pills
  - Each pill: color-coded `size-8 rounded-lg` icon box + uppercase label
  - Mock data matching the 5 original pinned items + their exact colors:

| Label | Light color | Dark color |
|---|---|---|
| Clipboard | `#164e63` | `#7d959f` |
| Pinboard | `#22C55E` | — |
| Now Playing | `#5b21b6` | `#a56bff` |
| Random Pic | `#3B82F6` | — |
| Random Prompt | `#d97706` | `#d19652` |

- [ ] `FlatList` action list below pills (mock items, icon + label rows, `h-12`)
- [ ] Pills hide when `searchQuery.length > 0`, replaced by filtered results

---

## Phase 4 — Scroll + Haptics (Arc Search mechanic)

**Goal:** Scrolling through results changes the active item with haptic feedback.

- [ ] `FlatList` with fixed `ITEM_HEIGHT = 48` (matching `h-12` NavButton)
- [ ] `useSharedValue` tracking scroll offset (Reanimated `onScroll` worklet, UI thread)
- [ ] `activeIndex = Math.floor(scrollY / ITEM_HEIGHT)` derived on UI thread
- [ ] `useAnimatedReaction` watches `activeIndex` → `runOnJS(triggerHaptic)()`
  - `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on each index change
- [ ] Active item renders with `bg-foreground/5` highlight background
- [ ] First item pre-highlighted on expand (index = 0)
- [ ] Submit (keyboard return / tap) executes `actions[activeIndex]`

---

## Key source files

| File | Purpose |
|---|---|
| `app/_layout.tsx` | Root layout: GestureHandler → SafeArea → ThemeProvider → NativeTheme |
| `app/index.tsx` | Home screen: WallpaperBackground + ScrollView + BottomNav |
| `components/WallpaperBackground.tsx` | Blurred wallpaper layer |
| `components/BottomNav.tsx` | Animated search pill + expanded panel |
| `components/theming/ThemeProvider.tsx` | light/dark/system context |
| `components/theming/NativeTheme.tsx` | Applies dark class on native |
| `hooks/useWallpaper.ts` | AsyncStorage preference reader |
| `global.css` | NativeWind CSS variables (crotchet color tokens) |
