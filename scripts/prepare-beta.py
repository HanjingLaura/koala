#!/usr/bin/env python3
"""Prepare a runtime-only Vercel beta project. Never copies environment files."""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, help='New, empty deployment directory outside the repository')
parser.add_argument('--base-path', default='', choices=['', '/koala'], help='Optional portfolio mount path')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve() if args.output else Path(tempfile.mkdtemp(prefix='kora-beta-'))
if output == repo or repo in output.parents:
    raise SystemExit('Choose an output directory outside the repository.')
if output.exists() and any(output.iterdir()):
    raise SystemExit('Output directory must be empty; existing files were kept.')
output.mkdir(parents=True, exist_ok=True)

with tempfile.TemporaryDirectory(prefix='kora-runtime-') as scratch:
    built = subprocess.run([sys.executable, str(repo/'scripts/build-site.py'), '--output', scratch],
                           check=True, capture_output=True, text=True, encoding='utf-8')
    assets = json.loads(built.stdout)
    shutil.copytree(Path(scratch)/'dist', output/'public')

(output/'website').mkdir()
for name in ['chat-context.js','daily.js']:
    shutil.copyfile(repo/'website'/name, output/'website'/name)
(output/'api').mkdir()
(output/'server').mkdir()
for name in ['index.mjs', 'prompts.mjs']:
    shutil.copyfile(repo/'server'/name, output/'server'/name)
shutil.copyfile(repo/'server/vercel.mjs', output/'api/index.mjs')
(output/'package.json').write_text(json.dumps({
    'name':'kora-beta', 'private':True, 'version':'0.21.0',
    'engines':{'node':'22.x'}
}, indent=2)+'\n', encoding='utf-8')
(output/'vercel.json').write_text(json.dumps({
    '$schema':'https://openapi.vercel.sh/vercel.json',
    'framework':None, 'outputDirectory':'public', 'buildCommand':'', 'installCommand':'',
    'regions':['hkg1'], 'env':{'NODEJS_HELPERS':'0','CHAT_AUTH_MODE':'vercel'},
    'functions':{'api/index.mjs':{'maxDuration':60, 'supportsCancellation':True}},
    'redirects':([{'source':args.base_path,'destination':args.base_path+'/', 'permanent':False}] if args.base_path else []),
    'rewrites':([
        {'source':args.base_path+'/api/chat', 'destination':'/api/index?route=chat'},
        {'source':args.base_path+'/api/health', 'destination':'/api/index?route=health'},
        {'source':args.base_path+'/', 'destination':'/index.html'},
        {'source':args.base_path+'/:path*', 'destination':'/:path*'}
    ] if args.base_path else [])+[
        {'source':'/api/chat', 'destination':'/api/index?route=chat'},
        {'source':'/api/health', 'destination':'/api/index?route=health'}
    ],
    'headers':[{'source':'/(.*)', 'headers':[
        {'key':'X-Content-Type-Options','value':'nosniff'},
        {'key':'X-Robots-Tag','value':'noindex, nofollow'},
        {'key':'Referrer-Policy','value':'strict-origin-when-cross-origin'}
    ]}]
}, indent=2)+'\n', encoding='utf-8')
(output/'.vercelignore').write_text('.env\n.env.*\n*.key\n*.pem\n', encoding='utf-8')
print(json.dumps({'output':str(output),'static_files':assets['file_count'],
                  'static_bytes':assets['size_bytes'],
                  'required_secrets':['DASHSCOPE_API_KEY'],
                  'optional_env':['DASHSCOPE_BASE_URL','DASHSCOPE_MODEL','CHAT_RATE_LIMIT','CHAT_CONCURRENCY']},ensure_ascii=False))
