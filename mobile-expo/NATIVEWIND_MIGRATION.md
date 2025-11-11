# NativeWind & Theming System Migration Plan

This document outlines the complete plan for migrating the Crotchet app from StyleSheet-based styling to NativeWind with a CSS variable-based theming system, based on the sethero-app implementation.

## Overview

**Goal:** Add NativeWind support with a comprehensive theming system and migrate all UI components from StyleSheet to Tailwind classes.

**Source Reference:** `/Users/waky/Documents/web/sethero-app/mobile`

---

## Phase 1: Install Dependencies

```bash
npm install nativewind@^4.1.23
npm install --save-dev tailwindcss@^3.4.17
```

---

## Phase 2: Create Configuration Files

### 1. Create `babel.config.js`

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### 2. Create `metro.config.js`

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })
```

### 3. Create `tailwind.config.js`

```javascript
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        "foreground-inverted": "rgb(var(--color-foreground-inverted) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-primary-muted) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
          muted: "rgb(var(--color-secondary-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
          foreground: "rgb(var(--color-card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--color-popover) / <alpha-value>)",
          foreground: "rgb(var(--color-popover-foreground) / <alpha-value>)",
        },
        stroke: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          foreground: "rgb(var(--color-destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          foreground: "rgb(var(--color-info-foreground) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
```

### 4. Create `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-background: 255 255 255;
    --color-foreground: 9 9 11;
    --color-foreground-inverted: 250 250 250;
    --color-card: 255 255 255;
    --color-card-foreground: 9 9 11;
    --color-popover: 255 255 255;
    --color-popover-foreground: 9 9 11;
    --color-primary: 14 52 114;
    --color-primary-foreground: 250 250 250;
    --color-primary-muted: 228 234 244;
    --color-secondary: 244 244 245;
    --color-secondary-foreground: 9 9 11;
    --color-secondary-muted: 228 228 231;
    --color-muted: 244 244 245;
    --color-muted-foreground: 113 113 122;
    --color-accent: 244 244 245;
    --color-accent-foreground: 9 9 11;
    --color-destructive: 239 68 68;
    --color-destructive-foreground: 250 250 250;
    --color-success: 34 197 94;
    --color-success-foreground: 250 250 250;
    --color-warning: 234 179 8;
    --color-warning-foreground: 9 9 11;
    --color-info: 59 130 246;
    --color-info-foreground: 250 250 250;
    --color-border: 228 228 231;
    --color-input: 228 228 231;
  }

  .dark {
    --color-background: 9 9 11;
    --color-foreground: 250 250 250;
    --color-foreground-inverted: 9 9 11;
    --color-card: 9 9 11;
    --color-card-foreground: 250 250 250;
    --color-popover: 9 9 11;
    --color-popover-foreground: 250 250 250;
    --color-primary: 228 234 244;
    --color-primary-foreground: 14 52 114;
    --color-primary-muted: 39 39 42;
    --color-secondary: 39 39 42;
    --color-secondary-foreground: 250 250 250;
    --color-secondary-muted: 63 63 70;
    --color-muted: 39 39 42;
    --color-muted-foreground: 161 161 170;
    --color-accent: 39 39 42;
    --color-accent-foreground: 250 250 250;
    --color-destructive: 127 29 29;
    --color-destructive-foreground: 250 250 250;
    --color-success: 21 128 61;
    --color-success-foreground: 250 250 250;
    --color-warning: 133 77 14;
    --color-warning-foreground: 250 250 250;
    --color-info: 30 58 138;
    --color-info-foreground: 250 250 250;
    --color-border: 39 39 42;
    --color-input: 39 39 42;
  }
}
```

### 5. Create `nativewind-env.d.ts`

```typescript
/// <reference types="nativewind/types" />

declare module "nativewind" {
  export interface CSSVariables {
    "--color-background": string;
    "--color-foreground": string;
    "--color-foreground-inverted": string;
    "--color-card": string;
    "--color-card-foreground": string;
    "--color-popover": string;
    "--color-popover-foreground": string;
    "--color-primary": string;
    "--color-primary-foreground": string;
    "--color-primary-muted": string;
    "--color-secondary": string;
    "--color-secondary-foreground": string;
    "--color-secondary-muted": string;
    "--color-muted": string;
    "--color-muted-foreground": string;
    "--color-accent": string;
    "--color-accent-foreground": string;
    "--color-destructive": string;
    "--color-destructive-foreground": string;
    "--color-success": string;
    "--color-success-foreground": string;
    "--color-warning": string;
    "--color-warning-foreground": string;
    "--color-info": string;
    "--color-info-foreground": string;
    "--color-border": string;
    "--color-input": string;
  }
}
```

---

## Phase 3: Create Theming System

### Directory Structure

Create `components/theming/` directory with the following files:

### 1. Create `components/theming/ThemeProvider.tsx`

Copy from sethero-app - manages theme state (light/dark/system) and provides useTheme hook.

### 2. Create `components/theming/NativeTheme.tsx`

Copy from sethero-app - applies theme class to View on native platforms.

### 3. Create `components/theming/Theme.tsx`

Copy from sethero-app - render props component for accessing theme colors.

### 4. Create `components/theming/ThemeSwitcher.tsx`

Copy from sethero-app - UI component for switching between light/dark/system themes.

### 5. Create `components/theming/index.ts`

```typescript
export { ThemeProvider, useTheme } from "./ThemeProvider";
export { NativeTheme } from "./NativeTheme";
export { ThemeSwitcher } from "./ThemeSwitcher";
export { default as Theme } from "./Theme";
```

### 6. Create `components/screenOptions.ts`

Copy from sethero-app - helper function for navigation theming.

---

## Phase 4: Update Existing Configuration Files

### 1. Update `tsconfig.json`

Add to `compilerOptions`:
```json
"jsxImportSource": "nativewind"
```

Add to `include` array:
```json
"nativewind-env.d.ts"
```

### 2. Update `app/_layout.tsx`

**Add at the top:**
```typescript
import "../global.css";
```

**Replace ThemeProvider imports and wrap with theming:**
```typescript
import { ThemeProvider, NativeTheme, useTheme } from "@/components/theming";

export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <NativeTheme>
        {/* Existing app content */}
      </NativeTheme>
    </ThemeProvider>
  );
}
```

---

## Phase 5: Migrate UI Components to NativeWind

### Components to Update:

1. **components/themed-text.tsx** - Replace StyleSheet with className prop
2. **components/themed-view.tsx** - Replace StyleSheet with className prop
3. **components/parallax-scroll-view.tsx** - Replace StyleSheet with className
4. **components/hello-wave.tsx** - Replace StyleSheet with className
5. **components/haptic-tab.tsx** - Replace StyleSheet with className
6. **components/external-link.tsx** - Replace StyleSheet with className
7. **components/ui/collapsible.tsx** - Replace StyleSheet with className
8. **app/(tabs)/index.tsx** - Replace StyleSheet with className
9. **app/(tabs)/explore.tsx** - Replace StyleSheet with className
10. **app/(tabs)/_layout.tsx** - Update tab bar theming with getThemeColors
11. **app/_layout.tsx** - Update navigation theming

### Migration Pattern:

**Before (StyleSheet):**
```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});

<View style={styles.container}>
```

**After (NativeWind):**
```typescript
<View className="flex-1 bg-background p-4">
```

### Files to Remove:

- **hooks/use-theme-color.ts** - Replaced by useTheme hook from ThemeProvider

---

## Phase 6: Test & Verify

### Testing Checklist:

1. **Clear Metro Cache:**
   ```bash
   npm start -- --clear
   ```

2. **Build & Test:**
   - Test on iOS (if available)
   - Test on Android (if available)
   - Test on Web

3. **Verify Features:**
   - All screens render correctly
   - Light/dark mode switching works
   - Theme persists across app restarts
   - No StyleSheet.create() remains in components
   - CSS variables properly apply on all platforms

4. **Visual Regression:**
   - Compare before/after screenshots
   - Verify colors match design system
   - Check component spacing and layouts

---

## Migration Notes

### Benefits:
- Faster development with utility classes
- Consistent styling across platforms
- Better dark mode support
- Industry-standard approach
- Smaller component files

### Considerations:
- Team needs to learn Tailwind syntax
- Slightly larger initial bundle size
- Requires NativeTheme wrapper on native platforms

### Coexistence Strategy:
Both styling systems can coexist during migration. New components should use NativeWind, and old components can be migrated gradually.

---

## Troubleshooting

### Common Issues:

1. **Metro bundler errors:** Clear cache with `npm start -- --clear`
2. **TypeScript errors:** Ensure `nativewind-env.d.ts` is included in tsconfig.json
3. **Styles not applying:** Check that global.css is imported in app/_layout.tsx
4. **Dark mode not working on native:** Ensure NativeTheme wrapper is in place
5. **CSS variables not working:** Verify tailwind.config.js has correct RGB format

---

## References

- Source Implementation: `/Users/waky/Documents/web/sethero-app/mobile`
- NativeWind Docs: https://www.nativewind.dev/
- Tailwind CSS Docs: https://tailwindcss.com/docs
