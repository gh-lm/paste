# Security

## Reporting something

Email **complaints@lightmorphic.com** with "security" in the subject line, or
open a [private security advisory][advisory] on this repository. Please do not
open a public issue for anything that could be used against people who have
the extension installed.

[advisory]: https://github.com/lightmorphic/paste/security/advisories/new

You will get a reply within five working days. If it is a real problem you
will be told what the fix is and when it will ship, and you will be credited
in the release notes unless you would rather not be.

## What is supported

The latest release. There is no long-term branch and no backporting: fixes go
into the next version.

| Version | Supported |
|---|---|
| 1.0.x | yes |

## The shape of the thing

Worth knowing before you look, because it changes what is and is not a bug.

**Notes are ordinary bookmarks.** That is the whole storage. Anyone who can
open the browser can read them, and they travel wherever the browser's
bookmark sync goes. The extension says so the first time it is opened. A
report that notes are readable by someone with access to the browser is not a
vulnerability; it is the design, and it is why the first-run notice tells
people to keep passwords and card numbers out of it.

**It makes no network requests.** No fetch, no eval, no CDN, no analytics, no
telemetry. The content security policy is `script-src 'self'`. If you find
anything that reaches the network, that is a serious bug and worth reporting
straight away.

**No host permissions.** The extension declares none. A script is injected
into a page only at the moment the user asks for a paste, through `activeTab`
and `scripting`, and only into the tab they are looking at.

**Permissions in full:** `bookmarks`, `storage`, `contextMenus`, `scripting`,
`activeTab`, `clipboardWrite`. Anything the code does beyond what those allow
is a bug.

## What is worth reporting

- Anything that sends data anywhere
- A way to make the extension write outside its own bookmark folder
- A way to make it inject a script into a page the user did not ask about
- A crafted note that runs as code rather than being pasted as text
- A way to read another site's data through the extension

## The website

paste.lightmorphic.com is static files on GitHub Pages. It stores nothing in
the browser and sets no cookies. It loads one thing from another address: the
Lightmorphic app menu, from Lightmorphic's own machine. GitHub Pages cannot
set response headers, so the security policy is carried in a meta tag and the
things a meta tag cannot carry, such as `Strict-Transport-Security`, are not
set. That is a limit of the hosting rather than an oversight.
