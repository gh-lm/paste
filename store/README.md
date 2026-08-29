# Store artwork

- `promo-tile-440x280.png` — the small promotional tile. Ready to upload.
- `screenshot-frame-1280x800.png` — the backdrop for the listing screenshot,
  with a 400x540 slot at x=760, y=130 for a real grab of the popup.
- `screenshot-frame.svg` — the source for that backdrop.

The screenshot itself has to be a genuine capture of the extension running, so
it is taken by hand rather than generated here. Grab the popup at 400x540 and
composite it into the slot:

    magick screenshot-frame-1280x800.png popup-grab.png \
      -geometry +760+130 -composite screenshot-1280x800.png
