#!/usr/bin/env python3
"""Restore byte-identical logical payloads from the recovery coverage map."""
from pathlib import Path
import argparse,json,hashlib

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('archive',help='Original archive filename from ARCHIVE_COVERAGE.json')
parser.add_argument('destination',type=Path,help='New or empty destination directory')
args=parser.parse_args()
repo=Path(__file__).resolve().parents[2]
coverage=json.loads((repo/'docs/recovery/2026-10-07/ARCHIVE_COVERAGE.json').read_text())
matches=[x for x in coverage if x['archive']==args.archive]
if len(matches)!=1:parser.error('Expected one archive match')
def read_payload(repository_path):
    path=(repo/repository_path).resolve()
    if not path.is_relative_to(repo):raise ValueError('Unsafe repository path')
    if path.is_file():return path.read_bytes()
    metadata=json.loads(Path(str(path)+'.parts/PARTS.json').read_text())
    chunks=[]
    for row in metadata['parts']:
        part=(repo/row['path']).resolve()
        if not part.is_relative_to(repo):raise ValueError('Unsafe part path')
        value=part.read_bytes()
        if len(value)!=row['bytes'] or hashlib.sha256(value).hexdigest()!=row['sha256']:
            raise ValueError('Invalid artifact part')
        chunks.append(value)
    value=b''.join(chunks)
    if len(value)!=metadata['bytes'] or hashlib.sha256(value).hexdigest()!=metadata['sha256']:
        raise ValueError('Invalid reconstructed artifact')
    return value

destination=args.destination.resolve()
if destination.exists() and any(destination.iterdir()):parser.error('Destination must be empty')
destination.mkdir(parents=True,exist_ok=True)
for row in matches[0]['payloads']:
    target=(destination/row['original_path']).resolve()
    if not target.is_relative_to(destination):raise ValueError('Unsafe relative path')
    data=read_payload(row['repository_path'])
    if len(data)!=row['bytes'] or hashlib.sha256(data).hexdigest()!=row['sha256']:
        raise ValueError('Payload mismatch: '+row['original_path'])
    target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
print(f"Restored {len(matches[0]['payloads'])} verified payloads to {destination}")
