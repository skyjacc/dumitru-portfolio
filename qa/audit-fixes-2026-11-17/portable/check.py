"""Run the real catalogue adapter in a differently named isolated source copy."""
from pathlib import Path
import json
import shutil
import subprocess

root = Path(__file__).resolve().parents[3]
destination = Path(__file__).resolve().parent / 'dumitru-portfolio'
destination.mkdir(parents=True, exist_ok=True)
files = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
for relative in set(files):
    if not relative or relative.startswith('qa/') or not (root / relative).is_file():
        continue
    target = destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / relative, target)
assert not (destination.parent / 'portfolio-lab').exists()
results = []
for command in [
    ['node', 'scripts/adapt-data.cjs', '--about-only'],
    ['node', 'scripts/adapt-material-fit.cjs'],
    ['node', 'scripts/adapt-work-composition.cjs', '--check'],
    ['node', 'scripts/adapt-landscape-fit.cjs', '--check'],
    ['node', 'scripts/adapt-navigation.cjs', '--check'],
    ['node', 'scripts/adapt-media-intent.cjs', '--check'],
]:
    result = subprocess.run(command, cwd=destination, capture_output=True, encoding='utf-8')
    results.append({'command': command, 'exit': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr})
    print(' '.join(command), 'PASS' if result.returncode == 0 else 'FAIL')
    if result.returncode:
        print(result.stderr)
        break
Path(__file__).with_name('report.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
raise SystemExit(any(result['exit'] for result in results))
