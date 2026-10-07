#!/usr/bin/env bash
# Codex setup only. No build, signing, publication or game test execution.
set -euo pipefail
LUMENFALL_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$LUMENFALL_REPO_ROOT"
install_browser=0
install_mobile=0
for argument in "$@"; do
  case "$argument" in
    --install-browser) install_browser=1 ;;
    --install-mobile) install_mobile=1 ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done
command -v git >/dev/null
command -v node >/dev/null
command -v python3 >/dev/null
node -e 'if(Number(process.versions.node.split(".")[0])<20) throw Error("Node.js 20+ required");'
python3 -c 'import sys; assert sys.version_info >= (3,10), "Python 3.10+ required"'
find_browser() {
  for browser_command in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$browser_command" >/dev/null 2>&1; then
      command -v "$browser_command"
      return 0
    fi
  done
  return 1
}
if ! find_browser >/dev/null && [ "$install_browser" -eq 1 ]; then
  if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ] || ! command -v apt-get >/dev/null; then
    echo "Automatic Chrome installation supports Linux amd64 with apt-get; install Chromium on PATH." >&2
    exit 1
  fi
  command -v curl >/dev/null
  elevate=()
  if [ "$(id -u)" -ne 0 ]; then command -v sudo >/dev/null; elevate=(sudo); fi
  LUMENFALL_SETUP_TMP="$(mktemp -d)"
  trap 'rm -rf "$LUMENFALL_SETUP_TMP"' EXIT
  curl --fail --location --retry 2 --connect-timeout 15 --max-time 180 \
    https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    -o "$LUMENFALL_SETUP_TMP/google-chrome.deb"
  "${elevate[@]}" apt-get update
  "${elevate[@]}" apt-get install -y "$LUMENFALL_SETUP_TMP/google-chrome.deb"
fi
if ! LUMENFALL_BROWSER="$(find_browser)"; then
  echo "Browser missing. Install Chrome/Chromium on PATH during environment setup, or use --install-browser." >&2
  exit 1
fi
"$LUMENFALL_BROWSER" --version
if [ "$install_mobile" -eq 1 ]; then
  command -v npm >/dev/null
  npm ci --prefix mobile
fi
python3 scripts/codex/check_context.py
echo "PASS: Lumenfall web-test environment ready. Android SDK/signing are separate."
