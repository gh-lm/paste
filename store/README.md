# Store artwork

- `promo-tile-440x280.png` — the small promotional tile. Ready to upload.
- `marquee-1400x560.png` — the wide banner used for featured placement.
- `screenshot-frame.svg` — the backdrop the listing screenshot is built on.
- `sample-work-notes.json` — invented notes to restore before taking a
  screenshot, so no real details appear in a public image.
- `AUDIT.md`, `SUBMIT.md` — the pre-submission audit and the submission form
  filled in field by field.

Both PNGs are 24-bit with no alpha, which is what the store requires.

## The screenshot still has to be taken

It must be a genuine capture of the extension running, so it cannot be
generated here. The previous one was built from a capture of the old build and
its header read Pastemorphic, so it was removed rather than left to be uploaded
by mistake.

To make the new one: restore `sample-work-notes.json` in the extension, open
the popup, capture it, then composite the crop onto the backdrop.

    rsvg-convert -w 1280 -h 800 screenshot-frame.svg -o frame.png
    magick frame.png popup-grab.png -geometry +806+129 -composite \
      screenshot-1280x800.png
