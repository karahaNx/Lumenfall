#!/usr/bin/env python3
"""Restore the frozen 96-file B2 candidate without network or Git history."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT = ROOT / 'docs/handoffs/02_08/2026-10-07'


def delivery_payload(name):
    path = (SNAPSHOT / name).resolve()
    if not path.is_relative_to(SNAPSHOT):
        raise ValueError('Unsafe delivery path')
    if path.is_file():
        return path.read_bytes()
    metadata = json.loads(Path(str(path) + '.parts/PARTS.json').read_text())
    buffers = []
    for row in metadata['parts']:
        part = (SNAPSHOT / row['path']).resolve()
        if not part.is_relative_to(SNAPSHOT):
            raise ValueError('Unsafe raw part path')
        data = part.read_bytes()
        if len(data) != row['bytes'] or hashlib.sha256(data).hexdigest() != row['sha256']:
            raise ValueError('Raw part integrity failed')
        buffers.append(data)
    data = b''.join(buffers)
    if len(data) != metadata['bytes'] or hashlib.sha256(data).hexdigest() != metadata['sha256']:
        raise ValueError('Reconstructed raw integrity failed')
    return data


def verified_sources():
    manifest = json.loads((SNAPSHOT / 'SOURCE_SNAPSHOT_MANIFEST.json').read_text())
    payloads = []
    seen = set()
    for row in manifest['source']:
        logical = Path(row['path'])
        source = (SNAPSHOT / row['snapshot_path']).resolve()
        if logical.is_absolute() or '..' in logical.parts or not source.is_relative_to(SNAPSHOT):
            raise ValueError('Unsafe snapshot path')
        if row['path'] in seen or row['mode'] not in ('100644', '100755'):
            raise ValueError('Duplicate path or unsupported file mode')
        seen.add(row['path'])
        data = source.read_bytes()
        blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        if len(data) != row['bytes'] or hashlib.sha256(data).hexdigest() != row['sha256'] or blob != row['gitblob']:
            raise ValueError('Source integrity failed: ' + row['path'])
        payloads.append((row, data))
    tree = {}
    for row, _ in payloads:
        node = tree
        parts = Path(row['path']).parts
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = (row['mode'], row['gitblob'])

    def tree_hash(node):
        raw = b''
        for name, value in sorted(node.items(), key=lambda item: (item[0] + ('/' if isinstance(item[1], dict) else '')).encode()):
            mode, sha = ('40000', tree_hash(value)) if isinstance(value, dict) else value
            raw += mode.encode() + b' ' + name.encode() + b'\0' + bytes.fromhex(sha)
        return hashlib.sha1(b'tree ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()

    actual = tree_hash(tree)
    if actual != manifest['tree'] or len(payloads) != 96:
        raise ValueError('Candidate tree/file count mismatch: ' + actual)
    return manifest, payloads


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path, help='new or empty directory outside the repository')
    parser.add_argument('--evidence', type=Path, help='optional separate new/empty directory for all original delivery payloads')
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination.is_relative_to(ROOT):
        parser.error('Use a separate directory outside the repository')
    if destination.exists() and (not destination.is_dir() or any(destination.iterdir())):
        parser.error('Destination must be new or empty')
    manifest, payloads = verified_sources()
    evidence = args.evidence.resolve() if args.evidence else None
    originals = []
    if evidence:
        if evidence.is_relative_to(ROOT) or evidence.is_relative_to(destination) or destination.is_relative_to(evidence):
            parser.error('Evidence directory must be separate from source and repository')
        if evidence.exists() and (not evidence.is_dir() or any(evidence.iterdir())):
            parser.error('Evidence directory must be new or empty')
        original_manifest = json.loads((SNAPSHOT / 'MANIFEST.json').read_text())
        for name, row in original_manifest['payloads'].items():
            data = delivery_payload(name)
            if len(data) != row['bytes'] or hashlib.sha256(data).hexdigest() != row['sha256']:
                raise ValueError('Delivery integrity failed: ' + name)
            originals.append((name, data))
    destination.mkdir(parents=True, exist_ok=True)
    for row, data in payloads:
        target = destination / row['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        target.chmod(0o755 if row['mode'] == '100755' else 0o644)
    print(f"PASS: restored {len(payloads)} files; tree {manifest['tree']} to {destination}")
    if evidence:
        evidence.mkdir(parents=True, exist_ok=True)
        for name, data in originals:
            target = evidence / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        (evidence / 'MANIFEST.json').write_bytes((SNAPSHOT / 'MANIFEST.json').read_bytes())
        print(f'PASS: restored {len(originals)} original delivery payloads and manifest to {evidence}')


if __name__ == '__main__':
    main()
