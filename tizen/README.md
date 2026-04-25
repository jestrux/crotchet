# Crotchet TV (Tizen)

Samsung Tizen TV app for Crotchet. Requires the Crotchet desktop app running on the same network.

## Desktop setup (required)

The TV app fetches video URLs via the desktop app's local server. For YouTube playback to work, the desktop machine needs the following installed:

### 1. yt-dlp

```bash
pip3 install "yt-dlp[default]"
```

The `[default]` extras include the EJS challenge solver scripts used to bypass YouTube's Botguard.

### 2. Node.js (v20 or later)

Required by yt-dlp to run YouTube's JavaScript challenge solver. Install via [nvm](https://github.com/nvm-sh/nvm) or directly:

```bash
# via nvm
nvm install 20

# or via Homebrew
brew install node
```

### 3. Chrome (for cookies)

The server reads cookies from Chrome to avoid YouTube rate limiting (`--cookies-from-browser chrome`). Chrome must be installed and you must be signed in to a Google account.

## Running

1. Start the Crotchet desktop app on your Mac.
2. Note the local IP shown in the app (e.g. `192.168.x.x`).
3. Launch the Tizen app on your TV and enter that IP to connect.
