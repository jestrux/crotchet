# Extension Icons

This directory should contain the following icon files for the Chrome extension:

- `16.png` - 16x16 px icon for the extension toolbar
- `48.png` - 48x48 px icon for the extensions management page  
- `128.png` - 128x128 px icon for the Chrome Web Store

## Icon Requirements

All icons should:
- Be PNG format
- Use transparent backgrounds
- Follow Chrome's extension icon guidelines
- Represent the Crotchet brand/command palette concept

## Placeholder Icons

Until actual icons are created, you can use simple colored squares or the Chrome extension will use default placeholder icons.

Example command to create placeholder icons (requires ImageMagick):
```bash
convert -size 16x16 xc:#007bff 16.png
convert -size 48x48 xc:#007bff 48.png  
convert -size 128x128 xc:#007bff 128.png
```