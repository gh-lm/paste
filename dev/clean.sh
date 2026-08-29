#!/usr/bin/env bash
# Remove the preview pages so nothing developer-only can reach a package.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
rm -f "$here"/chrome/dev-*.html "$here"/chrome/dev-stub.js
rm -f "$here"/firefox/dev-*.html "$here"/firefox/dev-stub.js
echo "preview pages removed"
