# Pre-submission audit — 29 August 2026

Pastemorphic 1.0.0. Every section passed. One tidy-up applied.

## Critical issues

None. No secrets, no remote code, no banned Manifest V2 patterns.

## Manifest

Manifest V3. Background is a `service_worker`, not the old `scripts` or
`background.page`. No content scripts declared at all — `content.js` is
injected only when you ask for a paste, which is narrower than declaring
match patterns. No `web_accessible_resources`, so nothing is exposed to web
pages. Icons at 16, 32, 48 and 128. Name, description (112 of the 132
characters allowed) and version all real, no placeholder text.

## Permissions

Six, all genuinely used, none broad:

| Permission | Evidence |
|---|---|
| `bookmarks` | 5 call sites — the notes *are* bookmarks |
| `storage` | 6 call sites — colour, theme, current tab |
| `contextMenus` | 5 call sites — the right-click menus |
| `scripting` | 1 call site — the paste injection |
| `activeTab` | what that injection relies on |
| `clipboardWrite` | 2 clipboard writes |

**No `host_permissions` at all**, so no "read your data on all websites"
warning. `bookmarks` is a high-sensitivity permission and reviewers look at it
closely — the justification in `CHROMEWEBSTORE.md` explains it in one sentence.

## Secrets

Nothing. No API keys, tokens, passwords or credentials. No `.env` bundled. No
long base64 literals. The only matches for "token" are a local counter that
cancels a stale menu rebuild, and the word "passwords" in the warning text
telling people not to store them.

## Vulnerability patterns

- No `eval`, no `new Function`, no `document.write`.
- 11 `innerHTML` assignments, every one a fixed icon from the internal table.
  No user text ever reaches markup — it all goes through `textContent`.
- No `postMessage` listeners, so no origin-checking gap.
- No `fetch`, `XMLHttpRequest`, `WebSocket` or `sendBeacon` anywhere. No remote
  code loading, which is the Manifest V3 rule most extensions fail.
- No `http://` endpoints.
- CSP is `script-src 'self'; object-src 'self'` with no `unsafe-eval` or
  `unsafe-inline`, and no inline `<script>` in either page.

## Dead code

- No `console.log` left behind, no TODO or FIXME, no commented-out code.
- Every element id in both pages is referenced by its script.
- **Fixed:** `ROOT_TITLE`, `tabNameProblem` and `DEFAULTS` were exported on the
  `PM` object but called only inside `store.js`. Exports removed; they remain as
  internals. All 14 test files still pass and both pages load clean.

## Later addition

A credit was added to the settings page and to the foot of the popup —
"Created by", the Lightmorphic mark, then the name, linking to
lightmorphic.com. The settings one also carries links to the website and the
source. This is permitted: it is attribution inside the extension's own pages,
not advertising and not injected into anyone's browsing. The mark is a bundled
file, never fetched, so the "no network requests of any kind" claim still
holds.

## Store readiness

- 128×128 icon: present.
- Screenshot 1280×800: `store/screenshot-1280x800.png`.
- Promotional tile 440×280: `store/promo-tile-440x280.png`.
- Privacy policy: live at
  https://pastemorphic.lightmorphic.com/privacy.html (returns 200).
- Keyboard shortcuts: Ctrl+Shift+1 to 4. None clash with a reserved Chrome
  shortcut, and four is the maximum allowed.

### What to put in the data use declaration

**Nothing is collected and nothing is transmitted.** There are zero network
calls of any kind and no analytics or telemetry libraries. Notes are written to
the user's own bookmarks; preferences go to `chrome.storage`. Anything that
syncs does so through the browser's own bookmark sync, which the extension
neither controls nor can see.

So tick "does not collect user data" and certify all three: no selling to third
parties, no use beyond the single purpose, no creditworthiness or lending use.
