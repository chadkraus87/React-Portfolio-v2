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
PAPER    = (0xF7, 0xF7, 0xF5)
SURFACE  = (0xFF, 0xFF, 0xFF)
INSET    = (0xEF, 0xEF, 0xEC)
INK      = (0x14, 0x17, 0x1A)
GRAPHITE = (0x5A, 0x61, 0x69)
RULE     = (0xD6, 0xD9, 0xDD)
BOUNDARY = (0x7F, 0x86, 0x8F)
SIGNAL   = (0xB2, 0x3A, 0x16)
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
# Martian Mono for identifiers.
f_title   = font("Archivo-var.ttf", 58, 700)
f_name    = font("Archivo-var.ttf", 66, 700)
f_label   = font("MartianMono-var.ttf", 15, 500)
f_tagline = font("MartianMono-var.ttf", 15, 400)
f_meta    = font("MartianMono-var.ttf", 16, 500)
f_prose   = font("Literata-var.ttf", 20, 400)
f_role    = font("Literata-var.ttf", 24, 400)

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
    return SIGNAL if status == "Live" else GRAPHITE


def build(p):
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # The site's one structural divider: a 2px ink rule across the top.
    d.rectangle([0, 0, W, 2 * S], fill=INK)

    pad = 64 * S
    panel_w = int(W * 0.46) - pad
    x = pad
    text_w = W - panel_w - pad * 3

    # Evidence panel: the real screenshot, square corners, hairline border,
    # 16:10 like .evi__figure img on the homepage.
    if p["image"]:
        src = os.path.join(IMGS, p["image"])
        if os.path.exists(src):
            ph = round(panel_w * 10 / 16)
            shot = ImageOps.fit(Image.open(src).convert("RGB"), (panel_w, ph),
                                method=Image.LANCZOS, centering=(0.5, 0.0))
            px, py = W - panel_w - pad, (H - ph) // 2
            img.paste(shot, (px, py))
            d.rectangle([px, py, px + panel_w - 1, py + ph - 1], outline=RULE, width=1 * S)

    # Build the left column as a measured block first, so it can be centred
    # against the panel instead of hanging from the top with dead space below.
    block = [(p["category"].upper(), f_label, GRAPHITE, 44 * S)]
    for line in wrap(d, p["title"], f_title, text_w)[:2]:
        block.append((line, f_title, INK, 68 * S))
    if p["tagline"]:
        block[-1] = (*block[-1][:3], block[-1][3] + 10 * S)
        for line in wrap(d, p["tagline"], f_tagline, text_w)[:2]:
            block.append((line, f_tagline, GRAPHITE, 27 * S))
    if p["summary"]:
        block[-1] = (*block[-1][:3], block[-1][3] + 22 * S)
        for line in wrap(d, p["summary"], f_prose, text_w)[:3]:
            block.append((line, f_prose, INK, 34 * S))

    foot_y = H - pad - 20 * S
    rule_y = foot_y - 26 * S
    height = sum(step for _, _, _, step in block)
    y = max(pad + 8 * S, (rule_y - height) // 2)

    for text, fnt, fill, step in block:
        d.text((x, y), text, font=fnt, fill=fill)
        y += step

    # Status and date sit in their own position at the foot — never a badge.
    d.rectangle([x, rule_y, x + text_w, rule_y + 1 * S], fill=RULE)
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
    """The site-wide card used for / and every non-project page."""
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 2 * S], fill=INK)

    pad = 64 * S
    D = 340 * S                      # square headshot — zero radius, like the site
    x = pad
    text_w = W - D - pad * 3

    block = [(site_domain().upper(), f_label, GRAPHITE, 50 * S)]
    for line in ("Chadwick (Chad)", "Kraus"):
        block.append((line, f_name, INK, 76 * S))
    role = site_role()
    if role:
        block[-1] = (*block[-1][:3], block[-1][3] + 20 * S)
        for line in wrap(d, role, f_role, text_w)[:4]:
            block.append((line, f_role, GRAPHITE, 38 * S))

    foot_y = H - pad - 20 * S
    rule_y = foot_y - 26 * S
    height = sum(step for _, _, _, step in block)
    y = max(pad + 8 * S, (rule_y - height) // 2)
    for text, fnt, fill, step in block:
        d.text((x, y), text, font=fnt, fill=fill)
        y += step

    # Featured projects, taken from the top of projects.js so they stay current.
    d.rectangle([x, rule_y, x + text_w, rule_y + 1 * S], fill=RULE)
    d.text((x, foot_y), "  ·  ".join(p["title"] for p in projects[:3]),
           font=f_meta, fill=GRAPHITE)

    photo = ImageOps.fit(Image.open(os.path.join(IMGS, "headshot.jpg")).convert("RGB"),
                         (D, D), method=Image.LANCZOS, centering=(0.5, 0.4))
    px, py = W - D - pad, (H - D) // 2
    img.paste(photo, (px, py))
    d.rectangle([px, py, px + D - 1, py + D - 1], outline=RULE, width=1 * S)

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
