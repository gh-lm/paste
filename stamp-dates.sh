#!/usr/bin/env bash
# Put each page's real last-changed date into its own footer, its schema and
# the sitemap, taken from the commit that last touched that file. Typing a date
# by hand into nine pages is nine dates that go wrong; this one cannot.
#
# Run it before committing a content change. It ignores its own edit, so
# running it twice in a row changes nothing.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
cd "$here/docs"

for f in *.html; do
  d="$(git log -1 --format=%cs -- "$f" 2>/dev/null || true)"
  [ -z "$d" ] && d="$(date -I)"
  pretty="$(date -d "$d" '+%-d %B %Y')"
  sed -i -E "s#<time datetime=\"[0-9-]+\">[^<]*#<time datetime=\"$d\">$pretty#" "$f"
  sed -i -E "s#(\"dateModified\": *\")[0-9-]+#\1$d#" "$f"
done

# the sitemap lists every indexable page, so 404.html stays out of it
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for f in index.html help.html faq.html privacy.html cookies.html terms.html accessibility.html complaints.html; do
    [ -f "$f" ] || continue
    d="$(git log -1 --format=%cs -- "$f" 2>/dev/null || date -I)"
    [ -z "$d" ] && d="$(date -I)"
    case "$f" in
      index.html) loc="https://paste.lightmorphic.com/"; pri="1.0" ;;
      help.html|faq.html) loc="https://paste.lightmorphic.com/$f"; pri="0.8" ;;
      *) loc="https://paste.lightmorphic.com/$f"; pri="0.4" ;;
    esac
    printf '  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <priority>%s</priority>\n  </url>\n' "$loc" "$d" "$pri"
  done
  echo '</urlset>'
} > sitemap.xml

echo "dates and sitemap stamped from git"
