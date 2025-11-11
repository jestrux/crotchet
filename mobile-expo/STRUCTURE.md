# Expo Mobile App Structure

## Overview
This Expo app has been restructured based on the Capacitor mobile app patterns found in `/app`. It's now a single-page app with an extension system, using static data for UI development.

## Key Features
- ✅ Single-page app structure (no tabs)
- ✅ Extension registration system
- ✅ Global state management with React Context
- ✅ Bottom navigation with expandable search
- ✅ Action grid for shortcuts
- ✅ Widget system for home screen
- ✅ Static sample data for UI development

## Directory Structure

```
mobile-expo/
├── app/
│   ├── _layout.tsx          # Root layout with providers
│   └── index.tsx             # Main entry point
├── components/
│   ├── ActionGrid.tsx        # Grid of action buttons
│   ├── Widget.tsx            # Card-based widget component
│   ├── BottomNav.tsx         # Bottom navigation bar
│   ├── SearchPanel.tsx       # Expandable search overlay
│   ├── HomePage.tsx          # Main home page layout
│   └── theming/              # Theme system (existing)
├── extensions/
│   ├── clipboard.ts          # Clipboard actions
│   ├── pinboard.ts           # Pinboard widget & actions
│   ├── quick-actions.ts      # Quick action shortcuts
│   └── index.ts              # Extension loader
├── lib/
│   └── registry.ts           # Extension registration system
├── providers/
│   └── AppProvider.tsx       # Global app state
└── types/
    └── index.ts              # TypeScript definitions

```

## Home Page Layout

The home page follows the Capacitor app pattern:

1. **Header**
   - Personalized greeting: "Hey {name},"
   - Subtitle: "Here's how things are looking"

2. **Shortcuts Section**
   - Grid of action buttons
   - Configurable shortcuts (clipboard, pinboard, search, camera)

3. **Widgets Section**
   - Dynamic widget cards
   - Currently: Pinboard widget & Quick actions widget

4. **Bottom Navigation**
   - 3-slot navigation (left, center, right)
   - Center button opens search panel
   - Expandable search with backdrop

## Extension System

Extensions are registered globally using these functions:

### `registerAction(name, config)`
Register actions that appear in shortcuts or search:

```typescript
registerAction('clipboard', {
  label: 'Clipboard',
  icon: 'clipboard',
  color: '#FF6B6B',
  context: 'shortcut', // or 'search'
  handler: async () => {
    // Action handler
  },
});
```

### `registerWidget(name, config)`
Register widgets for the home screen:

```typescript
registerWidget('pinboard-widget', {
  label: 'Pinboard',
  title: 'Pinned Items',
  icon: 'pin',
  actions: [
    { label: 'View All', handler: () => {} }
  ],
  resolve: async () => {
    return { data: [...] };
  },
});
```

## Components

### ActionGrid
Multi-layout action button grid:
- Layouts: `grid`, `inline`, `wrap`
- Icon mapping for common actions
- Press handlers with haptic feedback

### Widget
Card-based widget component:
- Customizable aspect ratio
- Action buttons overlay
- Loading states
- Swipe gestures (future)

### BottomNav
Bottom navigation with search:
- 3 customizable nav items
- Expandable search panel
- Blur backdrop
- Smooth animations

### SearchPanel
Expandable search overlay:
- Search through registered actions
- Quick actions display
- Keyboard handling
- Result filtering

## Current Sample Extensions

### 1. Clipboard (`clipboard.ts`)
- **Actions**: clipboard, copy-text, paste
- **Features**: Read/write clipboard with expo-clipboard

### 2. Pinboard (`pinboard.ts`)
- **Actions**: pinboard, add-to-pinboard
- **Widget**: pinboard-widget
- **Data**: Static pinned items (notes, links, reminders)

### 3. Quick Actions (`quick-actions.ts`)
- **Actions**: search, camera, share, open-link
- **Widget**: quick-actions (recent activity)
- **Data**: Recent action history (static)

## Usage

### Run the app:
```bash
npm start
# or
npm run ios
npm run android
```

### Add a new extension:
1. Create a file in `/extensions/` (e.g., `spotify.ts`)
2. Import and use `registerAction`, `registerWidget`, etc.
3. Import your extension in `/extensions/index.ts`
4. Extension will auto-load on app start

### Add a new shortcut:
In `AppProvider.tsx`, update the shortcuts array:
```typescript
const [shortcuts, setShortcuts] = useState<string[]>([
  'clipboard',
  'pinboard',
  'your-new-action', // Add here
]);
```

## Dependencies

Key Expo packages:
- `expo-clipboard` - Clipboard access
- `expo-blur` - Blur effects for panels
- `expo-sharing` - Share functionality
- `expo-haptics` - Haptic feedback
- `react-native-reanimated` - Smooth animations
- `react-native-gesture-handler` - Gesture support

## Next Steps

To connect real data:
1. Replace static data in extensions with API calls
2. Implement `resolve` functions in widgets
3. Add `listenForUpdates` for real-time sync
4. Connect to backend services (like the Capacitor app does)

## Patterns from Capacitor App

This structure mirrors the Capacitor app (`/app/MobileApp/CrotchetHomePage/`):
- ✅ Extension registration system
- ✅ Action/Widget/Section architecture
- ✅ Event-driven updates (dispatch/listen)
- ✅ TypeScript definitions from `/@types/index.d.ts`
- ✅ Bottom nav with search overlay
- ✅ Customizable shortcuts and widgets
- ✅ Single-page layout

The UI is built with React Native primitives but follows the same conceptual patterns and user experience as the Capacitor mobile app.
