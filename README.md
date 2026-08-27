# Lumenfall

An idle RPG where a party of Wisps pushes deeper into an ever-collapsing Rift. Recruit them, empower them between fights, and time your Ascend to come back stronger. Every reward is deterministic — no loot rolls, no RNG, just numbers you can plan around.

Windows and Android are the supported platforms — play in the browser, install it as a Windows desktop build, or grab it on Android. (No iOS support planned for now.)

> **This repo is currently private.** The links below only work while you're signed in to GitHub as the repo owner — they won't load for anyone else, and the Pages site is off (GitHub's Free plan doesn't serve Pages from private repos at all). Make the repo public whenever you want either of those to actually work for other people; no other change is needed.

## Play now

| | |
|---|---|
| 🌐 **Play in browser** | [karahanx.github.io/Lumenfall](https://karahanx.github.io/Lumenfall/) — disabled until the repo is public, see above |
| 🪟 **Windows desktop** | **[Download Lumenfall-Setup.exe](https://github.com/karahaNx/Lumenfall/releases/latest/download/Lumenfall-Setup.exe)** |
| 🤖 **Android** | **[Download Lumenfall.apk](https://github.com/karahaNx/Lumenfall/releases/latest/download/Lumenfall.apk)** — unsigned, sideload it (see [Android build](#android-build)) |

Both download links always point at the newest release — they don't need updating when a new version ships.

- **Android via browser**: once the site is public, you can also visit it in Chrome on Android and use "Add to Home Screen" for a lighter install than the APK.
- The web version also carries a small "Desktop app" button in its bottom-right corner linking to the Windows download.

## Project structure

```
index.html              the whole game — self-contained HTML/CSS/JS, no build step
privacy.html             privacy policy page (required for the Play Store listing)
manifest.webmanifest     PWA manifest (installable web app)
service-worker.js        offline caching for the PWA
icons/                   generated app icons (favicon, PWA, Electron .ico, Android source)
fonts/                   self-hosted font files - no live Google Fonts dependency
desktop/main.js          Electron entry point, loads index.html in a native window
package.json             Electron + electron-builder config (produces the Windows .exe)
mobile/                  Capacitor project scaffold that wraps index.html for Android
.github/workflows/       CI: deploys Pages, builds the .exe, builds the .apk/.aab
```

The game itself has no build step — `index.html` is the entire thing. Everything else in this repo exists purely to package that one file for other platforms.

## Desktop build

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm start        # run it locally in a window
npm run dist      # produce release/Lumenfall-Setup.exe
```

`npm run dist` is also run automatically by `.github/workflows/build-desktop.yml` on every push to `main`/`master` and on version tags (`v1.0.0`, etc.) — grab the result from the Actions run's artifacts, or from the GitHub Release if you pushed a tag. That CI path is the reliable one; see the note below if you build locally on Windows.

> **Local Windows build fails with "Cannot create symbolic link"?** electron-builder downloads a small macOS code-signing helper even for Windows-only builds, and extracting it needs a privilege that regular (non-admin) Windows accounts don't have by default. Either run the build from an elevated terminal once, or turn on **Settings → Privacy & Security → For Developers → Developer Mode** (grants that privilege permanently). This doesn't affect GitHub Actions — `windows-latest` runners already have it.

The Electron window loads `index.html` with `nodeIntegration` off and `contextIsolation`/`sandbox` on — the game gets no Node or filesystem access, it's just the same web page in a native frame.

## Android build

The `mobile/` folder is a [Capacitor](https://capacitorjs.com/) wrapper. The native `android/` project isn't committed — it's generated fresh each time from `mobile/capacitor.config.json`, which is the officially recommended way to use Capacitor.

CI (`.github/workflows/build-android.yml`) copies the web files into `mobile/www/`, adds the native `android/` project, then generates its launcher icon and splash screen from `icons/icon-1024.png` / `icon-maskable-1024.png` / `icon-background-1024.png` — the same source art the Windows `.exe` icon comes from — before building a **debug** APK with Gradle. Debug APKs are unsigned — that's the file linked above, install by sideloading (enable "Install unknown apps" for your browser/file manager), not through the Play Store.

On a version tag push, CI additionally builds a **signed release `.aab`** (Android App Bundle) — the format the Play Store actually requires for submissions — using `mobile/patch-release-signing.py` to inject a signing config into the freshly-generated `android/app/build.gradle`, and a keystore stored as encrypted GitHub Actions secrets (`ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD`/`ANDROID_KEY_ALIAS`/`ANDROID_KEY_PASSWORD`). `versionCode` comes from `github.run_number` (always increasing, satisfying Play's requirement), `versionName` from the git tag. The `.aab` is attached to the GitHub Release alongside the `.apk` — see [Publishing to Google Play](#publishing-to-google-play) for what's still a manual, one-time step on your side.

To build locally you'll need Node.js, a JDK, and the Android SDK/Gradle. The icon generation step needs the native project to exist first, so `cap add android` has to run before it:

```bash
cd mobile
npm install
mkdir -p www && cp ../index.html ../manifest.webmanifest ../service-worker.js www/ && cp -r ../icons www/icons
npx cap add android
mkdir -p assets
cp ../icons/icon-1024.png assets/icon.png
cp ../icons/icon-maskable-1024.png assets/icon-foreground.png
cp ../icons/icon-background-1024.png assets/icon-background.png
npx capacitor-assets generate --android
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Publishing this repo

Actions already has write access to attach release files — pushing a tag like `v1.0.5` builds fresh installers/APK and attaches them to a new Release automatically.

Pages is a separate story: it's off because this repo is private, and GitHub's Free plan only serves Pages from public repos. To turn it on:

1. Make the repo public (Settings → General → Danger Zone → Change visibility).
2. Settings → Pages → Source → **GitHub Actions**.
3. Add an `on: push:` trigger back to `.github/workflows/deploy-pages.yml` (it's currently `workflow_dispatch`-only so it doesn't fail on every push while Pages is off) — copy the trigger block from `build-desktop.yml` as a template.

## Publishing to Google Play

What's already done: a signed `.aab` builds automatically on every version tag (see above), and [`privacy.html`](privacy.html) — required by Play's listing form — is written and deployed alongside the game.

What only you can do, since it needs your own Google identity and payment:

1. Create a [Google Play Console](https://play.google.com/console) account — **$25, one-time**, not recurring.
2. Create the app listing, and fill in the Data Safety form — honestly straightforward here, since the answer to nearly every question is "no data collected" (see `privacy.html` for why).
3. Paste in the privacy policy URL once Pages is public: `https://karahanx.github.io/Lumenfall/privacy.html`.
4. Add store graphics: a 512×512 icon (`icons/icon-512.png` already fits), a 1024×500 feature graphic, and 2+ phone screenshots — none of these exist yet, ask if you want help generating them.
5. Push a version tag (`git tag v1.0.x && git push origin v1.0.x`), download `Lumenfall.aab` from that Release, and upload it to a Play Console testing track.
6. The **first** upload only: Play Console will show you the app signing certificate fingerprint from the `.aab` — it should match the SHA256 in the `README-KEEP-SAFE.txt` you were given when the keystore was generated. Confirming this is Play's way of proving the upload really came from your key.

## Design notes

- **Deterministic rewards.** Every kill, boss fight, and study gives a fixed, calculable amount. What you plan around is your own math, not a drop chance.
- **Wisps, not Towers.** Lumenfall is its own world — original currencies (Lumen, Shards, Motes, Prisms, Comets, Sigils), original cast, original Rift/Ascend structure. It's built in the spirit of idle-RPG games like *Firestone* and *The Tower*, without copying either.
- **Offline progress actually simulates combat** — kill by kill, including boss regen walls, Auto-Empower, and Auto-Ascend — rather than a flat time-based multiplier.

## License

[MIT](LICENSE)
