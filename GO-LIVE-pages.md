# GitHub Pages go-live pass — paste.lightmorphic.com
2 September 2026

## The gate

| check | result |
|---|---|
| access-check | ran, everything found was fixed |
| responsive-sweep | ran, clean at every width 1400 to 320, tall and short |
| vitals-ready | ran, everything found was fixed |
| lightmorphic-style | ran, one deliberate departure, your call |

## Fixed

**A desktop screenshot of yours was in a public repo.** The .gitignore rule
said `screenshot/` and the folder is `screenshots/`, so it never matched and
my own commit published your full screen: bookmark names, tab titles, the lot.
Out of the current tree now. **Still in the history and still fetchable** until
that is rewritten, which needs your say-so because it is a force push.

**No 404 page.** A mistyped address landed on GitHub's own branded page, which
reads as though the site has gone. There is a real one now.

**Four of the five legal pages did not exist.** Only privacy. Cookies, terms,
accessibility and complaints are written, linked from a legal row in every
footer, and in the sitemap. The accessibility statement was written after the
checks, so it says what was actually found rather than what was hoped.

**The homepage headline pushed the page sideways below 340px.** Its letters are
separate boxes so each can move, and a nowrap held the phrase on one line. Words
are held together now, so it breaks at the space. The full stop was landing on a
line of its own; it travels with the last word.

**The theme toggle's ring was 1.31:1** against the page, under the 3:1 a control
needs. Its own token now, 3.3:1 light and 3.6:1 dark.

**Footer and side notes were 12px monospace** — the text carrying your company
number. They are 14px.

**Touch targets.** Standalone controls, nav and footer links reach 44px on a
touch screen. Links inside sentences are left alone; the guidelines exempt them
and padding them would wreck the line spacing.

**Dates were typed by hand and the sitemap said 29 August.** `stamp-dates.sh`
takes every page's date and the whole sitemap from the commit that last touched
each file. Run it before committing a content change.

**A content security policy.** Pages cannot set headers, so it travels in a meta
tag: `default-src 'none'`, and the two inline scripts allowed by hash rather
than by `unsafe-inline`. Getting there meant removing the last inline styles —
the per-letter delays were style attributes, which the policy blocks, and the
heading silently stopped moving. That is in the stylesheet now.

**Smaller things.** Headings balance so none leaves a single word on the last
line. The product name is marked so machine translation leaves it alone. Dropped
`--mark-soft`, left from the highlighter you had removed. Terms said "Licence"
where every other page says "License", which is the licence's actual name.
Contact address changed to newsletter@lightmorphic.com throughout.

## Cannot be done here

**No security headers and no HSTS.** GitHub Pages serves files and sets no
headers. The meta policy covers script, style, image, font and form; it cannot
carry `frame-ancestors`, `Strict-Transport-Security`, `X-Frame-Options` or
`Referrer-Policy`. Fixing that properly means Cloudflare in front, which adds a
third party, or hosting it yourself. HTTPS is enforced and http redirects.

## Awaiting you

1. **The history rewrite** for that screenshot. Irreversible and a force push on
   a public repo, so it is yours to call.
2. **The contact address.** newsletter@lightmorphic.com is in place. You said you
   would think of something better; it is one line to change.
3. **One departure from the house style.** The site is editorial: serif body,
   warm paper, no panels, no shadows. That was your brief. It uses brand yellow,
   self-hosted Manrope, no framework, no CDN, tokens throughout with no raw hex,
   and both themes. It does not use the panel-and-shadow component language.
   Deliberate, and yours to confirm.
4. **The install link** is the main action on the page and is a text link inside
   a sentence, 28px tall on a phone. Compliant, but a button would be easier to
   hit. A design change, so I left it.

## Measured

- First visit, above the fold: 62.8 KB across six files. No render-blocking
  script, no external request of any kind, no cookies.
- Contrast: weakest text pair 6.2:1 against a 4.5 requirement, both themes.
- No horizontal scroll on any of nine pages at any width from 1400 to 320,
  at both a tall and a short viewport.
- Every internal link, anchor and asset resolves, live, exact case.
- Every external link returns 200.
- No secret was ever committed; nothing over 100MB in the history.
