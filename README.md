# Lumenfall

### [**DOWNLOAD LUMENFALL.APK**](https://github.com/karahaNx/Lumenfall/releases/download/android-latest/Lumenfall.apk)

Latest Android build · direct APK download

---

Lumenfall is an Android idle RPG where a party of Wisps pushes deeper into an ever-collapsing Rift.

This repository is now **Android-only**.

## Download the current APK

Every relevant push to `main` automatically runs **Build Android APK** and publishes the finished file to the fixed **Lumenfall Android — Latest** release.

Repository visibility and account access are controlled by GitHub.

You can also open **Releases** in the repository and select **Lumenfall Android — Latest**. There is only one distributed app file: `Lumenfall.apk`.

The generated APK is intended for direct sideloading. Android may require you to allow **Install unknown apps** for the browser or file manager you use to open it.

### Updating the app

Current builds use one persistent private Android signing key and an increasing Android `versionCode`, so future `Lumenfall.apk` files can be installed as updates over the existing app.

If you installed one of the older APKs from before stable signing was introduced and Android reports a signature/package conflict, uninstall that old build once and install the current APK. Builds from the current signing generation are designed to update in place after that.

Inside Lumenfall, **Settings → Save Backup** can copy/restore your save code for future reinstalls or device changes.

## Start i Codex / projektchats

Vælg `karahaNx/Lumenfall` på `main`. Læs [AGENTS.md](AGENTS.md),
[PROJECT_BOOTSTRAP.txt](PROJECT_BOOTSTRAP.txt), kun [egen rolle](docs/CHAT_OWNERSHIP.md)
og [kort aktuel status](docs/PROJECT_STATE.md).
Uden tildelt rolle starter en ny projektchat som Lead / Architecture.
[CODEX_START.md](docs/project/CODEX_START.md) har miljøsetup, commands og næste
konkrete handling. Nyeste B2-kandidat, originale krav, Core/QA-rapporter og
rå beviser kan læses fra main; de er arkiv-/reviewkilder, ikke produktaccept.
Brug [kildeindekset](docs/CONTEXT_INDEX.md) til detaljer efter behov.
Nye handoffs følger [skabelonen](docs/HANDOFF_TEMPLATE.md); gamle arkiver,
audits og fulde logs indlæses ikke samlet ved opstart.
Ved adgang gennem GitHub-værktøjer skal opstartsprompten eksplicit bede om
AGENTS.md; filnavnet alene garanterer ikke automatisk indlæsning.

Én feature pr. ejerchat, med verificeret integration før arkivering:
[FEATURE_WORKFLOW.md](docs/project/FEATURE_WORKFLOW.md).
For at fortsætte fra en ny ChatGPT-konto med GitHub-adgang:
[ACCOUNT_RECOVERY.md](docs/project/ACCOUNT_RECOVERY.md), inklusive startprompt.
Regler, krav, beslutninger og testbeviser gemmes løbende i repositoryet.

JavaScript er projektets standard for kode, tests, CI-logik og hjælpescripts,
hvor det er teknisk muligt. HTML er fortsat tilladt. Nye scripts bruger Node.js;
eksisterende aktive værktøjer omlægges i relevant scope med bevaret testdækning.
Se [sprogreglen og overgangen](docs/decisions/2026-10-07-javascript-first.md).

## Project structure

```
index.html                         game UI and game logic loaded inside the Android WebView
fonts/                             self-hosted game fonts
branding/                          production Lumenfall mark and branding notes
docs/                              project state and chat ownership rules
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
3. Copies `index.html`, fonts and production branding into `mobile/www`.
4. Generates a fresh Capacitor Android project.
5. Assigns an increasing Android `versionCode` from the GitHub Actions run number.
6. Rasterizes the production SVG mark into launcher, adaptive-icon and native splash sources, then generates Android resources.
7. Runs `cap sync android`.
8. Builds the APK with Gradle using the stable signing identity.
9. Publishes `Lumenfall.apk` to the fixed GitHub Release tag **android-latest**.

The established signing keystore is stored as the asset `Lumenfall-debug.keystore` in the private draft release `lumenfall-signing-v1`. The expected SHA-256 certificate fingerprint is `A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21`.

The publishing workflow treats that exact certificate as immutable. If the draft release or asset is missing/inaccessible, the keystore cannot be opened, or its certificate fingerprint differs, the build fails before APK publication. Normal CI must never generate a replacement signing identity.

Recovery requires restoring the **exact existing keystore** from an independently protected backup outside the normal GitHub build/release control path, then verifying that it produces the fingerprint above before rerunning publication. Never create a new key as a substitute: a new certificate would break Android update compatibility with currently installed builds. Do not commit the keystore, private key material, credentials or backup material to this repository.

The repository cannot prove that the required independent external backup exists. Maintaining and periodically verifying that protected backup remains an operator responsibility.

The Android SDK supplied by GitHub's Ubuntu runner is used directly. The old `android-actions/setup-android` step was removed because it attempted to install the obsolete Android SDK package `tools`, which caused the recent workflow failures before the app build even started.

## Local Android build

If you ever build outside GitHub Actions, you need Node.js 20+, JDK 17, and an Android SDK:

```bash
cd mobile
npm ci

rm -rf www
mkdir -p www/fonts www/branding
cp ../index.html www/index.html
cp -r ../fonts/. www/fonts/
cp -r ../branding/. www/branding/

npx cap add android

# GitHub Actions rasterizes branding/lumenfall-mark.svg with Sharp
# into assets/icon.png, icon-foreground.png, icon-background.png and splash.png.
# Use the workflow as the canonical build recipe.

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
