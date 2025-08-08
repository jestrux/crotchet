# Desktop App Assets

This directory should contain the following assets for the Electron desktop app:

## Required Assets

- `tray-icon.png` - System tray icon (16x16 or 32x32 px, depending on platform)
- `app-icon.png` - Main application icon (512x512 px recommended)
- `app-icon.ico` - Windows application icon (multi-size .ico file)
- `app-icon.icns` - macOS application icon (.icns format)

## Icon Requirements

- **Tray Icon**: Should be monochrome for best compatibility across platforms
- **App Icon**: High resolution, represents the Crotchet brand
- Use transparent backgrounds where appropriate
- Follow platform-specific guidelines for tray/taskbar icons

## Placeholder Usage

Until actual icons are created, the tray functionality may not work properly. The app will attempt to load `tray-icon.png` but will fail gracefully if not found.

Example command to create a simple tray icon placeholder:
```bash
# Create a simple blue square placeholder (requires ImageMagick)
convert -size 16x16 xc:#007bff tray-icon.png
```