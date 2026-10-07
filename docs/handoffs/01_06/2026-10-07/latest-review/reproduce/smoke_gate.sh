set -euo pipefail

CHROME="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser || true)"
if [ -z "$CHROME" ]; then
  echo "No supported Chromium browser found on the runner."
  exit 1
fi

python3 -m http.server 4173 --directory mobile/www >/tmp/lumenfall-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

ready=0
for _ in $(seq 1 20); do
  if curl --fail --silent http://127.0.0.1:4173/index.html >/dev/null && curl --fail --silent http://127.0.0.1:4173/branding/lumenfall-mark.svg >/dev/null; then
    ready=1
    break
  fi
  sleep 0.25
done
if [ "$ready" -ne 1 ]; then
  cat /tmp/lumenfall-http.log
  exit 1
fi

"$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --window-size=390,844 \
  --virtual-time-budget=1800 \
  --dump-dom \
  http://127.0.0.1:4173/index.html \
  >/tmp/lumenfall-dom.html 2>/tmp/lumenfall-chrome.log

python3 - <<'PY'
from pathlib import Path
import re

dom = Path("/tmp/lumenfall-dom.html").read_text(encoding="utf-8")
chrome_log = Path("/tmp/lumenfall-chrome.log").read_text(encoding="utf-8")

checks = {
    "CI runtime guard installed": 'id="ci-runtime-error-guard"' in dom,
    "No uncaught JavaScript error": 'data-ci-runtime-error="uncaught-error"' not in dom,
    "No unhandled promise rejection": 'data-ci-runtime-error="unhandled-rejection"' not in dom,
    "Rift zone runtime render": 'data-zone-index="0"' in dom,
    "Rift scroll lock": bool(re.search(r'<main[^>]*class="[^"]*rift-scroll-locked', dom)),
    "Enemy runtime render": bool(re.search(r'id="enemy-name"[^>]*>\s*[^<\s][^<]*<', dom)),
    "HUD runtime render": bool(re.search(r'id="hud-lumen"[^>]*>\s*0(?:\.0)?\s*<', dom)),
}

failed = [name for name, ok in checks.items() if not ok]
if failed:
    print(dom[:12000])
    if chrome_log.strip():
        print("\n--- Chromium stderr ---")
        print(chrome_log[-8000:])
    raise SystemExit("Browser smoke test failed: " + ", ".join(failed))

print("Browser smoke test passed: game initialized without uncaught runtime errors at a 390x844 mobile viewport.")
PY
