#!/usr/bin/env bash
# Rebuild the Firefox copy from the Chrome one. Run this after changing
# anything in chrome/ so the two stay identical apart from the manifest.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$here/firefox"
mkdir -p "$here/firefox"
cp -r "$here/chrome/." "$here/firefox/"

python3 - "$here" <<'PY'
import json, sys, pathlib
here = pathlib.Path(sys.argv[1])
m = json.loads((here / 'chrome' / 'manifest.json').read_text())

# Firefox runs the background as an event page and has no importScripts,
# so the store is listed here instead.
m['background'] = {'scripts': ['lib/store.js', 'background.js']}
m.pop('minimum_chrome_version', None)
m['options_ui'] = {'page': m.pop('options_page'), 'open_in_tab': True}
m['browser_specific_settings'] = {
    'gecko': {'id': 'lightmorphic-paste@charlie.cx', 'strict_min_version': '115.0'}
}
(here / 'firefox' / 'manifest.json').write_text(json.dumps(m, indent=2) + '\n')
PY

echo "firefox/ rebuilt from chrome/"
