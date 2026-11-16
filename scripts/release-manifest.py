"""Hash publishable static assets, respecting this project's exact-path ignores."""
from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[1]/'site'
out=Path(sys.argv[1])
ignore={'.vercelignore',*(s.strip() for s in (root/'.vercelignore').read_text(encoding='utf-8-sig').splitlines() if s.strip() and not s.lstrip().startswith('#'))}
files=[]
for f in sorted(root.rglob('*')):
    if not f.is_file(): continue
    rel=f.relative_to(root).as_posix()
    if any(rel==x or rel.startswith(x+'/') for x in ignore): continue
    data=f.read_bytes()
    files.append({'file':rel,'sha':hashlib.sha1(data).hexdigest(),'size':len(data)})
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(files,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(files,ensure_ascii=False))
