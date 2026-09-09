#!/usr/bin/env /usr/bin/python3
"""Generate the AVIF variants the project compositions use.

Run after adding or replacing a project screenshot:

    /usr/bin/python3 scripts/gen-card-images.py

The output is COMMITTED. It is not part of `npm run build` because Vercel's
build image has Node but not Python/Pillow, and because these only change when
a screenshot changes.

WHY THIS REPLACED scripts/gen-card-images.mjs
---------------------------------------------
The previous version shelled out to macOS `sips`. Above roughly 1024px, `sips`
silently emits a TILED AVIF: the file carries a `grid` derived-image box plus an
`irot` transform instead of a single coded image. Chrome parses the header --
correct intrinsic size, `naturalWidth` reports fine, no load error, nothing in
the console -- and then paints a blank rectangle.

That shipped. Every `-1216.avif` in the repo was affected, and because 1216w is
only ever selected on a 2x display, the failure never appeared in a 1x check.
`naturalWidth > 0` was the assertion used to verify the ladder, and it cannot
catch this: the image decodes to the right dimensions and no pixels.

Pillow encodes a single coded image at every width. Verified in Chrome:
identical dimensions, comparable file size, and it actually renders.
"""
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "assets", "images")
OUT = os.path.join(SRC, "cards")

# 352 and 704 cover the smaller slots at 1x and 2x. 896 sits under the C2
# half-width and hero slots, which measure 750-880px at 1x -- without it the
# browser jumps straight to 1216 and overshoots by more than half. 1216 covers
# the featured band and hero, which reach full viewport width.
WIDTHS = [352, 704, 896, 1216]
# Screenshots are detail-heavy; below ~55 the UI text in them starts to mush.
QUALITY = 60

# The headshot is not a project image and is already small.
SKIP = {"headshot.jpg"}


def sources():
    for name in sorted(os.listdir(SRC)):
        if name in SKIP:
            continue
        if os.path.splitext(name)[1].lower() in (".jpg", ".jpeg", ".png"):
            yield name


def main():
    os.makedirs(OUT, exist_ok=True)
    written = skipped = 0

    for name in sources():
        src = os.path.join(SRC, name)
        stem = os.path.splitext(name)[0]
        src_mtime = os.path.getmtime(src)

        with Image.open(src) as im:
            im = im.convert("RGB")
            for width in WIDTHS:
                dest = os.path.join(OUT, f"{stem}-{width}.avif")
                if os.path.exists(dest) and os.path.getmtime(dest) > src_mtime:
                    skipped += 1
                    continue

                height = round(im.height * width / im.width)
                im.resize((width, height), Image.LANCZOS).save(
                    dest, format="AVIF", quality=QUALITY
                )
                written += 1

    total = sum(
        os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)
    )
    print(f"card variants: {written} written, {skipped} up to date")
    print(f"{os.path.relpath(OUT, ROOT)} now {total / 1024:.0f} KB total")

    # A tiled AVIF is the one failure this script exists to prevent, so it
    # refuses to leave one behind.
    bad = []
    for f in sorted(os.listdir(OUT)):
        if not f.endswith(".avif"):
            continue
        with open(os.path.join(OUT, f), "rb") as fh:
            head = fh.read(4096)
        if b"grid" in head:
            bad.append(f)
    if bad:
        sys.exit(
            "TILED AVIF DETECTED (Chrome renders these blank): " + ", ".join(bad)
        )
    print("verified: no tiled AVIF output")


if __name__ == "__main__":
    main()
