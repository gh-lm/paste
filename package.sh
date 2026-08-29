#!/usr/bin/env bash
# Build the zip files to upload to the Chrome Web Store and to Mozilla.
# Refuses to run if any developer-only file is sitting in a shipping folder.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
version="$(python3 -c "import json;print(json.load(open('$here/chrome/manifest.json'))['version'])")"

for folder in chrome firefox; do
  strays="$(find "$here/$folder" -name 'dev-*' -o -name '*.map' -o -name '.DS_Store' | head)"
  if [ -n "$strays" ]; then
    echo "Refusing to package: developer files are still in $folder/" >&2
    echo "$strays" >&2
    echo "Run dev/clean.sh first." >&2
    exit 1
  fi
done

"$here/build-firefox.sh" > /dev/null

rm -rf "$here/dist"
mkdir -p "$here/dist"
for folder in chrome firefox; do
  out="$here/dist/pastemorphic-$folder-$version.zip"
  ( cd "$here/$folder" && zip -qr "$out" . -x '.*' )
  echo "$(basename "$out")  $(du -h "$out" | cut -f1)"
done

echo
echo "contents:"
unzip -l "$here/dist/pastemorphic-chrome-$version.zip" | tail -n +4 | head -20
