# Lumenfall

Lumenfall is an Android idle RPG where a party of Wisps pushes deeper into an ever-collapsing Rift.

This repository is now **Android-only**. There is no Windows/Electron build, no EXE, no GitHub Pages deployment, no PWA distribution, and no Play Store AAB pipeline.

## Download the current APK

Every relevant push to `main` automatically runs **Build Android APK** and publishes the finished file to the fixed **Lumenfall Android — Latest** release.

**Direct APK:** [Download Lumenfall.apk](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)

Because the repository is private, GitHub will require you to be signed in to the account that has access to the repo.

You can also open **Releases** in the repository and select **Lumenfall Android — Latest**. There is only one distributed app file: `Lumenfall.apk`.

The generated APK is a debug-signed Android build intended for direct sideloading. Android may require you to allow **Install unknown apps** for the browser or file manager you use to open it.

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

1. Installs the locked Capacitor dependencies with `npm ci`.
2. Copies `index.html` and the local fonts into `mobile/www`.
3. Generates a fresh Capacitor Android project.
4. Generates the Android launcher icon and splash resources.
5. Runs `cap sync android`.
6. Builds `app-debug.apk` with Gradle.
7. Publishes `Lumenfall.apk` to the fixed GitHub Release tag **android-latest**.

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
- Offline combat simulation including boss walls and automation.
- Persistent Wisp progression, research, Long Studies, Ascension, Deeds, Push/Farm and Auto-Ascend systems.

## License

[MIT](LICENSE)


## Legacy cleanup

The Android workflow also removes obsolete GitHub Actions artifacts and old release assets ending in `.exe` or `.aab`. This keeps the repository's downloadable builds Android-APK-only and avoids the Actions artifact-storage quota that previously blocked uploads.
