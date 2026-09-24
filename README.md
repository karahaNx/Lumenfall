# Lumenfall

## ⬇️ DOWNLOAD ANDROID APK

### [**DOWNLOAD LUMENFALL.APK**](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)

**Latest Android build · direct APK download · no ZIP · no EXE**

---


Lumenfall is an Android idle RPG where a party of Wisps pushes deeper into an ever-collapsing Rift.

This repository is now **Android-only**. There is no Windows/Electron build, no EXE, no GitHub Pages deployment, no PWA distribution, and no Play Store AAB pipeline.

## Download the current APK

Every relevant push to `main` automatically runs **Build Android APK** and publishes the finished file to the fixed **Lumenfall Android — Latest** release.

Because the repository is private, GitHub will require you to be signed in to the account that has access to the repo.

You can also open **Releases** in the repository and select **Lumenfall Android — Latest**. There is only one distributed app file: `Lumenfall.apk`.

The generated APK is intended for direct sideloading. Android may require you to allow **Install unknown apps** for the browser or file manager you use to open it.

### Updating the app

Current builds use one persistent private Android signing key and an increasing Android `versionCode`, so future `Lumenfall.apk` files can be installed as updates over the existing app.

If you installed one of the older APKs from before stable signing was introduced and Android reports a signature/package conflict, uninstall that old build once and install the current APK. Builds from the current signing generation are designed to update in place after that.

Inside Lumenfall, **Settings → Save Backup** can copy/restore your save code for future reinstalls or device changes.

## Project structure

```
index.html                         game UI and game logic loaded inside the Android WebView
fonts/                             self-hosted game fonts
icons/                             Android launcher/splash source images
mobile/capacitor.config.json       Capacitor Android configuration
mobile/package.json                Android/Capacitor dependencies
mobile/package-lock.json           locked Android/Capacitor dependency versions
.github/workflows/build-android.yml
                                   builds Lumenfall.apk on GitHub Actions
```

`index.html` is still HTML/JavaScript because Capacitor renders the game inside an Android WebView. It is an implementation detail of the Android app, not a separately deployed browser version.

## Android build pipeline

The workflow:

1. Restores the persistent private Lumenfall Android signing key.
2. Installs the locked Capacitor dependencies with `npm ci`.
3. Copies `index.html` and the local fonts into `mobile/www`.
4. Generates a fresh Capacitor Android project.
5. Assigns an increasing Android `versionCode` from the GitHub Actions run number.
6. Generates the Android launcher icon and splash resources.
7. Runs `cap sync android`.
8. Builds the APK with Gradle using the stable signing identity.
9. Publishes `Lumenfall.apk` to the fixed GitHub Release tag **android-latest**.

The signing keystore is stored as an asset in the private draft release `lumenfall-signing-v1`. Do not publish or delete that draft release; losing the key would break update compatibility with already-installed builds.

The Android SDK supplied by GitHub's Ubuntu runner is used directly. The old `android-actions/setup-android` step was removed because it attempted to install the obsolete Android SDK package `tools`, which caused the recent workflow failures before the app build even started.

## Local Android build

If you ever build outside GitHub Actions, you need Node.js 20+, JDK 17, and an Android SDK:

```bash
cd mobile
npm ci

rm -rf www
mkdir -p www/fonts
cp ../index.html www/index.html
cp -r ../fonts/. www/fonts/

npx cap add android

mkdir -p assets
cp ../icons/icon-1024.png assets/icon.png
cp ../icons/icon-maskable-1024.png assets/icon-foreground.png
cp ../icons/icon-background-1024.png assets/icon-background.png
cp ../icons/icon-1024.png assets/splash.png

npx capacitor-assets generate --android
npx cap sync android

cd android
./gradlew assembleDebug
```

The APK is produced at:

```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## Design notes

- Deterministic progression rather than loot-box/gacha RNG.
- Offline combat simulation including Wisp abilities, Auto-Tap, smart boss retreat/retry and automation.
- Formation Bonds for distinct Push, Farm and Boss builds.
- Rotating Boss Traits: Regrowth, Fractured Core and Guardian's Mark.
- Rift Regions that change every 25 levels.
- Persistent Wisp progression, research, Long Studies, Ascension, Deeds, Push/Farm and Auto-Ascend systems.
- In-app Encyclopedia plus save backup/restore under Settings.

## License

[MIT](LICENSE)


## Legacy cleanup

The Android workflow also removes obsolete GitHub Actions artifacts and old release assets ending in `.exe` or `.aab`. This keeps the repository's downloadable builds Android-APK-only and avoids the Actions artifact-storage quota that previously blocked uploads.
