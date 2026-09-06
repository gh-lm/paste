# Lightmorphic Paste

**The lines of text you paste all the time, kept in your bookmarks.**

[Website](https://paste.lightmorphic.com/) ·
[Help](https://paste.lightmorphic.com/help.html) ·
[Questions](https://paste.lightmorphic.com/faq.html) ·
[Download](https://github.com/lightmorphic/paste/releases)

A small browser extension for the short pieces of text you type over and over —
your email address, a postal address, a sign-off, a licence header, a reference
number. Click the toolbar icon, click the line you want, and it is on your
clipboard.

The unusual part is where it puts them. **Every note is an ordinary bookmark.**
That means your notes travel between your computers on your browser's own
bookmark sync — no account to make, no server to trust, nothing to pay for, and
nothing that can be switched off from somewhere else.

It makes **no network requests of any kind**. No server, no analytics, no
advertising, no crash reporting. The whole thing is nine files of plain
JavaScript, HTML and CSS with no build step, so what is in this repository is
exactly what runs in your browser.

Licensed under the GNU General Public License, version 3. The interface is set
in Manrope by Mikhail Sharanda, under the SIL Open Font License — see
[CREDITS.md](CREDITS.md).

    Other bookmarks/
      Lightmorphic Paste/
        Personal/            <- a tab
          Email address      <- a note; the text lives in the bookmark's URL
          Home address
        Work/

You can rename that folder or drag it wherever you like. It is found by what
is inside it, not by its name, so nothing breaks.

> **One thing worth knowing.** Because notes are bookmarks, they are as visible
> as any other bookmark. Anyone who can open your browser can read them.
> Lightmorphic Paste says so the first time you open it. Keep passwords and card
> numbers out of it and use a password manager for those.

## Installing

### From the Chrome Web Store

[Lightmorphic Paste on the Chrome Web Store](https://chromewebstore.google.com/detail/lightmorphic-paste/heefkhhoccopkeecmaainfdgppeljkfb) — works in Chrome, Brave,
Vivaldi and Edge, and updates arrive on their own.

### From a release — no Google account needed

1. Download the latest zip from [releases](https://github.com/lightmorphic/paste/releases)
   and unzip it
2. Open `brave://extensions` (or `vivaldi://extensions`, `edge://extensions`,
   `chrome://extensions`)
3. Turn on **Developer mode**
4. **Load unpacked**, and choose the folder you unzipped

### From this repository

Clone it and load the `chrome` folder the same way. That folder is the source
of truth — there is no build step, so it runs exactly as it is written.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on**, and choose `firefox/manifest.json`

Firefox drops temporary add-ons when it closes, so it has to be loaded again
each time. Firefox will only keep an add-on permanently if it has been signed
by Mozilla, which is free.

## Updating

The folder syncs, so the new files arrive by themselves. To make a browser use
them, restart it — or click the reload arrow on the extension's card.

Your notes are untouched by any of this; they live in bookmarks, not in the
extension.

## What it does

- Up to six tabs to group notes, named with up to seven letters. Those numbers
  go together: seven letters makes a tab at most 100px wide, three of those fit
  across the strip, and the strip is two rows tall. So every tab is always
  visible with nothing to scroll and nothing pushed out of reach
- The icon and the name sit at the top left, and the round accent-coloured
  button that adds a note sits centred between the name and the search icon
- Every button sits on the top row: the round accent-coloured one adds a note,
  then search, light or dark and settings, then a divider and the two tab
  controls. There is no footer, so the list gets the rest of the window, and
  messages appear briefly over the bottom of it
- Tabs are dragged into the order you want, and notes by the grip on the left.
  A thin line shows the gap it will drop into.
  Both are built on pointer events rather than HTML5 drag and drop, because a
  native drag closes an extension popup before the drop can land. Renaming and
  deleting a tab happens in a small popover under the button, not a whole screen
- A tab is only created once it has a name, so there are never several called
  "New tab". Two tabs cannot share a name either
- Click a note to copy it, or turn on copy-and-paste in settings so a click also
  drops the text into the box you were typing in. Hovering a note says which of
  the two it will do, because pasting puts text somewhere it might not belong.
  The paste button on each note pastes either way
- Four keyboard slots, Ctrl+Shift+1 to Ctrl+Shift+4, pasting straight into
  whatever you are typing in. Four because that is every shortcut a browser lets
  an extension arrive with; more slots than keys would only be slots nothing can
  reach. Alt and a number is deliberately not used — browsers keep that for
  jumping to a pinned tab and always win
- Right-click selected text on a page to save it
- Right-click inside a text box to paste any note from the current tab
- Search across every tab
- Follows the browser's light or dark setting on its own. A button in the list
  overrides it either way; a dot on that button means the browser is choosing
- Twelve accent colours, plus a box for a colour of your own — the lighter and
  darker shades it needs are worked out from whatever you type
- One-click import of notes left behind by an older snippet extension, found
  by the shape of the bookmarks rather than by any folder name (it copies;
  nothing is removed)
- Backup to a JSON file, and restore from one

## Layout

    chrome/            load this one in Vivaldi, Brave or Edge — this is what ships
      manifest.json
      background.js    keyboard slots, right-click menus, paste
      content.js       injected on demand to put text in the focused field
      popup.html/.js   the list
      options.html/.js settings, import, backup
      lib/store.js     everything that touches bookmarks
      style.css        one stylesheet, no framework
      fonts/           Manrope and its OFL licence, self-hosted
      icons/           the extension's own, plus the Lightmorphic mark
    firefox/           built from chrome/ by build-firefox.sh
    docs/              the website, published by GitHub Pages
    dev/               preview.sh / clean.sh, and the fake-browser stub
    dist/              the zips package.sh builds; not in git
    store/             the listing artwork, the audit, and the submission notes
    build-firefox.sh   run after changing anything in chrome/
    package.sh         builds the store zips; refuses if a dev file or the font
                       licence is missing, and copies LICENSE into the package
    PRIVACY.md         the privacy statement, served at /privacy.html on the site
    CHROMEWEBSTORE.md  listing text, single purpose, and permission wording
    CREDITS.md         third-party licences — Manrope under the SIL OFL

## Previewing without a browser install

    ./dev/preview.sh     writes chrome/dev-popup.html and chrome/dev-options.html
    ./dev/clean.sh       removes them again

Those pages stub out the browser APIs so the interface can be opened in a plain
tab. `package.sh` refuses to build if they are still lying about.

## Packing for the stores

    ./dev/clean.sh
    ./package.sh

Writes `dist/lightmorphic-paste-chrome-<version>.zip` and the Firefox one beside it.

## The first-run notice

The first time the list is opened it explains, once, that notes are bookmarks:
they follow you between computers with no account, and they are as readable as
any other bookmark, so passwords and card numbers do not belong in them. It has
to be acknowledged rather than dismissed, and the same warning stays on the
settings page afterwards.

## Deleting

Nothing is deleted on one click. Every delete is a bin icon; clicking it turns
the bin into a tick and the wording beside it goes red. Only the tick deletes,
and it gives up after four seconds if left alone. This is the same for a note in
the list, a note in the editor, and a whole tab.

The last remaining tab cannot be deleted, because the notes would have nowhere
to live.

## Notes

- Edit `chrome/` only, then run `./build-firefox.sh`. The two folders are
  identical apart from the manifest.
- A note's text sits in the bookmark's URL as
  `https://lightmorphic.invalid/#pm1:...`. `.invalid` is a reserved name that
  can never resolve, so a stray click goes nowhere. Notes saved by the very
  first build used a `javascript:` URL instead; those are still read, and are
  quietly rewritten the next time you edit them.
- Restoring a backup **adds** notes; it does not replace what is there.
- Running the import twice is safe — anything already there is skipped.
- Bookmark sync keeps notes together within one browser's own sync. Firefox
  notes and Vivaldi notes are separate; use the backup file to move between
  them.
