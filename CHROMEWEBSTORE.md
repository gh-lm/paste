# Chrome Web Store

Everything the submission form asks for, kept here so it stays in step with the
code. Google's own guidance for AI-assisted extension work asks for a file like
this, holding the listing copy and a justification for every permission.

## Name

    Pastemorphic

## Short description (132 characters max, currently 121)

    Keep lines of text in your browser. Click one to copy or paste it. Stored in your bookmarks, so it syncs with no account.

## Category

Productivity / Workflow & Planning

## Single purpose (Google asks for this in one sentence)

    Pastemorphic stores short pieces of text the user saves and lets them copy or
    paste one back with a click or a keyboard shortcut.

## Detailed description

    Pastemorphic keeps the lines of text you type over and over — your email
    address, a postal address, a sign-off, a licence header, a reference number.
    Click the toolbar icon, click the line you want, and it is on your clipboard
    — or straight into the box you were typing in, if you prefer.

    The unusual part is where it puts them. Every note is an ordinary bookmark in
    a folder called Pastemorphic. That means your notes travel between your
    computers on your browser's own bookmark sync — no account to make, no server
    to trust, nothing to pay for, and nothing that can be switched off from
    somewhere else. If you can see your bookmarks, you can see your notes.

    What it does:

    • Click a note to copy it to the clipboard
    • Or turn on copy-and-paste, so a click also drops it into the box you were
      typing in — notes then read "Copy and paste" when you hover over them
    • Either way, every note has its own paste button as well
    • Group notes into tabs, and drag them into the order you want
    • Four keyboard shortcuts for the notes you reach for most, pasting straight
      into whatever you are typing in
    • Right-click selected text on any page to save it
    • Right-click inside a text box to paste any note
    • Search across every tab at once
    • Follows your browser's light or dark setting, with a button to override it
    • Twelve accent colours, or one of your own
    • Already using another snippet extension? Its notes can be brought
      across in one click
    • Save a backup file, and restore from one

    It sends nothing anywhere. There is no account, no server, no analytics and
    no advertising. It makes no network requests at all.

    Because your notes are bookmarks, they are as visible as any other bookmark.
    Pastemorphic tells you so the first time you open it: keep passwords and card
    numbers out of it, and use a password manager for those.

## Permission justifications (Google asks for each one separately)

    bookmarks
    The notes themselves are bookmarks. The extension creates a single folder and
    reads and writes only inside it. It does not read the rest of the user's
    bookmarks except to locate that folder.

    storage
    Remembers the chosen accent colour, light or dark preference, and which tab
    was last open.

    contextMenus
    Adds "Add to Pastemorphic" when text is selected, and a list of the user's own
    notes when right-clicking a text box, so a note can be pasted without opening
    the popup.

    scripting
    Used only when the user asks for a paste, to insert the chosen text into the
    field they were typing in. No script runs on any page until the user presses a
    shortcut, clicks the toolbar icon, or picks a right-click menu item.

    activeTab
    Limits that paste to the tab the user is looking at, at the moment they ask
    for it, instead of requesting access to every site.

    clipboardWrite
    Copies the chosen note to the clipboard.

## Data use declaration

    Does not collect or use any user data. Nothing leaves the browser.

## Privacy policy URL

    https://pastemorphic.lightmorphic.com/privacy.html

## Website / support URLs

    Website:  https://pastemorphic.lightmorphic.com/
    Support:  https://github.com/lightmorphic/pastemorphic/issues

## Single purpose policy

Google enforces one purpose per extension. Pastemorphic has one: storing short
pieces of text and putting one back on request. Everything in it serves that —
the tabs group them, the search finds them, the shortcuts recall them, the
import brings them in, the backup takes them out. Nothing does anything else.

## Artwork

    Screenshot 1280x800:   store/screenshot-1280x800.png
    Promotional tile:      store/promo-tile-440x280.png
    Store icon 128x128:    taken from the package

## Ready

Everything the form asks for is prepared. `store/SUBMIT.md` walks it field by
field.
