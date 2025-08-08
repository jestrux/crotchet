# Crotchet Hybrid Scaffolding

This folder contains initial scaffolding for the Hybrid plan:
- `desktop/`: Electron app shell (main/preload + React renderer)
- `mobile/`: React Native (Expo Router) shell
- `shared/`: Shared TypeScript models
- `chrome-extension/`: Minimal MV3 helper extension scaffold

Next steps:
- Wire Vite + Electron in `desktop/`
- Initialize Expo project in `mobile/`
- Add dev scripts at repo root for concurrent dev
