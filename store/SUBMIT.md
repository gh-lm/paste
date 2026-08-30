# Chrome Web Store submission — Lightmorphic Paste 1.0.0

Everything the form asks for, in the order it asks. Copy each block as it is.

**Upload this file:** `dist/lightmorphic-paste-chrome-1.0.0.zip` — 84 KB, 18
files. Unpacked and checked: every file the manifest names is present, every
file the pages ask for resolves, every script parses, and nothing
developer-only is inside.

---

## Store listing tab

**Name**

    Lightmorphic Paste

**Short description** (132 max, this is 121)

    Keep lines of text in your browser. Click one to copy or paste it. Stored in your bookmarks, so it syncs with no account.

**Detailed description**

    Lightmorphic Paste keeps the lines of text you type over and over: your
    email address, a postal address, a sign-off, a licence header, a reference
    number. Click the toolbar icon, click the line you want, and it is on your
    clipboard, or straight into the box you were typing in if you prefer.

    The unusual part is where it puts them. Every note is an ordinary bookmark
    in a folder called Lightmorphic Paste. That means your notes travel between
    your computers on your browser's own bookmark sync. No account to make, no
    server to trust, nothing to pay for, and nothing that can be switched off
    from somewhere else. If you can see your bookmarks, you can see your notes.

    What it does:

    • Click a note to copy it to the clipboard
    • Or turn on copy-and-paste, so a click also drops it into the box you were
      typing in, and notes then read "Copy and paste" when you hover over them
    • Either way, every note has its own paste button as well
    • Group notes into tabs, and drag them into the order you want
    • Four keyboard shortcuts for the notes you reach for most, pasting straight
      into whatever you are typing in
    • Right-click selected text on any page to save it
    • Right-click inside a text box to paste any note
    • Search across every tab at once
    • Follows your browser's light or dark setting, with a button to override it
    • Twelve accent colours, or one of your own
    • Already using another snippet extension? Its notes can be brought across
      in one click
    • Save a backup file, and restore from one

    It sends nothing anywhere. There is no account, no server, no analytics and
    no advertising. It makes no network requests at all.

    Because your notes are bookmarks, they are as visible as any other bookmark.
    Lightmorphic Paste tells you so the first time you open it: keep passwords
    and card numbers out of it, and use a password manager for those.

**Category** — Productivity → Workflow & Planning

**Language** — English (United Kingdom)

### Graphics

| Asset | File | Status |
|---|---|---|
| Store icon 128×128 | taken from the package | ready |
| Screenshot 1280×800 | — | **still to take**, see below |
| Small tile 440×280 | `store/promo-tile-440x280.png` | ready |
| Marquee tile 1400×560 | `store/marquee-1400x560.png` | ready, optional |

Both tiles are 24-bit PNG with no alpha, which the store requires.

**The screenshot has to be a real capture of the extension running**, so it
cannot be generated. Restore `store/sample-work-notes.json` first — it holds
seven invented notes, so no real details of yours end up in a public image.
Then capture the popup and composite it:

    rsvg-convert -w 1280 -h 800 store/screenshot-frame.svg -o frame.png
    magick frame.png popup-grab.png -geometry +806+129 -composite \
      store/screenshot-1280x800.png

### Support links

**Website**

    https://paste.lightmorphic.com/

**Support URL**

    https://github.com/lightmorphic/paste/issues

---

## Privacy tab

**Single purpose**

    Lightmorphic Paste stores short pieces of text the user saves and lets them copy or paste one back with a click or a keyboard shortcut.

### Permission justifications

The form lists these in the order below. Each box allows 1,000 characters; the
longest of these is 265.

**bookmarks**

    The notes themselves are bookmarks. The extension creates a single folder and reads and writes only inside it. It does not read the rest of the user's bookmarks except to locate that folder.

**storage**

    Remembers the chosen accent colour, the light or dark preference, and which tab was last open. No personal data is stored.

**contextMenus**

    Adds "Add to Lightmorphic Paste" to the right-click menu when text is selected, and lists the user's own saved notes when they right-click a text box, so a note can be pasted without opening the popup.

**scripting**

    Used only when the user asks for a paste, to insert the chosen text into the field they were typing in. No script runs on any page until the user presses one of the extension's keyboard shortcuts, clicks its toolbar icon, or picks one of its right-click menu items.

**activeTab**

    Limits that paste to the one tab the user is looking at, at the moment they ask for it, instead of requesting access to every site. The extension declares no host permissions at all.

**clipboardWrite**

    Copies the chosen note to the clipboard when the user clicks it.

### Remote code

Answer **No**. There is none: no fetch, no eval, no CDN, and the content
security policy is `script-src 'self'`.

### Data collection

**Tick nothing. Leave all nine boxes empty.**

The question is about data you *collect*, meaning data that leaves the device
and reaches you or a third party. This extension makes zero network requests,
so nothing can. Notes go into the user's own bookmarks; six settings go into
the browser's own extension storage. The settings ride Chrome's own sync under
the user's own Google account, which you neither see nor control, and that is
not collection.

Then certify all three statements:

- not being sold to third parties
- not being used for any purpose unrelated to the single purpose
- not being used to determine creditworthiness or for lending

**Privacy policy URL**

    https://paste.lightmorphic.com/privacy.html

---

## Test instructions

**Leave the username and password boxes empty.** There is no login and no
account.

**Additional instructions** (500 max, this is 481)

    No login or account is needed, so the credentials are blank.

    1. Click the toolbar icon.
    2. Press the round yellow button, type anything, save.
    3. Click that note - the text is on the clipboard.
    4. In Settings, turn on "Clicking a note copies it and pastes it". Click a note while a text box has the cursor and the text is typed in.
    5. The notes appear in your bookmark manager under Other bookmarks > Lightmorphic Paste. That folder is the whole storage; nothing is sent anywhere.

---

## Distribution tab

- **Visibility:** Public
- **Regions:** all
- **Pricing:** free, no in-app purchases

**Trader status: non-trader.** It is free, not a business activity, and nothing
is being sold. Non-trader keeps your address off the public listing. If you
ever charge for it, that has to change to trader, and your name, phone number
and address are then published on the listing.

---

## Worth knowing

**The extension was called Pastemorphic until 30 August 2026.** If anyone
installs this over that version nothing is lost: the bookmark folder is found
by what is inside it, both former folder names are still recognised, and notes
saved by either earlier version are still read.

**Licences ship inside the package.** `LICENSE` is the GNU GPL v3, which asks
for its text to travel with the work. `fonts/OFL.txt` is the SIL Open Font
Licence for Manrope, which requires the notice to sit beside the font.
`package.sh` refuses to build without either.

**Review** usually takes a few days for a first submission. Once it is live,
add the store link to the website and to the README.
