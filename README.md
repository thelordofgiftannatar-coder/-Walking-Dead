# Prime One — Android & Cloud Hi-Fi Music Player

Prime One is a mobile-first Hi-Fi music player with local folder scanning, static audio waveforms, ID3 tag & artwork editing (including Google Photos), Google Drive cloud storage & cross-device sync, a 5-band Equalizer, 18 thematic universe landscapes, gesture-driven animations, and a real-time Voice & Chat companion.

---

## Build an Android APK Automatically on GitHub

This repository is preconfigured with **Capacitor Android**, **Android permissions**, **launcher/splash artwork**, and a **GitHub Actions workflow** (`.github/workflows/build-android-apk.yml`):

1. **Create a new GitHub repository** (e.g., `prime-one-music-player`).
2. **Extract this `.zip` and push (or upload) all files to `main`** (be sure `.github/workflows/build-android-apk.yml` is at the repository root).
3. In GitHub, open the **Actions** tab → select **Build Prime One Android APK** (it triggers automatically on push to `main`/`master`, or click **Run workflow**).
4. Once green, download **`prime-one-debug-apk`** from **Artifacts**, unzip `app-debug.apk`, and install it on your Android device.

### Android Config Included
- **App ID / Name**: `com.primeone.musicplayer` / `Prime One` (`capacitor.config.ts`)
- **Permissions** (`android-config/apply-android-config.mjs`):
  - `READ_MEDIA_AUDIO`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` (+ legacy `READ_EXTERNAL_STORAGE`)
  - `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `WAKE_LOCK`
  - `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `BLUETOOTH_CONNECT`, `INTERNET`
- **Icons & Splash** (`android-config/res/`): Custom Prime One square, round, and adaptive launcher icons plus notification bar status icon and splash art.

---

## Running Full-Stack Locally / Deploying Web Server

```bash
npm install
npm run build
npm start
```

Configure environment variables (see `.env.example`):
- `GEMINI_API_KEY`: Enables `/api/gemini/chat` and `/api/gemini/live` Voice & Chat endpoints.
- `VITE_API_BASE_URL` *(optional for standalone Android APK)*: Point to your deployed Prime One server URL if you want Voice AI inside an offline Capacitor APK.
