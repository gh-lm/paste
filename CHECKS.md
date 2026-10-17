# Checking the Paste website is sound

Run these after any change to `docs/`, once Cloudflare Manager has redeployed.

- `curl -sSI https://paste.lightmorphic.com/ | head -14` — expect 200, plus the policy, HSTS, nosniff, no-referrer and X-Frame-Options DENY.
- Visit `https://paste.lightmorphic.com/help.html` — must land on `/help`.
- Visit `https://paste.lightmorphic.com/no-such-thing` — must show "That page is not here".
- `curl -sS https://paste.lightmorphic.com/privacy | grep mailto` — must show `mailto:privacy@lightmorphic.com`. If it shows `[email protected]` the email_off comments have been lost.
- `./package.sh` builds both extension zips and refuses if a script fails `node --check` or a licence is missing.

