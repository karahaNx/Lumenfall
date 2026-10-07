"""Restore the original delivery ZIP from the archived parts."""
from pathlib import Path
import hashlib
import json
import os

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'archive-manifest.json').read_text())
destination = root / manifest['archive_filename']
temporary = destination.with_suffix('.zip.tmp')
digest = hashlib.sha256()
total = 0
try:
    with temporary.open('wb') as output:
        for entry in manifest['parts']:
            data = (root / Path(entry['path']).name).read_bytes()
            if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
                raise SystemExit('Part integrity check failed: ' + entry['path'])
            digest.update(data)
            total += len(data)
            output.write(data)
    if total != manifest['archive_bytes'] or digest.hexdigest() != manifest['archive_sha256']:
        raise SystemExit('Archive integrity check failed')
    os.replace(temporary, destination)
finally:
    temporary.unlink(missing_ok=True)
print(f'PASS: {destination.name} ({total} bytes), SHA256 {digest.hexdigest()}')
