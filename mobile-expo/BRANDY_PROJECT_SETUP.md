# Brandy Mobile Project Setup Plan

This document outlines the complete plan for creating a new Brandy mobile project based on the current Crotchet setup.

## Overview

**Goal:** Create a new project called "Brandy" at `/Users/waky/Documents/web/brandy-mobile` based on the current Crotchet project structure with proper branding and configuration.

**Source Project:** `/Users/waky/Documents/web/crotchet/mobile-expo`

---

## Project Configuration

### Branding Details:

- **Project Folder:** `brandy-mobile`
- **Package Name:** `brandy-mobile`
- **App Names:**
  - Development: "Brandy (Dev)"
  - Staging: "Brandy (Staging)"
  - Production: "Brandy"
- **Bundle ID Pattern:** `com.brandyhq.app` with variants
  - Development: `com.brandyhq.app.dev`
  - Staging: `com.brandyhq.app.staging`
  - Production: `com.brandyhq.app`
- **URL Schemes:**
  - Development: `brandy-dev`
  - Staging: `brandy-staging`
  - Production: `brandy`
- **Slug:** `Brandy`

---

## Phase 1: Copy Project Structure

### 1. Copy Entire Project

```bash
cd /Users/waky/Documents/web
cp -r crotchet/mobile-expo brandy-mobile
cd brandy-mobile
```

### 2. Clean Up Generated/Build Files

```bash
rm -rf node_modules
rm -rf .expo
rm -f expo-env.d.ts
rm -rf ios         # if exists
rm -rf android     # if exists
rm -rf dist        # if exists
rm -rf web-build   # if exists
```

### Optional: Remove Project-Specific Files

```bash
rm -rf .claude     # Optional: remove if you don't want shared Claude settings
```

---

## Phase 2: Update Configuration Files

### 1. Update `app.config.js`

**Find and Replace:**

```javascript
// Line 5
- 'Crotchet (Dev)'
+ 'Brandy (Dev)'

// Line 6
- 'Crotchet (Staging)'
+ 'Brandy (Staging)'

// Line 7
- 'Crotchet'
+ 'Brandy'

// Lines 11-13 (iOS Bundle Identifiers)
- 'tz.co.akil.crotchet.dev'
+ 'com.brandyhq.app.dev'

- 'tz.co.akil.crotchet.staging'
+ 'com.brandyhq.app.staging'

- 'tz.co.akil.crotchet'
+ 'com.brandyhq.app'

// Lines 17-19 (Android Package Names)
- 'tz.co.akil.crotchet.dev'
+ 'com.brandyhq.app.dev'

- 'tz.co.akil.crotchet.staging'
+ 'com.brandyhq.app.staging'

- 'tz.co.akil.crotchet'
+ 'com.brandyhq.app'

// Lines 23-25 (URL Schemes)
- 'crotchet-dev'
+ 'brandy-dev'

- 'crotchet-staging'
+ 'brandy-staging'

- 'crotchet'
+ 'brandy'

// Line 61 (Slug)
- slug: 'Crotchet'
+ slug: 'Brandy'

// Line 112 (Project ID - REMOVE for now)
- projectId: '9894f611-7fb9-47f4-9551-1c32df1c68e3'
+ // projectId will be set after running eas init
```

### Complete Updated `app.config.js` Structure:

```javascript
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

const getAppName = () => {
  if (IS_DEV) return 'Brandy (Dev)';
  if (IS_STAGING) return 'Brandy (Staging)';
  return 'Brandy';
};

const getBundleIdentifier = () => {
  if (IS_DEV) return 'com.brandyhq.app.dev';
  if (IS_STAGING) return 'com.brandyhq.app.staging';
  return 'com.brandyhq.app';
};

const getAndroidPackage = () => {
  if (IS_DEV) return 'com.brandyhq.app.dev';
  if (IS_STAGING) return 'com.brandyhq.app.staging';
  return 'com.brandyhq.app';
};

const getScheme = () => {
  if (IS_DEV) return 'brandy-dev';
  if (IS_STAGING) return 'brandy-staging';
  return 'brandy';
};

// ... rest of config with slug: 'Brandy'
```

### 2. Update `package.json`

**Find and Replace:**

```json
// Line 2
- "name": "mobile-expo"
+ "name": "brandy-mobile"
```

---

## Phase 3: Replace Assets (Icons & Branding)

### Icon Source Files to Replace:

Located in `assets/images/`:

1. **icon-source.png** - Main app icon (used for app icon and splash screen)
2. **android-icon-foreground-source.png** - Android adaptive icon foreground
3. **android-icon-monochrome-source.png** - Android adaptive icon monochrome
4. **android-icon-background.png** - Android adaptive icon background (optional)
5. **favicon.png** - Web favicon (optional)

### Steps:

1. Design Brandy branding icons
2. Replace the source files listed above
3. Delete existing generated variant icons:
   ```bash
   rm assets/images/icon-dev.png
   rm assets/images/icon-staging.png
   rm assets/images/icon.png
   rm assets/images/splash-icon-dev.png
   rm assets/images/splash-icon-staging.png
   rm assets/images/splash-icon.png
   rm assets/images/android-icon-foreground-dev.png
   rm assets/images/android-icon-foreground-staging.png
   rm assets/images/android-icon-foreground.png
   rm assets/images/android-icon-monochrome-dev.png
   rm assets/images/android-icon-monochrome-staging.png
   rm assets/images/android-icon-monochrome.png
   ```
4. Regenerate all variants (see Phase 5)

---

## Phase 4: Install Dependencies

```bash
npm install
```

This will:
- Install all dependencies from package.json
- Regenerate package-lock.json
- Create node_modules directory

**Expected Time:** 2-5 minutes depending on network speed

---

## Phase 5: Generate Icon Variants

After replacing source icons, generate all variant icons:

```bash
npm run generate-icons
```

This script will:
- Generate dev/staging/production variants for all icons
- Add badges to dev (DEV) and staging (STAGE) icons
- Create splash screen variants
- Use #3E3215 background for badges

**Generated Files:**
- `icon.png`, `icon-dev.png`, `icon-staging.png`
- `splash-icon.png`, `splash-icon-dev.png`, `splash-icon-staging.png`
- `android-icon-foreground.png` + variants
- `android-icon-monochrome.png` + variants
- `android-icon-background.png` + variants

---

## Phase 6: Initialize EAS Project

### 1. Login to EAS (if not already logged in)

```bash
npx eas login
```

### 2. Initialize New EAS Project

```bash
npx eas init
```

This will:
- Create a new EAS project
- Generate a new project ID
- Link the project to your EAS account

### 3. Update `app.config.js` with New Project ID

After `eas init` completes, it will display a project ID. Update `app.config.js`:

```javascript
extra: {
  router: {},
  eas: {
    projectId: 'YOUR-NEW-PROJECT-ID-HERE',
  },
},
```

---

## Phase 7: Test & Verify

### 1. Start Development Server

```bash
npm run dev
```

Or with default port:
```bash
npm start
```

### 2. Verify Configuration

Run a test build configuration check:
```bash
npx expo config --type public
```

This will show the resolved configuration. Verify:
- App name shows "Brandy" (or variant)
- Bundle IDs show `com.brandyhq.app*`
- Schemes show `brandy*`
- Project ID is set

### 3. Test Builds (Optional)

**Development Build:**
```bash
eas build --profile development --platform ios
```

**Preview Build:**
```bash
eas build --profile preview --platform ios
```

**Production Build:**
```bash
eas build --profile production --platform ios
```

Replace `ios` with `android` for Android builds.

---

## Phase 8: Optional Customizations

### Update README.md

Update the README to reflect Brandy branding and project details.

### Update .gitignore (if needed)

The .gitignore from Crotchet should work, but verify it includes:
```
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
```

### Setup Git Repository (if needed)

```bash
git init
git add .
git commit -m "Initial commit - Brandy mobile app"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

---

## Configuration Summary

### Final Project Structure:

```
/Users/waky/Documents/web/brandy-mobile/
├── app/
├── assets/
├── components/
├── constants/
├── hooks/
├── scripts/
├── app.config.js          ✓ Updated with Brandy branding
├── package.json           ✓ Updated with brandy-mobile name
├── eas.json              ✓ Contains build configurations
├── babel.config.js       ✓ NativeWind support (if migrated)
├── metro.config.js       ✓ NativeWind support (if migrated)
├── tailwind.config.js    ✓ Tailwind config (if migrated)
├── global.css            ✓ Theme CSS variables (if migrated)
├── tsconfig.json
└── node_modules/
```

### Environment Variants:

| Variant | App Name | Bundle ID | Scheme |
|---------|----------|-----------|--------|
| Development | Brandy (Dev) | com.brandyhq.app.dev | brandy-dev |
| Staging | Brandy (Staging) | com.brandyhq.app.staging | brandy-staging |
| Production | Brandy | com.brandyhq.app | brandy |

---

## Text Replacement Reference

For quick find/replace operations:

```
Crotchet (Dev)                → Brandy (Dev)
Crotchet (Staging)            → Brandy (Staging)
Crotchet                      → Brandy
crotchet-dev                  → brandy-dev
crotchet-staging              → brandy-staging
crotchet                      → brandy
tz.co.akil.crotchet.dev       → com.brandyhq.app.dev
tz.co.akil.crotchet.staging   → com.brandyhq.app.staging
tz.co.akil.crotchet           → com.brandyhq.app
mobile-expo                   → brandy-mobile
```

---

## Troubleshooting

### Common Issues:

1. **"Project not found" error:**
   - Run `eas init` to create EAS project
   - Update projectId in app.config.js

2. **Metro bundler errors:**
   - Clear cache: `npm start -- --clear`
   - Delete node_modules and reinstall

3. **Icon not updating:**
   - Run `npm run generate-icons`
   - Clear cache: `npm start -- --clear`

4. **TypeScript errors:**
   - Delete node_modules and package-lock.json
   - Run `npm install`
   - Restart TypeScript server in IDE

5. **Build fails with duplicate identifier:**
   - Check that bundle IDs are unique
   - Verify no conflicts with existing apps on device

---

## Next Steps After Setup

1. **Configure App Store/Play Store:**
   - Create app listings
   - Upload app icons and screenshots
   - Set up app metadata

2. **Setup CI/CD:**
   - Configure automated builds
   - Setup deployment pipelines

3. **Configure Services:**
   - Analytics
   - Crash reporting
   - Push notifications
   - Backend API endpoints

4. **Team Setup:**
   - Add team members to EAS
   - Share environment variables
   - Document development workflow

---

## References

- Source Project: `/Users/waky/Documents/web/crotchet/mobile-expo`
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- App Config Docs: https://docs.expo.dev/workflow/configuration/
