#!/usr/bin/env python3
"""Check startup references and, optionally, preserved archive integrity."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import runpy
import zipfile

ROOT = Path(__file__).resolve().parents[2]
RECOVERY = ROOT / 'docs/recovery/2026-10-07'
CORE = ROOT / 'docs/handoffs/01_06/2026-10-07'
GAMEPLAY = ROOT / 'docs/handoffs/02_08/2026-10-07'
ARCHIVE = ROOT / 'archive/02_08-b2-runtime-2026-10-07'
STARTUP = ['AGENTS.md', 'PROJECT_BOOTSTRAP.txt', 'docs/CHAT_OWNERSHIP.md',
           'docs/agents/00_LEAD.md', 'docs/PROJECT_STATE.md']
REQUIRED = STARTUP + ['PROJECT_INSTRUCTIONS.txt', 'docs/CONTEXT_INDEX.md',
    'docs/project/CODEX_START.md', 'docs/project/KNOWN_ISSUES.md',
    'docs/decisions/2026-10-07-codex-project-ready.md',
    'docs/project/SAVE_OFFLINE_AUTOASCEND_DIAGNOSE_2026-10-07.txt',
    'scripts/codex/setup.sh', 'scripts/recovery/restore_candidate.py',
    'docs/recovery/2026-10-07/SOURCE_INDEX.txt',
    'docs/handoffs/01_06/2026-10-07/SOURCE_INDEX.md',
    'docs/handoffs/02_08/2026-10-07/START_HER.txt',
    'docs/handoffs/02_08/2026-10-07/Source_Index.txt',
    'docs/handoffs/02_08/2026-10-07/SUMMARY/identity.json',
    'docs/handoffs/02_08/2026-10-07/SOURCE_SNAPSHOT_MANIFEST.json']
REQUIRED += ['docs/qa/offline-autoascend-2026-10-07/Source_Index.txt',
             'docs/qa/offline-autoascend-2026-10-07/reproduce.cjs']


def inside(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError('Unsafe path: ' + str(relative))
    return path


def check_hash(data, row, label):
    if len(data) != row['bytes'] or hashlib.sha256(data).hexdigest() != row['sha256']:
        raise ValueError('Integrity mismatch: ' + label)


def check_startup():
    for path in REQUIRED:
        if not (ROOT / path).is_file():
            raise ValueError('Missing entrypoint: ' + path)
    docs = STARTUP + ['README.md', 'docs/CONTEXT_INDEX.md', 'docs/project/CODEX_START.md',
                      'docs/project/KNOWN_ISSUES.md']
    links = 0
    for name in docs:
        path = ROOT / name
        text = path.read_text()
        for target in re.findall(r'\]\(([^)]+)\)', text):
            if target.startswith(('http:', 'https:', 'mailto:', '#')):
                continue
            target = target.split('#')[0]
            if not inside(path.parent, target).exists():
                raise ValueError(f'Missing link in {name}: {target}')
            links += 1
    size = sum((ROOT / name).stat().st_size for name in STARTUP)
    if size > 32768:
        raise ValueError('Mandatory startup exceeds 32 KiB')
    print(f'PASS: {len(REQUIRED)} entrypoints, {links} local Markdown links, Lead startup {size} bytes')


def check_archives():
    count = 0
    module = runpy.run_path(str(ROOT / 'scripts/recovery/restore_candidate.py'))
    manifest = json.loads((RECOVERY / 'MANIFEST.json').read_text())
    for name, row in manifest['payloads'].items():
        path = RECOVERY / 'publication_originals' / name if name in (
            'PROJECT_BOOTSTRAP.txt', 'PROJECT_INSTRUCTIONS.txt') else inside(ROOT, name)
        check_hash(path.read_bytes(), row, name)
        count += 1
    for root in (CORE, GAMEPLAY):
        manifest = json.loads((root / 'MANIFEST.json').read_text())
        rows = manifest['payloads'] if root == GAMEPLAY else manifest
        for name, row in rows.items():
            data = module['delivery_payload'](name) if root == GAMEPLAY else inside(root, name).read_bytes()
            check_hash(data, row, str(root / name))
            count += 1
    manifest = json.loads((ARCHIVE / 'archive-manifest.json').read_text())
    raw = bytearray()
    for row in manifest['parts']:
        data = inside(ROOT, row['path']).read_bytes()
        check_hash(data, row, row['path'])
        raw.extend(data)
        count += 1
    check_hash(raw, {'bytes': manifest['archive_bytes'], 'sha256': manifest['archive_sha256']}, 'Gameplay original ZIP')
    cache = {}
    for archive in json.loads((RECOVERY / 'ARCHIVE_COVERAGE.json').read_text()):
        for row in archive['payloads']:
            name = row['repository_path']
            if name not in cache:
                path = inside(ROOT, name)
                if path.is_file():
                    data = path.read_bytes()
                else:
                    parts = json.loads(Path(str(path) + '.parts/PARTS.json').read_text())
                    buffers = []
                    for part in parts['parts']:
                        data = inside(ROOT, part['path']).read_bytes()
                        check_hash(data, part, part['path'])
                        buffers.append(data)
                    data = b''.join(buffers)
                    check_hash(data, parts, name)
                cache[name] = (len(data), hashlib.sha256(data).hexdigest())
            if cache[name] != (row['bytes'], row['sha256']):
                raise ValueError('Logical original mismatch: ' + name)
            count += 1
    manifest, payloads = module['verified_sources']()
    qa = ROOT / 'docs/qa/offline-autoascend-2026-10-07'
    for name, expected in json.loads((qa / 'SHA256.json').read_text()).items():
        if hashlib.sha256(inside(qa, name).read_bytes()).hexdigest() != expected:
            raise ValueError('Offline QA integrity mismatch: ' + name)
        count += 1
    with zipfile.ZipFile(qa / 'Lumenfall_Save_Offline_AutoAscend_Evidens_2026-10-07.zip') as archive:
        if archive.testzip() is not None:
            raise ValueError('Offline QA original ZIP CRC failed')
    print(f"PASS: {count} archive/coverage checks; {len(payloads)} sources, tree {manifest['tree']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archives', action='store_true', help='hash-check preserved archives and candidate tree')
    args = parser.parse_args()
    check_startup()
    if args.archives:
        check_archives()


if __name__ == '__main__':
    main()
