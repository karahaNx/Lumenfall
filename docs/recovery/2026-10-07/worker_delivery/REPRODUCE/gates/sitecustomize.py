"""Read-only process observer. It does not change return values or timeouts."""
import os, pathlib, subprocess, json, time
_original = subprocess.run
_count = 0
def _observe(command, *args, **kwargs):
    global _count
    root = os.environ.get('QA_PROCESS_ROOT')
    if not root:
        return _original(command, *args, **kwargs)
    _count += 1
    out = pathlib.Path(root) / ('%s-%04d' % (os.getpid(), _count))
    out.mkdir(parents=True, exist_ok=False)
    started = time.monotonic()
    meta = {'command':command, 'timeout':kwargs.get('timeout'), 'cwd':str(pathlib.Path.cwd()), 'timed_out':False}
    def save(value, name):
        if isinstance(value, bytes): (out/name).write_bytes(value)
        else: (out/name).write_text(value or '', encoding='utf-8')
    try:
        result = _original(command, *args, **kwargs)
        meta['exitcode'] = result.returncode
        save(result.stdout, 'stdout.txt'); save(result.stderr, 'stderr.txt')
        return result
    except subprocess.TimeoutExpired as error:
        meta.update(exitcode=None, timed_out=True)
        save(error.stdout, 'stdout.txt'); save(error.stderr, 'stderr.txt')
        raise
    except BaseException as error:
        meta.update(exitcode=None, error=repr(error)); raise
    finally:
        meta['elapsed_seconds'] = time.monotonic()-started
        (out/'process.json').write_text(json.dumps(meta, indent=2)+'\n')
subprocess.run = _observe
