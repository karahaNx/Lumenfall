"""Mandatory controls of run_scenario's actual raw subprocess/result gate."""
import contextlib
import inspect
import io
import json
import subprocess
import sys
import tempfile
import types
from pathlib import Path


def qa_dom(body=None, status="pass", scenario="support-stacking", marker="", tag_scenario=True):
    if body is None:
        body = json.dumps({"scenario": scenario, "status": status, "detail": {}, "runtimeErrors": []})
    attr = ' data-scenario="' + scenario + '"' if tag_scenario else ""
    return '<html' + marker + '><body><pre id="qa-result" data-status="' + status + '"' + attr + '>' + body + '</pre></body></html>'


def exercise(gate, outcome, root=None):
    namespace = gate.__globals__
    original = {key: namespace[key] for key in ("subprocess", "RAW_ARTIFACT_ROOT")}
    calls = []

    def controlled_run(command, **kwargs):
        calls.append({"command": command, "kwargs": kwargs})
        assert kwargs == {"capture_output": True, "text": True, "timeout": 25}, "raw process deadline/options changed"
        assert "--virtual-time-budget=1500" in command and "--dump-dom" in command, "raw browser flags changed"
        if callable(outcome):
            return outcome(command, kwargs)
        if isinstance(outcome, BaseException):
            raise outcome
        return outcome

    namespace.update(subprocess=types.SimpleNamespace(run=controlled_run, TimeoutExpired=subprocess.TimeoutExpired),
                     RAW_ARTIFACT_ROOT=root)
    report = io.StringIO()
    try:
        with contextlib.redirect_stdout(report):
            actual = gate("/controlled-browser", "http://127.0.0.1:1", "support-stacking", "fresh")
        assert len(calls) == 1, "raw gate must invoke exactly one browser process"
        return actual, report.getvalue()
    finally:
        namespace.update(original)


def completion(dom, code=0):
    return subprocess.CompletedProcess(["controlled"], code, stdout=dom, stderr="controlled stderr")


def run_contract(gate):
    passed_dom = qa_dom()
    errors = json.dumps({"scenario": "support-stacking", "status": "pass", "runtimeErrors": [{"kind": "error"}]})
    cases = [
        ("valid", completion(passed_dom), True, None),
        ("valid-layout-host-tag", completion(qa_dom(tag_scenario=False)), True, None),
        ("detail-is-unconstrained", completion(qa_dom(json.dumps({"scenario": "support-stacking", "status": "pass", "runtimeErrors": []}))), True, None),
        ("timeout-before-qa", subprocess.TimeoutExpired("controlled", 25, output=b"before QA", stderr=b"startup blocked"), False, '"timed_out": true'),
        ("timeout-partial-pass-bytes", subprocess.TimeoutExpired("controlled", 25, output=passed_dom.encode(), stderr=b"pending process"), False, '"timed_out": true'),
        ("timeout-partial-pass-str", subprocess.TimeoutExpired("controlled", 25, output=passed_dom, stderr="pending process"), False, '"timed_out": true'),
        ("timeout-none", subprocess.TimeoutExpired("controlled", 25, output=None, stderr=None), False, '"timed_out": true'),
        ("nonzero-pass", completion(passed_dom, 7), False, '"exitcode": 7'),
        ("qa-fail-exit-zero", completion(qa_dom(status="fail")), False, '"qa_status": "fail"'),
        ("runtime-marker", completion(qa_dom(marker=' data-qa-runtime-error="uncaught-error"')), False, "uncaught-error"),
        ("empty-runtime-marker", completion(qa_dom(marker=' data-qa-runtime-error=""')), False, None),
        ("runtime-errors", completion(qa_dom(errors)), False, '"runtime_error_count": 1'),
        ("missing-pre", completion('<div id="qa-result" data-status="pass"></div>'), False, "completed pre"),
        ("missing-json", completion(qa_dom("")), False, "json_error"),
        ("invalid-json", completion(qa_dom("not-json")), False, "json_error"),
        ("truncated-json", completion(qa_dom('{"scenario":')), False, "json_error"),
        ("unclosed-result", completion(passed_dom.replace('</pre>', '')), False, "completed pre"),
        ("duplicate-result", completion(passed_dom + passed_dom), False, "exactly one"),
        ("nonobject-json", completion(qa_dom('[]')), False, "must be an object"),
        ("missing-runtime-errors", completion(qa_dom('{"scenario":"support-stacking","status":"pass"}')), False, "must be an array"),
        ("invalid-runtime-errors", completion(qa_dom('{"scenario":"support-stacking","status":"pass","runtimeErrors":null}')), False, "must be an array"),
        ("json-scenario-mismatch", completion(qa_dom('{"scenario":"other","status":"pass","runtimeErrors":[]}')), False, "scenario does not match"),
        ("tag-scenario-mismatch", completion(passed_dom.replace('data-scenario="support-stacking"', 'data-scenario="other"')), False, "tag scenario does not match"),
        ("status-mismatch", completion(qa_dom('{"scenario":"support-stacking","status":"fail","runtimeErrors":[]}')), False, "status does not match"),
        ("invalid-status", completion(qa_dom('{"scenario":"support-stacking","status":null,"runtimeErrors":[]}')), False, "status does not match"),
        ("non-json-constant", completion(qa_dom('{"scenario":"support-stacking","status":"pass","runtimeErrors":[],"detail":NaN}')), False, "Non-JSON constant"),
        ("missing-tag", completion("not HTML"), False, "exactly one"),
    ]
    try:
        for name, outcome, expected, marker in cases:
            actual, report = exercise(gate, outcome)
            assert actual is expected, name + ": incorrect gate outcome"
            assert report.startswith(("PASS " if expected else "FAIL ") + "support-stacking"), name + ": incorrect report"
            if marker:
                assert marker in report, name + ": missing diagnostic " + marker
            if name == "timeout-before-qa":
                assert "before QA" in report and "startup blocked" in report, "partial logs must survive"
            print("  raw gate control " + name + ": expected " + ("PASS" if expected else "FAIL"))

        # A real child writes a complete pass then remains alive. The bounded executor
        # returns real TimeoutExpired output to the same gate; its requested browser
        # deadline above is still exactly 25s, not relaxed or replaced in production.
        def bounded_child(command, kwargs):
            script = "import sys,time;print(" + repr(passed_dom) + ",flush=True);print('bounded child pending',file=sys.stderr,flush=True);time.sleep(10)"
            return subprocess.run([sys.executable, "-u", "-c", script], capture_output=True, text=True, timeout=0.25)
        actual, report = exercise(gate, bounded_child)
        assert actual is False and '"timed_out": true' in report and '"qa_status": "pass"' in report
        assert "bounded child pending" in report, "real timeout partial stderr missing"
        print("  raw gate control real-bounded-partial-pass: expected FAIL (0.25s child budget; gate requests 25s)")

        with tempfile.TemporaryDirectory(prefix="raw-contract-artifacts-") as td:
            root = Path(td)
            long_stderr = "raw-only-prefix:" + "x" * 10000
            actual, report = exercise(gate, subprocess.TimeoutExpired("controlled", 25, output=passed_dom.encode(), stderr=long_stderr.encode()), root)
            artifacts = list(root.iterdir())
            assert actual is False and len(artifacts) == 1
            assert (artifacts[0] / "stdout.html").read_text() == passed_dom
            assert (artifacts[0] / "stderr.log").read_text() == long_stderr
            assert "raw-only-prefix:" not in report and len(report) < 8500, "diagnostics must be bounded"
            assert json.loads((artifacts[0] / "process.json").read_text())["process"]["timed_out"] is True
            print("  raw gate control complete-artifacts/bounded-log: expected FAIL")

        source = inspect.getsource(gate)
        predicate = '''passed = (not timed_out and exitcode == 0 and observation["valid"]
              and observation["qa_status"] == "pass" and not observation["runtime_markers"]
              and observation["runtime_error_count"] == 0)'''
        assert source.count(predicate) == 1, "false-accept mutation must target the actual gate"
        mutated = source.replace(predicate, '''passed = exitcode == 0 and observation["qa_status"] == "pass" and not observation["runtime_markers"]''', 1)
        # The old reporter swallowed JSON parse errors on its PASS path. Restore
        # that reporting behavior too, so this mutation reproduces false True
        # instead of an unrelated None-payload crash in the repaired reporter.
        assert mutated.count('payload.get("detail")') == 1
        mutated = mutated.replace('payload.get("detail")', 'payload.get("detail") if isinstance(payload, dict) else None', 1)
        namespace = dict(gate.__globals__)
        exec(compile(mutated, "causal-false-accept-gate", "exec"), namespace)
        broken, _ = exercise(namespace[gate.__name__], completion(qa_dom("not-json")))
        assert broken is True, "restored false accept must be causally detected"
        undo, _ = exercise(gate, completion(qa_dom("not-json")))
        assert undo is False, "undo must reject invalid JSON"
        print("  causal negative false-accept: invalid-json control rejects restored True; undo FAIL as required")

        catcher = "except subprocess.TimeoutExpired as error:"
        assert source.count(catcher) == 1, "timeout mutation must target the actual gate"
        namespace = dict(gate.__globals__)
        exec(compile(source.replace(catcher, "except OSError as error:", 1), "causal-missing-timeout-catch", "exec"), namespace)
        try:
            exercise(namespace[gate.__name__], subprocess.TimeoutExpired("controlled", 25, output=None, stderr=None))
        except subprocess.TimeoutExpired:
            print("  causal negative missing-timeout-catch: timeout control detects raised TimeoutExpired")
        else:
            raise AssertionError("missing timeout catch must fail the no-crash control")
        undo, report = exercise(gate, subprocess.TimeoutExpired("controlled", 25, output=None, stderr=None))
        assert undo is False and '"timed_out": true' in report
        print("  causal negative missing-timeout-catch undo: reported FAIL without crash")
    except Exception as error:
        print("FAIL raw-process-contract: " + type(error).__name__ + ": " + str(error))
        return False
    print("PASS raw-process-contract: 27 result controls, real timeout, artifact bounds, two causal negatives/undo")
    return True


if __name__ == "__main__":
    import run as runner
    raise SystemExit(0 if run_contract(runner.run_scenario) else 1)
