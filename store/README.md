# Store artwork

- `promo-tile-440x280.png` — the small promotional tile. Ready to upload.
- `marquee-1400x560.png` — the wide banner used for featured placement.
- `screenshot-1280x800.png` — the listing screenshot. Ready to upload.
- `screenshot-frame.svg` — the backdrop it is built on.
- `sample-work-notes.json` — invented notes to restore before taking a
  screenshot, so no real details appear in a public image.
- `share-card-source.svg` — the drawing the website's share image is made from.
- `AUDIT.md`, `SUBMIT.md` — the pre-submission audit and the submission form
  filled in field by field.

Both PNGs are 24-bit with no alpha, which is what the store requires.

## The screenshot

`screenshot-1280x800.png` is a real capture of the popup running in Brave on
30 August 2026, cropped from the full screen and set on `screenshot-frame.svg`.
It shows the four keyboard shortcuts as the browser registered them. The notes
are invented, so no real details appear in a public image.

To remake it, capture the popup, find its edges, then:

    magick screen.png -crop 460x540+X+Y +repage popup.png
    rsvg-convert -w 1280 -h 800 screenshot-frame.svg -o frame.png
    magick frame.png popup.png -geometry +722+130 -composite \
      -background '#0b0b0f' -alpha remove PNG24:screenshot-1280x800.png
