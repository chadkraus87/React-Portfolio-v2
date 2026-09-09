#!/usr/bin/env /usr/bin/python3
"""Generate the site social card (public/og-image.png) and one per project
(public/og/<slug>.jpg).

Run locally after adding or renaming a project, or after changing project copy:

    /usr/bin/python3 scripts/make-og-images.py

The output is COMMITTED. It is not part of `npm run build` because Vercel's
build image has Node but not Python/Pillow, and because these only change when
project copy changes — not on every deploy.

Everything the cards say is parsed out of src/data/projects.js. Nothing here
invents a metric, a status, a date or a description.

Fonts are vendored under scripts/fonts/ so this renders identically anywhere
with no network access — see scripts/fonts/README.md.

The cards follow the site's C2 "Editorial Spatial" system: production tokens,
the display ramp, and the F2 footprint translated to a 2400x1260 canvas — text
composed left, a genuine screenshot dominating the right and bleeding off three
edges. No inset panel, no invented metric, no generated imagery.
"""
import os, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "projects.js")
IMGS = os.path.join(ROOT, "src", "assets", "images")
FONTS = os.path.join(ROOT, "scripts", "fonts")
OUT = os.path.join(ROOT, "public", "og")

S = 2                      # 2x for retina
W, H = 1200 * S, 630 * S

# The design system's tokens, straight from src/index.css. Nothing else.
PAPER    = (0xF2, 0xEE, 0xE6)   # warm page ground
SURFACE  = (0xFF, 0xFF, 0xFF)
INSET    = (0xE8, 0xE2, 0xD6)
INK      = (0x14, 0x11, 0x0D)   # warm near-black
GRAPHITE = (0x5C, 0x55, 0x4A)
RULE     = (0xCF, 0xC7, 0xB8)   # decorative hairlines only
BOUNDARY = (0x7C, 0x73, 0x64)   # the identifying edge of a control
ACCENT   = (0x8A, 0x2B, 0x18)   # oxblood
VERIFIED = (0x1F, 0x4B, 0x99)


def font(file, size, weight, width=None):
    """Load a vendored variable font pinned to one weight.

    The axes are set explicitly so output does not depend on the file's default
    instance — that is what keeps these cards reproducible.
    """
    f = ImageFont.truetype(os.path.join(FONTS, file), size * S)
    axes = f.get_variation_axes()
    vals = []
    for a in axes:
        name = a["name"] if isinstance(a["name"], str) else a["name"].decode()
        if name == "Weight":
            vals.append(weight)
        elif name == "Width":
            vals.append(width if width is not None else a["default"])
        else:
            vals.append(a["default"])
    f.set_variation_by_axes(vals)
    return f


# Type roles mirror DESIGN.md: Archivo for structure, Literata for prose,
# Martian Mono for identifiers. Sizes are in points and multiplied by S, so a
# 60 here is 120px on the 2400px canvas — the proportional equivalent of the
# site's --d-major at a 1920 viewport.
f_label   = font("MartianMono-var.ttf", 14, 500)
f_tagline = font("MartianMono-var.ttf", 14, 400)
f_meta    = font("MartianMono-var.ttf", 15, 500)
f_prose   = font("Literata-var.ttf", 20, 400)
f_role    = font("Literata-var.ttf", 26, 400)

# Display type is fitted per title rather than pinned, so a long name steps
# down instead of wrapping to three lines or overflowing its column.
TITLE_STEPS = [62, 58, 54, 50, 46, 42]
NAME_STEPS  = [84, 78, 72, 66, 60]


def fit(draw, text, steps, max_w, max_lines, file="Archivo-var.ttf", weight=700,
        overflow=0):
    """Largest step whose wrap fits max_lines within max_w (+overflow, which is
    the deliberate edge crop the hero uses). Falls back to the smallest step."""
    for pt in steps:
        f = font(file, pt, weight)
        lines = wrap(draw, text, f, max_w + overflow)
        if len(lines) <= max_lines and all(
                draw.textlength(l, font=f) <= max_w + overflow for l in lines):
            return f, lines, pt
    f = font(file, steps[-1], weight)
    return f, wrap(draw, text, f, max_w + overflow)[:max_lines], steps[-1]

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def parse():
    src = open(DATA).read()
    imports = dict(re.findall(r"import\s+(\w+)\s+from\s+'\.\./assets/images/([^']+)'", src))
    blocks = re.split(r"\n  \{\n", src)[1:]
    out = []
    for b in blocks:
        def g(k, q="'"):
            m = re.search(rf"{k}:\s*\n?\s*{q}((?:[^{q}\\\\]|\\\\.)*){q}", b)
            return m.group(1).replace("\\'", "'") if m else None
        slug, title = g("slug"), g("title")
        if not slug:
            continue
        var = re.search(r"image:\s*(\w+)", b)
        out.append({
            "slug": slug, "title": title, "category": g("category"),
            "tagline": g("tagline"), "summary": first_sentence(g("summary")),
            "status": g("status"), "updated": g("updated"),
            "image": imports.get(var.group(1)) if var else None,
        })
    return out


def first_sentence(text):
    """One sentence, the same trim scripts/prerender.mjs applies to meta
    descriptions. A card that stops mid-clause reads as broken."""
    if not text:
        return None
    m = re.match(r"^.*?[.?!](\s|$)", text)
    return (m.group(0) if m else text).strip()


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= max_w:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def updated_label(updated):
    yr, mo = updated.split("-")
    return f"{MONTHS[int(mo) - 1]} {yr}"


def status_color(status):
    """Live reads as available now; the others stay quiet — same rule the
    cards on the site follow."""
    return ACCENT if status == "Live" else GRAPHITE


def build(p):
    """F2 on a 2400x1260 canvas: text composed left, the real screenshot
    dominating the right and bleeding off the top, right and bottom edges."""
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    pad = 56 * S
    shot_x = round(W * 0.47)           # screenshot takes the right 53%
    text_w = shot_x - pad * 2

    # The screenshot is the composition, not an inset: it takes the right
    # 55%, bleeds off the top and right edges, and keeps its own aspect ratio.
    # Forcing it to bleed off the bottom as well would mean cropping a 16:10
    # source into a 1:1 slot, which upscales 1.4x and cuts a third of the
    # interface away — the opposite of evidence. Top-aligned, like
    # .pcard--right .pcard-shot { align-self: start }.
    if p["image"]:
        src = os.path.join(IMGS, p["image"])
        if os.path.exists(src):
            source = Image.open(src).convert("RGB")
            sw = W - shot_x
            # Natural height for the source's own aspect, floored at 76% of the
            # canvas so the shot has real presence. That floor crops at most
            # ~15% off a 16:10 screenshot's right edge, which the left-top
            # anchor keeps clear of the interface.
            sh = min(H, max(round(sw * source.height / source.width),
                            round(H * 0.76)))
            shot = ImageOps.fit(source, (sw, sh), method=Image.LANCZOS,
                                centering=(0.0, 0.0))
            img.paste(shot, (shot_x, 0))
            # Boundary, not Rule: this is the edge of real evidence, and it is
            # the only edge the image has left now that two sides bleed away.
            d.rectangle([shot_x, 0, shot_x + 1 * S, sh], fill=BOUNDARY)
            d.rectangle([shot_x, sh, W, sh + 1 * S], fill=BOUNDARY)

    # A 2px ink rule across the text column only — the site's section divider,
    # not a frame. It never crosses the screenshot.
    d.rectangle([pad, pad, pad + text_w, pad + 2 * S], fill=INK)

    foot_y = H - pad - 30 * S
    rule_y = foot_y - 28 * S

    y = pad + 34 * S
    d.text((pad, y), p["category"].upper(), font=f_label, fill=GRAPHITE)
    y += 46 * S

    f_title, lines, pt = fit(d, p["title"], TITLE_STEPS, text_w, 2)
    for line in lines:
        d.text((pad, y), line, font=f_title, fill=INK)
        y += round(pt * 1.02) * S
    y += 14 * S

    tag_lines = wrap(d, p["tagline"], f_tagline, text_w) if p["tagline"] else []
    for line in tag_lines:
        d.text((pad, y), line, font=f_tagline, fill=GRAPHITE)
        y += 26 * S
    if tag_lines:
        y += 16 * S

    # The summary is one whole sentence and is never cut. It steps down through
    # the reading ramp until it fits the space left above the foot rule, so a
    # long first sentence sets smaller rather than stopping mid-clause.
    if p["summary"]:
        room = rule_y - 40 * S - y
        for pts in (20, 19, 18, 17, 16):
            fp = font("Literata-var.ttf", pts, 400)
            step = round(pts * 1.7) * S
            sum_lines = wrap(d, p["summary"], fp, text_w)
            if len(sum_lines) * step <= room:
                break
        for line in sum_lines:
            d.text((pad, y), line, font=fp, fill=INK)
            y += step

    # Status and date pin to the foot; the slack between them and the block
    # above is the intentional void, exactly like the footprint's trailing row.
    d.rectangle([pad, rule_y, pad + text_w, rule_y + 1 * S], fill=RULE)
    x = pad
    if p["status"]:
        d.text((x, foot_y), p["status"].upper(), font=f_meta, fill=status_color(p["status"]))
        x += d.textlength(p["status"].upper(), font=f_meta) + 18 * S
    if p["updated"]:
        d.text((x, foot_y), updated_label(p["updated"]), font=f_meta, fill=GRAPHITE)

    os.makedirs(OUT, exist_ok=True)
    dest = os.path.join(OUT, p["slug"] + ".jpg")
    img.save(dest, quality=88, optimize=True)
    return dest


def site_domain():
    """Read the canonical domain from the prerender script so the cover card
    can never drift from the deployed URL again."""
    src = open(os.path.join(ROOT, "scripts", "prerender.mjs")).read()
    m = re.search(r"const BASE = '(?:https?://)?([^\']+)'", src)
    return m.group(1).rstrip("/") if m else "chad-kraus-portfolio.vercel.app"


def site_role():
    """The role line, read from profile.js so it matches the homepage rather
    than being restated here. Only `title` is read — profile.js also holds an
    email and a phone number, which must never reach a social card."""
    src = open(os.path.join(ROOT, "src", "data", "profile.js")).read()
    m = re.search(r"\n  title:\s*\n?\s*'((?:[^'\\]|\\.)*)'", src)
    return m.group(1).replace("\\'", "'") if m else None


def build_cover(projects):
    """The site-wide card used for / and every non-project page. Follows the
    production hero and Background: identity at display scale with the first
    line cropped past the left edge, and the portrait at real scale bleeding
    off the right."""
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    pad = 56 * S
    port_x = round(W * 0.635)          # portrait takes the right ~36.5%
    text_w = port_x - pad * 2

    # Portrait at column scale, bleeding off the top, right and bottom, the way
    # the Background section runs it through the gutter.
    photo = ImageOps.fit(Image.open(os.path.join(IMGS, "headshot.jpg")).convert("RGB"),
                         (W - port_x, H), method=Image.LANCZOS, centering=(0.5, 0.30))
    img.paste(photo, (port_x, 0))
    d.rectangle([port_x, 0, port_x + 1 * S, H], fill=BOUNDARY)

    d.rectangle([pad, pad, pad + text_w, pad + 2 * S], fill=INK)

    y = pad + 34 * S
    d.text((pad, y), site_domain().upper(), font=f_label, fill=GRAPHITE)
    y += 52 * S

    # The identity is allowed to crop past the left edge, as it does on the
    # homepage. Line one hangs; line two is indented, same as .l1 / .l2.
    crop = 26 * S
    f_id, _, npt = fit(d, "Chadwick (Chad)", NAME_STEPS, text_w, 1, overflow=crop)
    for i, line in enumerate(("Chadwick (Chad)", "Kraus")):
        d.text((pad - crop if i == 0 else pad + 18 * S, y), line, font=f_id, fill=INK)
        y += round(npt * 0.92) * S
    y += 26 * S

    role = site_role()
    if role:
        for line in wrap(d, role, f_role, text_w)[:4]:
            d.text((pad, y), line, font=f_role, fill=GRAPHITE)
            y += 40 * S

    # Featured projects, taken from the top of projects.js so they stay current.
    foot_y = H - pad - 30 * S
    rule_y = foot_y - 28 * S
    d.rectangle([pad, rule_y, pad + text_w, rule_y + 1 * S], fill=RULE)
    d.text((pad, foot_y), "  ·  ".join(p["title"] for p in projects[:3]),
           font=f_meta, fill=GRAPHITE)

    dest = os.path.join(ROOT, "public", "og-image.png")
    img.save(dest, optimize=True)
    return dest


if __name__ == "__main__":
    projects = parse()
    if not projects:
        sys.exit("no projects parsed — check src/data/projects.js")
    print(f"  {'og-image.png':<28} site cover ({site_domain()})")
    build_cover(projects)
    for p in projects:
        print(f"  {os.path.basename(build(p)):<28} {p['title']}")
    print(f"generated {len(projects) + 1} og images")
