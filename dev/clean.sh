#!/usr/bin/env bash
# Remove the preview pages so nothing developer-only can reach a package.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
rm -f "$here"/chrome/dev-*.html "$here"/chrome/dev-stub.js
echo "preview pages removed"
