#!/usr/bin/env bash
# Drops a fake-browser stub and two preview pages into chrome/ so popup.html and
# options.html can be opened in an ordinary tab. Run dev/clean.sh before packing.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
cp "$here/dev/stub.js" "$here/chrome/dev-stub.js"
# the query string stops a browser serving a stale copy between edits
stamp="$(date +%s)"
for page in popup options; do
  sed "s#<script src=\"lib/store.js\">#<script src=\"dev-stub.js?$stamp\"></script><script src=\"lib/store.js?$stamp\">#" \
    "$here/chrome/$page.html" > "$here/chrome/dev-$page.html"
done
echo "preview pages written: chrome/dev-popup.html, chrome/dev-options.html"
