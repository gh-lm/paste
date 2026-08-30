# Ready to submit

Everything below was checked against the actual zip, not the source folder.

## Upload this

    dist/pastemorphic-chrome-1.0.0.zip     84 KB, 18 files

Unpacked and verified: every file the manifest names exists, every file the two
pages ask for exists, every script parses, and there are no developer or stray
files in it.

## The form, field by field

**Name** — Pastemorphic

**Short description** (132 max, this is 121)

    Keep lines of text in your browser. Click one to copy or paste it. Stored
    in your bookmarks, so it syncs with no account.

**Detailed description** — in `CHROMEWEBSTORE.md`, ready to paste.

**Category** — Productivity → Workflow & Planning

**Language** — English (United Kingdom)

**Store icon** — taken from the package, 128×128.

**Screenshot** — `store/screenshot-1280x800.png`

**Small promotional tile** — `store/promo-tile-440x280.png`

**Website** — https://pastemorphic.lightmorphic.com/

**Support URL** — https://github.com/lightmorphic/pastemorphic/issues

## Privacy tab

**Single purpose**

    Pastemorphic stores short pieces of text the user saves and lets them copy
    or paste one back with a click or a keyboard shortcut.

**Permission justifications** — all six are written out in
`CHROMEWEBSTORE.md`. Copy them across as they are.

**Remote code** — answer **No**. There is none: no fetch, no eval, no CDN, and
the content security policy is `script-src 'self'`.

**Data usage** — tick **nothing**. The extension collects and transmits no data
at all; it makes zero network requests. Then certify all three statements:

- not being sold to third parties
- not being used for any purpose unrelated to the single purpose
- not being used to decide creditworthiness or for lending

**Privacy policy URL**

    https://pastemorphic.lightmorphic.com/privacy.html

## Distribution

Public. All regions. No paid features, no in-app purchases.

**Trader status: non-trader.** It is free, not a business activity, and nothing
is being sold. That keeps your address off the public listing. If you ever
charge for it, that has to change to trader.

## Licences inside the package

- `LICENSE` — GNU GPL v3, which asks for its text to travel with the work.
- `fonts/OFL.txt` — the SIL Open Font License for Manrope, which requires the
  copyright notice and licence to be distributed with the font. It sits beside
  `Manrope.woff2`. `package.sh` now refuses to build if it goes missing.

The font is bundled and self-hosted; nothing is fetched from Google Fonts or
anywhere else.

## After it is approved

Review usually takes a few days for a first submission. Once it is live, add
the store link to the website and to the README.
