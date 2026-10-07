python3 - <<'PY'
from pathlib import Path

path = Path("mobile/www/index.html")
src = path.read_text(encoding="utf-8")
marker = """<script id="ci-runtime-error-guard">
(function(){
  function mark(kind){
    document.documentElement.setAttribute('data-ci-runtime-error', kind);
  }
  window.addEventListener('error', function(){ mark('uncaught-error'); });
  window.addEventListener('unhandledrejection', function(){ mark('unhandled-rejection'); });
})();
</script>"""

if "<head>" not in src:
    raise SystemExit("CI runtime guard failed: <head> not found")

path.write_text(src.replace("<head>", "<head>\\n" + marker, 1), encoding="utf-8")
print("Installed CI-only runtime error guard in staged HTML.")
PY
