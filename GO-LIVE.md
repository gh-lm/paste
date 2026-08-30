# Go-live pass — 30 August 2026

Standalone GitHub Pages site at https://pastemorphic.lightmorphic.com, not a
Site Manager site, so the injection-compatibility section does not apply.
20 files, 232 KB.

## Fixed

**Writing.** 47 em-dashes removed. Every one was rewritten rather than swapped
for a hyphen: some became commas, some full stops, several sentences were
restructured. The FAQ's structured data still matches its visible answers word
for word afterwards, which was checked.

**The sync diagram** said "a borrowed machine". It says "your work machine"
now, and the caption leads with the point rather than the mechanism: the same
notes on every machine you use.

**Images** moved from `img/` to `images/` per the house rule, and renamed from
`sync.svg`-style names to descriptive ones like
`pastemorphic-notes-sync-between-computers.svg`, which is a real signal for
image search.

**Findability.** The home page title was 70 characters and its description 215;
the FAQ description was 196. All are now inside the 60 and 160 limits with the
keyword near the front.

**Two hardcoded colours** became tokens, so the whole stylesheet now drives
from one palette.

**`touch-action: manipulation`** added to links, buttons and summaries, which
removes the browser's 300 ms wait for a possible double-tap.

## Checked and already sound

- **No external calls of any kind.** No CDN, no third-party script, no external
  font, no tracking pixel, no embed. Everything ships with the site.
- **No cookies.**
- **Portable.** No absolute paths, no dev URLs. The folder works on any host.
- Unique title, description and self-referencing canonical on all four pages.
- Structured data on every page, valid, with the company name, address, email
  and Companies House number matching the visible footer exactly.
- `sitemap.xml`, `robots.txt` and `llms.txt` all live; no AI crawler blocked;
  no `noindex` left anywhere.
- AA contrast in both themes, weakest pair 6.7:1 against a 4.5 requirement.
- One `<h1>` per page, no heading-level jumps, skip link, `lang="en-GB"`,
  visible focus states, `prefers-reduced-motion` honoured.
- Every image has width and height, so nothing shifts: zero elements moved when
  the lazy images arrived.
- 58 KB for a first visit. No render-blocking external JavaScript.
- No horizontal scroll at 390 px.
- No AI traces, generator credits, placeholders or lorem ipsum.

## Flagged for you

**1. The site stores one thing in the browser: the light/dark choice.**
Your rule is no cookies or local storage without explicit sign-off, so this
needs your word. It is `localStorage` holding one value, `pm-theme`, set only
when a reader clicks the sun/moon button. It is not a cookie, is never sent
anywhere, cannot identify anyone and is not used for tracking. Without it the
button still works but forgets the choice on the next page. Say if you would
rather it went, and I will drop the button and follow the browser setting only.

**2. No security headers, and GitHub Pages cannot set them.** The live site
sends no Content-Security-Policy, X-Frame-Options, X-Content-Type-Options or
Referrer-Policy, because GitHub Pages gives no way to add response headers.
HTTPS is enforced and `.git` is not reachable. This will cost a grade on
securityheaders.com. The only fixes are putting Cloudflare in front of the
domain, which adds a third party, or hosting it yourself. Neither is obviously
worth it for a static brochure site with no forms and no cookies — your call.

**3. Curly quotes.** The Web Interface Guidelines ask for typographic
apostrophes; your own writing rules warn against smart quotes. The site
currently uses straight ones in eight places. I have left them as they are
rather than pick a side.

## After launch

- Submit `sitemap.xml` to Google Search Console and to Bing Webmaster Tools.
  Bing matters because ChatGPT draws on it.
- Test one URL's link preview, for example by pasting it into Slack. The share
  card is at `/images/pastemorphic-share-card.png` and returns 200.
- No Google Business Profile is needed. This is a software product, not a
  local business.
- Rankings build over months. The site now deserves them; it will not get them
  overnight.
