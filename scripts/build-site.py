#!/usr/bin/env python3
"""Build a runtime-only copy for static hosting. Does not copy local user data."""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True, help='Separate Sites project directory')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
source = repo / 'website'
project = args.output.resolve()
if project == repo or project == source or repo in project.parents:
    raise SystemExit('Use a separate output project outside the GitHub checkout.')
destination = project / 'dist'
files = {'index.html', 'styles.css', 'lifestyle.css', 'app.js', 'daily.js',
         'comeback.js', 'lifestyle.js', 'journey.js', 'rewards.js', 'coach.js',
         'companion.js', 'vendor/gsap.min.js'}
for filename in list(files):
    for asset in re.findall(r'assets/[A-Za-z0-9_.-]+\.(?:png|svg|ttf|woff2?)', (source / filename).read_text()):
        files.add(asset)
for persona in ['calm', 'snark', 'fiery', 'gentle']:
    version = 'v4' if persona in ['snark', 'fiery'] else 'v2'
    files.add(f'assets/kora-{persona}-sport-{version}.png')
    files.add(f'assets/kora-{persona}-blink.png')
for style in ['lazy', 'spark', 'busy', 'feel']:
    files.add(f'assets/kora-life-{style}-v4.png')
files.update(['assets/Manrope-OFL.txt', 'assets/Xiaowei-OFL.txt'])
missing = sorted(name for name in files if not (source / name).is_file())
if missing:
    raise SystemExit('Missing runtime files: ' + ', '.join(missing))
project.mkdir(parents=True, exist_ok=True)
if destination.exists():
    shutil.rmtree(destination)
destination.mkdir()
for filename in sorted(files):
    target = destination / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source / filename, target)
identity = repo / '.openai/hosting.json'
if identity.exists():
    (project / '.openai').mkdir(exist_ok=True)
    shutil.copyfile(identity, project / '.openai/hosting.json')
manifest = {name: hashlib.sha256((destination / name).read_bytes()).hexdigest() for name in sorted(files)}
print(json.dumps({'output': str(destination), 'file_count': len(files),
                  'size_bytes': sum((destination / name).stat().st_size for name in files),
                  'files': manifest}, ensure_ascii=False, indent=2))
