import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
const manifestPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const customResDir = path.join(projectRoot, 'android-config', 'res');

if (!fs.existsSync(manifestPath)) {
  console.error('Android project not found. Run "npx cap add android" first.');
  process.exit(1);
}

// 1. Copy custom Prime One icons and splash assets into android/app/src/main/res
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Replace Capacitor default splash images across drawable folders if splash.jpg exists
if (fs.existsSync(path.join(customResDir, 'drawable', 'splash.jpg'))) {
  for (const dirEntry of fs.readdirSync(androidResDir, { withFileTypes: true })) {
    if (dirEntry.isDirectory() && dirEntry.name.startsWith('drawable')) {
      for (const staleName of ['splash.png', 'splash.webp']) {
        const staleSplash = path.join(androidResDir, dirEntry.name, staleName);
        if (fs.existsSync(staleSplash)) {
          fs.unlinkSync(staleSplash);
        }
      }
    }
  }
}

copyRecursive(customResDir, androidResDir);

// 2. Ensure adaptive icon background & XMLs match Prime One deep obsidian (#090d16)
const valuesDir = path.join(androidResDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
const bgValuesPath = path.join(valuesDir, 'ic_launcher_background.xml');
fs.writeFileSync(
  bgValuesPath,
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#090d16</color>\n</resources>\n`,
  'utf8'
);

const anydpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');
fs.mkdirSync(anydpiDir, { recursive: true });
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@mipmap/ic_launcher_bg" />\n    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n</adaptive-icon>\n`;
fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveIconXml, 'utf8');
fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveIconXml, 'utf8');

// 3. Patch AndroidManifest.xml safely (preserving AGP 8+ structure & FileProvider)
let manifest = fs.readFileSync(manifestPath, 'utf8');

const requiredPermissions = [
  `<uses-permission android:name="android.permission.INTERNET" />`,
  `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`,
  `<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />`,
  `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />`,
  `<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />`,
  `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />`,
  `<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />`,
  `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`,
  `<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />`,
  `<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />`,
  `<uses-permission android:name="android.permission.WAKE_LOCK" />`,
  `<uses-permission android:name="android.permission.RECORD_AUDIO" />`,
  `<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />`,
  `<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />`,
  `<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />`,
];

for (const permTag of requiredPermissions) {
  const nameMatch = permTag.match(/android:name="([^"]+)"/);
  const permName = nameMatch ? nameMatch[1] : '';
  if (permName && !manifest.includes(`android:name="${permName}"`)) {
    manifest = manifest.replace('</manifest>', `    ${permTag}\n</manifest>`);
  }
}

// Add audio/* VIEW intent-filter inside MainActivity if missing
if (!manifest.includes('android:mimeType="audio/*"')) {
  const audioIntent = `            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="audio/*" />
            </intent-filter>`;
  manifest = manifest.replace('</activity>', `${audioIntent}\n        </activity>`);
}

fs.writeFileSync(manifestPath, manifest, 'utf8');
console.log('Applied Prime One AndroidManifest permissions & launcher/splash resources.');
