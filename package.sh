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
  out="$here/dist/lightmorphic-paste-$folder-$version.zip"
  # the GPL asks for its text to travel with the work, so it goes in the package
  cp "$here/LICENSE" "$here/$folder/LICENSE"
  ( cd "$here/$folder" && zip -qr "$out" . -x '.*' )
  rm -f "$here/$folder/LICENSE"
  echo "$(basename "$out")  $(du -h "$out" | cut -f1)"
done

# the font licence must ship beside the font itself
for folder in chrome firefox; do
  if ! unzip -l "$here/dist/lightmorphic-paste-$folder-$version.zip" | grep -q 'fonts/OFL.txt'; then
    echo "Refusing: fonts/OFL.txt is missing from the $folder package." >&2
    echo "Manrope is under the SIL Open Font License, which requires it." >&2
    exit 1
  fi
done

echo
echo "contents:"
unzip -l "$here/dist/lightmorphic-paste-chrome-$version.zip" | tail -n +4 | head -20
