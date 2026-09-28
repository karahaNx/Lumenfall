#!/usr/bin/env python3
import argparse
import copy
import datetime as dt
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

SAVE_KEY = "lumenfall_save_v2"
RECOVERY_KEY = "lumenfall_save_recovery_v1"
RESET_KEY = "lumenfall_reset_pending_v1"
INTRO_KEY = "lumenfall_startup_intro_last"


class SmokeError(RuntimeError):
    pass


def log(message):
    print(f"[native-lifecycle] {message}", flush=True)


def fail(message):
    raise SmokeError(message)


def run(command, timeout=60, check=True):
    result = subprocess.run(
        command, capture_output=True, text=True, timeout=timeout, check=False
    )
    if check and result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise SmokeError(
            f"command failed ({result.returncode}): {' '.join(command)}\n{detail[-2000:]}"
        )
    return result


def adb(*args, timeout=60, check=True):
    return run(["adb", *args], timeout=timeout, check=check)


def wait_for_device(timeout=60):
    adb("wait-for-device", timeout=timeout)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        boot = adb("shell", "getprop", "sys.boot_completed", check=False).stdout.strip()
        if boot == "1":
            return
        time.sleep(1)
    fail("Android emulator did not finish booting")


def install_apk(apk, package):
    if not apk.is_file() or apk.stat().st_size <= 0:
        fail(f"APK missing or empty: {apk}")
    log(f"installing exact prepared APK: {apk}")
    adb("install", "-r", "-t", str(apk), timeout=180)
    installed = adb("shell", "pm", "path", package).stdout.strip()
    if not installed.startswith("package:"):
        fail(f"installed package {package} was not found after adb install")


def clear_app(package):
    result = adb("shell", "pm", "clear", package)
    if "Success" not in result.stdout:
        fail(f"pm clear did not report Success for {package}: {result.stdout.strip()}")


def force_stop(package):
    adb("shell", "am", "force-stop", package)


def launch(package, activity):
    result = adb(
        "shell", "am", "start", "-W", "-n", f"{package}/{activity}", timeout=30
    )
    output = result.stdout + result.stderr
    if "Error:" in output or "Exception" in output:
        fail(f"Android launch failed:\n{output}")


def press_home():
    adb("shell", "input", "keyevent", "KEYCODE_HOME")


def package_pids(package):
    return adb("shell", "pidof", package, check=False).stdout.strip().split()


def webview_sockets():
    output = adb("shell", "cat", "/proc/net/unix", check=False).stdout
    result = []
    for line in output.splitlines():
        if "webview_devtools_remote" not in line:
            continue
        name = line.split()[-1].lstrip("@")
        if name and name not in result:
            result.append(name)
    return result


def pick_webview_socket(package):
    pids = package_pids(package)
    sockets = webview_sockets()
    for pid in pids:
        for name in sockets:
            if name.endswith("_" + pid) or name.endswith(pid):
                return name
    if len(sockets) == 1:
        return sockets[0]
    return sockets[-1] if sockets else None


def bounded_command_diagnostic(command, timeout=5):
    try:
        result = run(command, timeout=timeout, check=False)
        return {
            "returncode": result.returncode,
            "stdout": (result.stdout or "").strip()[-1200:],
            "stderr": (result.stderr or "").strip()[-1200:],
        }
    except Exception as exc:
        return {
            "returncode": None,
            "stdout": "",
            "stderr": f"{type(exc).__name__}: {exc}",
        }


def collect_attach_diagnostics(package, last_detail):
    get_state = bounded_command_diagnostic(["adb", "get-state"])
    devices = bounded_command_diagnostic(["adb", "devices", "-l"])
    pidof = bounded_command_diagnostic(["adb", "shell", "pidof", package])
    unix = bounded_command_diagnostic(["adb", "shell", "cat", "/proc/net/unix"])
    activity = bounded_command_diagnostic(
        ["adb", "shell", "dumpsys", "activity", "activities"]
    )
    processes = bounded_command_diagnostic(
        ["adb", "shell", "ps", "-A"]
    )

    pids = pidof["stdout"].split() if pidof["returncode"] == 0 else []
    sockets = []
    if unix["returncode"] == 0:
        for line in unix["stdout"].splitlines():
            if "webview_devtools_remote" in line:
                name = line.split()[-1].lstrip("@")
                if name and name not in sockets:
                    sockets.append(name)

    if get_state["returncode"] != 0 or get_state["stdout"] != "device":
        domain = "ADB/emulator unavailable"
    elif not pids:
        domain = "package process absent"
    elif not sockets:
        domain = "package process alive but no WebView devtools socket"
    else:
        domain = "WebView socket exists but forwarding/CDP target attachment failed"

    focused = []
    if activity["returncode"] == 0:
        focused = [
            line.strip()
            for line in activity["stdout"].splitlines()
            if package in line or "mResumedActivity" in line or "topResumedActivity" in line
        ][-12:]

    process_lines = []
    if processes["returncode"] == 0:
        process_lines = [
            line.strip()
            for line in processes["stdout"].splitlines()
            if package in line
        ][-12:]

    return {
        "failureDomain": domain,
        "lastAttachDetail": last_detail,
        "adbGetState": get_state,
        "adbDevices": devices,
        "packagePid": pidof,
        "webviewSockets": sockets,
        "activityLines": focused,
        "processLines": process_lines,
    }


def free_forward_port():
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def forward_webview(socket_name):
    port = free_forward_port()
    adb("forward", f"tcp:{port}", f"localabstract:{socket_name}")
    return port


def remove_forward(port):
    adb("forward", "--remove", f"tcp:{port}", check=False)


def fetch_json(url, timeout=3):
    with urllib.request.urlopen(url, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def local_ws_url(url, port):
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, f"127.0.0.1:{port}", parts.path, parts.query, parts.fragment))


class Cdp:
    def __init__(self, ws_url):
        try:
            import websocket
        except ImportError as exc:
            raise SmokeError(
                "websocket-client is required; install websocket-client==1.8.0"
            ) from exc
        self.ws = websocket.create_connection(ws_url, timeout=10, suppress_origin=True)
        self.next_id = 1

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass

    def command(self, method, params=None):
        call_id = self.next_id
        self.next_id += 1
        self.ws.send(json.dumps({"id": call_id, "method": method, "params": params or {}}))
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            message = json.loads(self.ws.recv())
            if message.get("id") != call_id:
                continue
            if "error" in message:
                raise SmokeError(f"CDP {method} failed: {message['error']}")
            return message.get("result", {})
        fail(f"CDP {method} timed out")

    def evaluate(self, expression):
        result = self.command(
            "Runtime.evaluate",
            {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
                "userGesture": True,
            },
        )
        if result.get("exceptionDetails"):
            fail(
                "CDP Runtime.evaluate exception: "
                + json.dumps(result["exceptionDetails"], sort_keys=True)
            )
        remote = result.get("result", {})
        return remote.get("value")


class WebViewSession:
    def __init__(self, cdp, port, socket_name):
        self.cdp = cdp
        self.port = port
        self.socket_name = socket_name

    def close(self):
        self.cdp.close()
        remove_forward(self.port)


def attach_webview(package, timeout=35):
    deadline = time.monotonic() + timeout
    detail = "no attempt"
    while time.monotonic() < deadline:
        try:
            socket_name = pick_webview_socket(package)
        except Exception as exc:
            detail = f"socket discovery failed: {type(exc).__name__}: {exc}"
            time.sleep(0.5)
            continue

        if not socket_name:
            detail = "no WebView devtools socket discovered"
            time.sleep(0.5)
            continue

        port = None
        attached = False
        try:
            port = forward_webview(socket_name)
            targets = fetch_json(f"http://127.0.0.1:{port}/json", timeout=2)
            pages = [
                target
                for target in targets
                if target.get("type") == "page" and target.get("webSocketDebuggerUrl")
            ]
            if not pages:
                detail = f"{socket_name} exposed no page target"
                time.sleep(0.5)
                continue
            pages.sort(key=lambda target: 0 if "localhost" in target.get("url", "") else 1)
            target = pages[0]
            cdp = Cdp(local_ws_url(target["webSocketDebuggerUrl"], port))
            cdp.command("Runtime.enable")
            attached = True
            return WebViewSession(cdp, port, socket_name)
        except Exception as exc:
            detail = (
                f"socket={socket_name} attach failed: "
                f"{type(exc).__name__}: {exc}"
            )
            time.sleep(0.5)
        finally:
            if port is not None and not attached:
                remove_forward(port)

    diagnostics = collect_attach_diagnostics(package, detail)
    fail(
        f"could not attach to packaged WebView within {timeout}s; "
        f"diagnostics={json.dumps(diagnostics, sort_keys=True)}"
    )


def usable_runtime(session, timeout=30):
    deadline = time.monotonic() + timeout
    expression = """(() => ({
      ready: document.readyState,
      enemy: !!document.getElementById('enemy-name') && !!document.getElementById('enemy-name').textContent.trim(),
      hud: !!document.getElementById('hud-lumen'),
      rift: !!document.getElementById('rift-push-btn') && !!document.getElementById('spirit-list'),
      body: !!document.body,
      native: !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()),
      url: location.href
    }))()"""
    last = None
    while time.monotonic() < deadline:
        try:
            last = session.cdp.evaluate(expression)
            if (
                isinstance(last, dict)
                and last.get("enemy")
                and last.get("hud")
                and last.get("rift")
                and last.get("body")
                and last.get("native")
            ):
                return last
        except Exception:
            pass
        time.sleep(0.4)
    fail(f"packaged app did not reach usable native WebView DOM: {last}")


def materialize(value, now_ms=None):
    now_ms = int(time.time() * 1000) if now_ms is None else now_ms
    today = dt.datetime.fromtimestamp(now_ms / 1000).strftime("%Y-%m-%d")
    if isinstance(value, str):
        tokens = {
            "__NOW__": now_ms,
            "__NOW_MINUS_60S__": now_ms - 60_000,
            "__NOW_PLUS_10M__": now_ms + 600_000,
            "__TODAY__": today,
        }
        return tokens.get(value, value)
    if isinstance(value, list):
        return [materialize(item, now_ms) for item in value]
    if isinstance(value, dict):
        return {key: materialize(item, now_ms) for key, item in value.items()}
    return value


def load_fixture(fixtures_path, name):
    fixtures = json.loads(fixtures_path.read_text(encoding="utf-8"))
    fixture = fixtures.get(name)
    if not fixture or not isinstance(fixture.get("save"), dict):
        fail(f"fixture {name!r} missing save object in {fixtures_path}")
    return materialize(copy.deepcopy(fixture["save"]))


def seed_save(session, save):
    payload = json.dumps(save, separators=(",", ":"))
    expression = f"""(() => {{
      localStorage.removeItem({json.dumps(RECOVERY_KEY)});
      localStorage.removeItem({json.dumps(RESET_KEY)});
      localStorage.setItem({json.dumps(SAVE_KEY)}, {json.dumps(payload)});
      localStorage.setItem({json.dumps(INTRO_KEY)}, String(Date.now()));
      window.__lumenfallNativeSeedPending = true;
      return localStorage.getItem({json.dumps(SAVE_KEY)}) !== null;
    }})()"""
    if session.cdp.evaluate(expression) is not True:
        fail("failed to seed canonical save into packaged WebView localStorage")


def persistence_snapshot(session):
    expression = f"""(() => {{
      const raw = localStorage.getItem({json.dumps(SAVE_KEY)});
      const recovery = localStorage.getItem({json.dumps(RECOVERY_KEY)});
      let parsed = null;
      let parseError = null;
      if(raw){{
        try {{ parsed = JSON.parse(raw); }}
        catch(error) {{ parseError = String(error); }}
      }}
      return {{
        url: location.href,
        origin: location.origin,
        preReloadContext: window.__lumenfallNativeSeedPending === true,
        hasPrimary: typeof raw === 'string' && raw.length > 0,
        hasRecovery: typeof recovery === 'string' && recovery.length > 0,
        parsed: parsed,
        parseError: parseError
      }};
    }})()"""
    value = session.cdp.evaluate(expression)
    if not isinstance(value, dict):
        fail("packaged WebView persistence probe did not return an object")
    return value


def wait_for_seeded_reload(package, seeded, timeout=20):
    deadline = time.monotonic() + timeout
    last = None
    last_error = "no attempt"
    while time.monotonic() < deadline:
        session = None
        snapshot = None
        try:
            session = attach_webview(package, timeout=5)
            usable_runtime(session, timeout=5)
            snapshot = persistence_snapshot(session)
        except Exception as exc:
            last_error = f"{type(exc).__name__}: {exc}"
        finally:
            if session:
                session.close()

        if snapshot:
            last = snapshot
            if snapshot.get("origin") != "https://localhost":
                last_error = f"wrong packaged WebView origin: {snapshot.get('origin')!r}"
            elif snapshot.get("preReloadContext"):
                last_error = "still attached to the pre-reload JavaScript context"
            elif not snapshot.get("hasPrimary"):
                last_error = "canonical save key is absent after reload"
            elif snapshot.get("parseError"):
                fail(
                    "canonical save became malformed after reload: "
                    + str(snapshot.get("parseError"))
                )
            elif not isinstance(snapshot.get("parsed"), dict):
                last_error = "canonical save did not parse to an object"
            else:
                actual = snapshot["parsed"]
                try:
                    assert_basic_continuity(actual, seeded)
                except SmokeError as exc:
                    fail(f"seeded persistence was overwritten after reload: {exc}")
                if not snapshot.get("hasRecovery"):
                    last_error = (
                        "canonical primary exists, but production startup save "
                        "has not established the recovery copy yet"
                    )
                else:
                    return actual
        time.sleep(0.4)

    summary = None
    if last:
        parsed = last.get("parsed") if isinstance(last.get("parsed"), dict) else {}
        summary = {
            "url": last.get("url"),
            "origin": last.get("origin"),
            "preReloadContext": last.get("preReloadContext"),
            "hasPrimary": last.get("hasPrimary"),
            "hasRecovery": last.get("hasRecovery"),
            "parseError": last.get("parseError"),
            "schemaVersion": parsed.get("schemaVersion"),
            "riftMode": parsed.get("riftMode"),
            "depth": parsed.get("depth"),
        }
    fail(
        f"timed out waiting for seeded packaged reload; "
        f"last error={last_error}; snapshot={json.dumps(summary, sort_keys=True)}"
    )


def reload_seeded_save(package, seeded):
    session = attach_webview(package)
    try:
        usable_runtime(session)
        seed_save(session, seeded)
        # The seed changes storage, not the already-running in-memory game state.
        # Issue a real CDP reload command so the packaged app must consume the
        # canonical save through its production load/startup-save path.
        session.cdp.command("Page.enable")
        session.cdp.command("Page.reload", {"ignoreCache": True})
    finally:
        # Navigation is a hard CDP invalidation boundary. Never use this
        # WebSocket/target for post-reload assertions.
        session.close()

    # A successful post-reload checkpoint requires:
    # - a fresh JavaScript execution context,
    # - the expected canonical primary save,
    # - and the recovery copy written by the production startup save path.
    return wait_for_seeded_reload(package, seeded, timeout=20)


def read_save(session):
    expression = f"""(() => {{
      const raw = localStorage.getItem({json.dumps(SAVE_KEY)});
      return raw ? JSON.parse(raw) : null;
    }})()"""
    value = session.cdp.evaluate(expression)
    if not isinstance(value, dict):
        fail("packaged WebView did not contain a readable canonical save")
    return value


def wait_for_state(package, predicate, description, timeout=20):
    deadline = time.monotonic() + timeout
    last = None
    while time.monotonic() < deadline:
        session = None
        try:
            session = attach_webview(package, timeout=5)
            usable_runtime(session, timeout=5)
            last = read_save(session)
            if predicate(last):
                return last
        except Exception:
            pass
        finally:
            if session:
                session.close()
        time.sleep(0.4)
    fail(
        f"timed out waiting for {description}; "
        f"last save={json.dumps(last, sort_keys=True) if last else None}"
    )


def assert_range(value, low, high, label):
    if not isinstance(value, (int, float)) or not low <= value <= high:
        fail(f"{label} expected in [{low}, {high}], got {value}")


def assert_basic_continuity(actual, seeded):
    if actual.get("schemaVersion") != 1:
        fail(f"schemaVersion continuity failed: {actual.get('schemaVersion')}")
    for key in ("riftMode", "farmDepth", "farmReturnDepth", "maxDepthEver", "activeParty"):
        if actual.get(key) != seeded.get(key):
            fail(
                f"save continuity mismatch for {key}: "
                f"expected {seeded.get(key)!r}, got {actual.get(key)!r}"
            )


def cold_launch(apk, package, activity):
    wait_for_device()
    install_apk(apk, package)
    clear_app(package)
    force_stop(package)
    launch(package, activity)
    session = attach_webview(package)
    try:
        runtime = usable_runtime(session)
        log(f"cold launch usable: {runtime.get('url')}")
    finally:
        session.close()


def force_stop_continuity(fixtures_path, package, activity):
    seeded = load_fixture(fixtures_path, "lifecycle-basic")
    persisted = reload_seeded_save(package, seeded)
    log(
        "seeded lifecycle-basic through packaged reload: "
        f"schema={persisted.get('schemaVersion')} mode={persisted.get('riftMode')}"
    )

    force_stop(package)
    launch(package, activity)
    actual = wait_for_state(
        package,
        lambda save: isinstance(save, dict),
        "canonical save after force-stop relaunch",
        timeout=10,
    )
    assert_basic_continuity(actual, seeded)
    log(
        "force-stop/relaunch continuity passed: "
        f"schema={actual.get('schemaVersion')} mode={actual.get('riftMode')} "
        f"depth={actual.get('depth')}"
    )
    return actual


def background_resume(package, activity):
    session = attach_webview(package)
    try:
        usable_runtime(session)
        before = read_save(session)
    finally:
        session.close()

    before_offline = float(before.get("totalOfflineSeconds", 0))
    before_last_seen = float(before.get("lastSeen", 0))
    before_kills = int(before.get("totalKills", 0))
    before_lumen = float(before.get("lumen", 0))

    background_seconds = 8
    press_home()
    time.sleep(background_seconds)
    launch(package, activity)

    after = wait_for_state(
        package,
        lambda save: float(save.get("totalOfflineSeconds", 0)) >= before_offline + 5,
        "one native background offline interval",
    )
    delta = float(after.get("totalOfflineSeconds", 0)) - before_offline
    assert_range(delta, 5, background_seconds + 6, "background offline seconds")
    if float(after.get("lastSeen", 0)) <= before_last_seen:
        fail("resume did not advance lastSeen")
    if (
        int(after.get("totalKills", 0)) <= before_kills
        and float(after.get("lumen", 0)) <= before_lumen
    ):
        fail("background/resume did not advance lifecycle-basic progression")

    consumed = float(after.get("totalOfflineSeconds", 0))
    log(f"background/resume applied one offline interval: {delta:.2f}s")

    force_stop(package)
    launch(package, activity)
    restarted = wait_for_state(
        package,
        lambda save: isinstance(save, dict),
        "canonical save after immediate relaunch",
        timeout=10,
    )

    duplicate_delta = float(restarted.get("totalOfflineSeconds", 0)) - consumed
    if abs(duplicate_delta) > 0.01:
        fail(
            "immediate force-stop/relaunch duplicated offline progression: "
            f"before={consumed}, after={restarted.get('totalOfflineSeconds')}"
        )
    log("immediate force-stop/relaunch did not duplicate consumed background interval")


def boss_background(fixtures_path, package, activity):
    boss = load_fixture(fixtures_path, "chronology-boss-retry")
    persisted = reload_seeded_save(package, boss)
    log(
        "seeded chronology-boss-retry through packaged reload: "
        f"mode={persisted.get('riftMode')} depth={persisted.get('depth')}"
    )

    force_stop(package)
    launch(package, activity)
    required = {
        "riftMode": "push",
        "depth": 20,
        "enemyDepth": 20,
        "farmReturnDepth": 0,
    }
    session = attach_webview(package)
    try:
        usable_runtime(session)
        before = read_save(session)
        for key, expected in required.items():
            if before.get(key) != expected:
                fail(
                    f"Boss fixture did not establish {key}={expected!r}; "
                    f"got {before.get(key)!r}"
                )
    finally:
        session.close()

    press_home()
    time.sleep(8)
    launch(package, activity)
    session = attach_webview(package)
    try:
        usable_runtime(session)
        after = read_save(session)
    finally:
        session.close()

    for key, expected in required.items():
        if after.get(key) != expected:
            fail(
                f"short native Boss background changed {key}: "
                f"expected {expected!r}, got {after.get(key)!r}"
            )
    log("short native Boss background preserved Push/Boss Rift 20 intent")


def self_test():
    now = 2_000_000_000_000
    sample = {
        "now": "__NOW__",
        "today": "__TODAY__",
        "range": ["__NOW_MINUS_60S__", "__NOW_PLUS_10M__"],
    }
    materialized = materialize(sample, now)
    assert materialized["now"] == now
    assert materialized["range"][0] == now - 60_000
    assert materialized["range"][1] == now + 600_000

    seeded = {
        "schemaVersion": 1,
        "riftMode": "farm",
        "farmDepth": 3,
        "farmReturnDepth": 4,
        "maxDepthEver": 30,
        "activeParty": ["ember"],
    }
    assert_basic_continuity(copy.deepcopy(seeded), seeded)
    bad = dict(seeded)
    bad["schemaVersion"] = 2
    try:
        assert_basic_continuity(bad, seeded)
    except SmokeError:
        pass
    else:
        raise AssertionError("continuity negative self-test unexpectedly passed")
    log("self-test passed: fixture materialization and continuity assertions")


def main():
    parser = argparse.ArgumentParser(
        description="Native Android lifecycle smoke for packaged Lumenfall APK."
    )
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--apk", default="Lumenfall.apk")
    parser.add_argument("--fixtures", default="tests/behavioral/fixtures.json")
    parser.add_argument("--package", default="com.lumenfall.app")
    parser.add_argument("--activity", default=".MainActivity")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0

    apk = Path(args.apk).resolve()
    fixtures = Path(args.fixtures).resolve()
    if not fixtures.is_file():
        fail(f"fixtures file not found: {fixtures}")

    started = time.monotonic()
    try:
        cold_launch(apk, args.package, args.activity)
        force_stop_continuity(fixtures, args.package, args.activity)
        background_resume(args.package, args.activity)
        boss_background(fixtures, args.package, args.activity)
    finally:
        adb("forward", "--remove-all", check=False)

    elapsed = time.monotonic() - started
    log(f"ALL NATIVE LIFECYCLE SCENARIOS PASSED in {elapsed:.1f}s")
    log(
        "screen-lock cycle intentionally not required: "
        "HOME background/resume is the stable acceptance gate"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SmokeError as exc:
        print(f"[native-lifecycle] FAILURE: {exc}", file=sys.stderr, flush=True)
        raise SystemExit(1)
