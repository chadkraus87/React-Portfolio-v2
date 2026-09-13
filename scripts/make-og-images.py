#!/usr/bin/env /usr/bin/python3
"""Generate the site social card (public/og-image.png) and one card per project
(public/og/<slug>.jpg) in the Server Room design system.

Run locally after adding or renaming a project, or after changing project copy:

    /usr/bin/python3 scripts/make-og-images.py

The output is COMMITTED. It is not part of `npm run build` because Vercel's
build image has Node but not Python/Pillow, and because these only change when
project copy changes — not on every deploy.

Everything a card says is parsed from src/data/projects.js, src/data/racks.js
and the `title` line of src/data/profile.js. Nothing here invents a metric, a
status, a date or a description.

Fonts are vendored under scripts/fonts/ so this renders identically anywhere
with no network access — see scripts/fonts/README.md.
"""
import os, re, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data")
IMGS = os.path.join(ROOT, "src", "assets", "images")
FONTS = os.path.join(ROOT, "scripts", "fonts")
OUT = os.path.join(ROOT, "public", "og")

S = 2                      # 2x for retina
W, H = 1200 * S, 630 * S

# Thermal tokens, straight from src/index.css. Nothing else.
BG       = (0x08, 0x06, 0x05)
BG2      = (0x1E, 0x0E, 0x07)
TEXT     = (0xF5, 0xED, 0xE6)
PROSE    = (0xE4, 0xD9, 0xCF)
MUTED    = (0xA9, 0x97, 0x8B)
ACCENT   = (0xFF, 0xB5, 0x47)
ACC_INK  = (0x1A, 0x0F, 0x03)
LIVE     = (0x7F, 0xD6, 0x8A)
PRIVATE  = (0xE4, 0xDA, 0xCF)
STEEL    = [(0x06, 0x04, 0x03), (0x0F, 0x0B, 0x09), (0x19, 0x13, 0x10),
            (0x26, 0x1E, 0x19), (0x3B, 0x2F, 0x28), (0x5E, 0x4D, 0x41)]
TAPE     = (0xEC, 0xE4, 0xD3)
TAPE_INK = (0x16, 0x12, 0x0E)
VFD_BG   = (0x0A, 0x06, 0x03)

STATUS_VFD = {"Live": "LIVE", "In progress": "IN PROG", "Private": "PRIVATE"}
STATUS_LED = {"Live": LIVE, "In progress": ACCENT, "Private": PRIVATE}
MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

# Type roles mirror DESIGN.md.
DISPLAY = "BigShouldersDisplay-var.ttf"   # titles and the name
UI = "Saira-var.ttf"                      # prose and label tape
MONO = "GeistMono-var.ttf"                # kickers and metadata
DOT = "Doto-var.ttf"                      # front-panel readouts only

_fonts = {}


def font(file, size, weight, width=None):
    """A vendored variable font pinned to explicit axes, so output never depends
    on the file's default instance. Sizes are points; S scales them to pixels."""
    key = (file, size, weight, width)
    if key not in _fonts:
        f = ImageFont.truetype(os.path.join(FONTS, file), round(size * S))
        vals = []
        for a in f.get_variation_axes():
            name = a["name"] if isinstance(a["name"], str) else a["name"].decode()
            if name == "Weight":
                vals.append(weight)
            elif name == "Width" and width is not None:
                vals.append(width)
            else:
                vals.append(a["default"])
        f.set_variation_by_axes(vals)
        _fonts[key] = f
    return _fonts[key]


# ---------------------------------------------------------------- data

def js_string(block, key):
    m = re.search(rf"{key}:\s*\n?\s*'((?:[^'\\]|\\.)*)'", block)
    return m.group(1).replace("\\'", "'") if m else None


def parse_projects():
    src = open(os.path.join(DATA, "projects.js")).read()
    imports = dict(re.findall(r"import\s+(\w+)\s+from\s+'\.\./assets/images/([^']+)'", src))
    out = []
    for b in re.split(r"\n  \{\n", src)[1:]:
        slug = js_string(b, "slug")
        if not slug:
            continue
        var = re.search(r"image:\s*(\w+)", b)
        out.append({
            "slug": slug, "title": js_string(b, "title"), "tagline": js_string(b, "tagline"),
            "summary": first_sentence(js_string(b, "summary")),
            "status": js_string(b, "status"), "updated": js_string(b, "updated"),
            "image": imports.get(var.group(1)) if var else None,
        })
    return out


def parse_racks():
    """Rack code, name and top-to-bottom slugs, read from src/data/racks.js."""
    src = open(os.path.join(DATA, "racks.js")).read().split("export const lenses")[0]
    racks = []
    for m in re.finditer(r"code:\s*'([^']+)',\s*name:\s*'([^']+)',.*?slugs:\s*\[([^\]]*)\]", src, re.S):
        racks.append({"code": m.group(1), "name": m.group(2), "slugs": re.findall(r"'([^']+)'", m.group(3))})
    return racks


def first_sentence(text):
    """One sentence, the same trim scripts/prerender.mjs applies to meta descriptions."""
    if not text:
        return None
    m = re.match(r"^.*?[.?!](\s|$)", text)
    return (m.group(0) if m else text).strip()


def unit_label(k):
    """U position of the k-th unit from the top, matching src/lib/rackModel.js."""
    return f"U{10 - 2 * k}–{11 - 2 * k}"


def updated_label(updated):
    yr, mo = updated.split("-")
    return f"{MONTHS[int(mo) - 1]} {yr}"


def site_domain():
    """The canonical domain, read from the prerender script so it can't drift."""
    src = open(os.path.join(ROOT, "scripts", "prerender.mjs")).read()
    m = re.search(r"const BASE = '(?:https?://)?([^\']+)'", src)
    return m.group(1).rstrip("/") if m else "chad-kraus-portfolio.vercel.app"


def eyebrow():
    """The part of profile.title before the dash, as the home page shows it.
    Only `title` is read — profile.js also holds contact details that must never
    reach a social card."""
    src = open(os.path.join(DATA, "profile.js")).read()
    m = re.search(r"\n  title:\s*\n?\s*'((?:[^'\\]|\\.)*)'", src)
    return m.group(1).replace("\\'", "'").split("—")[0].strip() if m else None


# ---------------------------------------------------------------- drawing

def tracked(d, xy, text, f, fill, track=0.0):
    """Draw text with letter-spacing (a fraction of the font size). Returns end x."""
    x, y = xy
    gap = f.size * track
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + gap
    return x


def tracked_len(d, text, f, track=0.0):
    return sum(d.textlength(ch, font=f) for ch in text) + f.size * track * max(len(text) - 1, 0)


def wrap(d, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def vgrad(w, h, top, bottom):
    strip = Image.new("RGB", (1, 256))
    for i in range(256):
        t = i / 255
        strip.putpixel((0, i), tuple(round(top[k] + (bottom[k] - top[k]) * t) for k in range(3)))
    return strip.resize((max(w, 1), max(h, 1)), Image.BILINEAR)


def ground(cx=0.64, cy=0.42):
    """The room: near-black with the warm light falloff behind the racks."""
    sw, sh = 240, 126
    small = Image.new("RGB", (sw, sh))
    px = small.load()
    for y in range(sh):
        for x in range(sw):
            dx, dy = (x / sw - cx) / 0.6, (y / sh - cy) / 0.8
            t = max(0.0, 1 - (dx * dx + dy * dy) ** 0.5) ** 2
            px[x, y] = tuple(round(BG[k] + (BG2[k] - BG[k]) * t) for k in range(3))
    return small.resize((W, H), Image.BICUBIC).convert("RGBA")


def shadow(img, box, blur, alpha=170):
    x0, y0, x1, y1 = box
    m = blur * 3
    layer = Image.new("RGBA", (x1 - x0 + 2 * m, y1 - y0 + 2 * m), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rectangle([m, m, m + x1 - x0, m + y1 - y0], fill=(0, 0, 0, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(layer, (max(x0 - m, 0), max(y0 - m, 0)),
                        (max(m - x0, 0), max(m - y0, 0)))


def kicker(d, x, y, text):
    f = font(MONO, 13, 500)
    d.rectangle([x, y + 8 * S, x + 26 * S, y + 9 * S], fill=ACCENT)
    return tracked(d, (x + 38 * S, y), text.upper(), f, ACCENT, 0.12)


def brand(d, x, y):
    f = font(DISPLAY, 14, 900)
    chip_w = tracked_len(d, "CK", f, 0.12) + 12 * S
    d.rectangle([x, y, x + chip_w, y + 24 * S], fill=ACCENT)
    tracked(d, (x + 6 * S, y + 3 * S), "CK", f, ACC_INK, 0.12)
    tracked(d, (x + chip_w + 12 * S, y + 1 * S), "CHAD KRAUS", font(DISPLAY, 19, 800), TEXT, 0.06)


def vfd(img, x, y, text, size=13):
    """An amber dot-matrix readout with its glow. Returns the box."""
    d = ImageDraw.Draw(img)
    f = font(DOT, size, 800)
    top = d.textbbox((0, 0), text, font=f)
    tw, th = tracked_len(d, text, f, 0.06), top[3] - top[1]
    px, py = 8 * S, 6 * S
    box = (x, y, round(x + tw + 2 * px), round(y + th + 2 * py))
    d.rectangle(box, fill=VFD_BG, outline=(0, 0, 0), width=S)
    m = 10 * S
    glow = Image.new("RGBA", (box[2] - box[0] + 2 * m, box[3] - box[1] + 2 * m), (0, 0, 0, 0))
    tracked(ImageDraw.Draw(glow), (m + px, m + py - top[1]), text, f, ACCENT + (160,), 0.06)
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(4 * S)), (box[0] - m, box[1] - m))
    tracked(ImageDraw.Draw(img), (x + px, y + py - top[1]), text, f, ACCENT, 0.06)
    return box


def tape(img, x, y, text, size, max_w):
    """A label-maker strip. Steps the size down until the label fits max_w."""
    d = ImageDraw.Draw(img)
    t = text.upper()
    pt = size
    while pt > 7 and tracked_len(d, t, font(UI, pt, 700, 78), 0.02) + 12 * S > max_w:
        pt -= 0.5
    f = font(UI, pt, 700, 78)
    top = d.textbbox((0, 0), t, font=f)
    px, py = 6 * S, 3 * S
    box = (x, y, round(x + tracked_len(d, t, f, 0.02) + 2 * px), round(y + top[3] - top[1] + 2 * py))
    d.rectangle((box[0], box[1] + S, box[2], box[3] + S), fill=(0, 0, 0))
    d.rectangle(box, fill=TAPE)
    tracked(d, (x + px, y + py - top[1]), t, f, TAPE_INK, 0.02)
    return box


def monitor(img, x, y, w, path):
    """A real screenshot in a monitor bezel, 16:10, anchored top-left."""
    bezel = 12 * S
    gw = w - 2 * bezel
    gh = round(gw * 10 / 16)
    h = gh + 2 * bezel
    shadow(img, (x, y + 20 * S, x + w, y + h + 10 * S), 26 * S)
    img.paste(vgrad(w, h, (0x23, 0x1B, 0x17), (0x11, 0x0D, 0x0B)), (x, y))
    shot = ImageOps.fit(Image.open(path).convert("RGB"), (gw, gh), method=Image.LANCZOS, centering=(0.0, 0.0))
    img.paste(shot, (x + bezel, y + bezel))
    sheen = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    ImageDraw.Draw(sheen).polygon([(0, 0), (gw * 0.4, 0), (gw * 0.16, gh), (0, gh)], fill=(255, 255, 255, 12))
    img.alpha_composite(sheen, (x + bezel, y + bezel))
    d = ImageDraw.Draw(img)
    d.rectangle([x, y, x + w - 1, y + h - 1], outline=STEEL[4], width=S)
    d.rectangle([x + bezel - S, y + bezel - S, x + bezel + gw, y + bezel + gh], outline=(0, 0, 0), width=S)
    return h


def fit_title(d, text, max_w, steps, max_lines):
    for pt in steps:
        f = font(DISPLAY, pt, 900)
        lines = wrap(d, text.upper(), f, max_w)
        if len(lines) <= max_lines:
            return f, lines, pt
    f = font(DISPLAY, steps[-1], 900)
    return f, wrap(d, text.upper(), f, max_w)[:max_lines], steps[-1]


# ---------------------------------------------------------------- cards

def build(p, where):
    img = ground()
    d = ImageDraw.Draw(img)
    pad = 60 * S
    col = round(W * 0.47)
    text_w = col - pad - 36 * S

    brand(d, pad, pad)
    y = pad + 76 * S
    if where:
        kicker(d, pad, y, where)
        y += 40 * S

    f_title, lines, pt = fit_title(d, p["title"], text_w, [92, 84, 76, 68, 60, 54], 2)
    for line in lines:
        d.text((pad, y), line, font=f_title, fill=TEXT)
        y += round(pt * 0.9) * S
    y += 30 * S

    if p["tagline"]:
        for line in wrap(d, p["tagline"], font(MONO, 14, 500), text_w)[:2]:
            d.text((pad, y), line, font=font(MONO, 14, 500), fill=PROSE)
            y += 24 * S
        y += 14 * S

    foot_y = H - pad - 30 * S
    if p["summary"]:
        room = foot_y - 28 * S - y
        for pts in (21, 20, 19, 18, 17, 16):
            fp = font(UI, pts, 400)
            step = round(pts * 1.55) * S
            body = wrap(d, p["summary"], fp, text_w)
            if len(body) * step <= room:
                break
        for line in body:
            d.text((pad, y), line, font=fp, fill=MUTED)
            y += step

    x = pad
    if p["status"]:
        box = vfd(img, x, foot_y - 2 * S, STATUS_VFD.get(p["status"], p["status"].upper()))
        x = box[2] + 16 * S
    d = ImageDraw.Draw(img)
    if p["updated"]:
        tracked(d, (x, foot_y + 5 * S), f"UPDATED {updated_label(p['updated'])}", font(MONO, 13, 500), MUTED, 0.08)

    mon_w = W - pad - col
    if p["image"] and os.path.exists(os.path.join(IMGS, p["image"])):
        gh = round((mon_w - 24 * S) * 10 / 16) + 24 * S
        my = (H - gh) // 2 - 16 * S
        monitor(img, col, my, mon_w, os.path.join(IMGS, p["image"]))
        d = ImageDraw.Draw(img)
        dom = site_domain().upper()
        fd = font(MONO, 12, 500)
        tracked(d, (W - pad - tracked_len(d, dom, fd, 0.08), my + gh + 22 * S), dom, fd, MUTED, 0.08)

    os.makedirs(OUT, exist_ok=True)
    dest = os.path.join(OUT, p["slug"] + ".jpg")
    img.convert("RGB").save(dest, quality=88, optimize=True)
    return dest


def draw_rack(img, x, y, w, rack, by_slug, pulled=None):
    """A flat, front-on rack: cap with the stencilled code, a patch row, and one
    2U unit per project with its label tape, status readout and power LED."""
    d = ImageDraw.Draw(img)
    cap, patch, unit, blank, foot = 44, 72, 138, 22, 30
    rail = 22
    h = cap + patch + blank + unit * len(rack["slugs"]) + blank + foot
    shadow(img, (x, y + 30, x + w, y + h + 20), 40, 200)
    d = ImageDraw.Draw(img)

    img.paste(vgrad(w, cap, STEEL[3], STEEL[1]), (x, y))
    d.rectangle([x, y, x + w - 1, y + cap - 1], outline=STEEL[4], width=2)
    fs = font(DISPLAY, 13, 900)
    sw = tracked_len(d, rack["code"], fs, 0.1)
    d.rectangle([x + 16, y + 8, x + 32 + sw, y + cap - 8], fill=STEEL[1], outline=STEEL[5], width=2)
    tracked(d, (x + 24, y + 9), rack["code"], fs, (0xEA, 0xDC, 0xC8), 0.1)
    fn = font(MONO, 9, 500)
    name = rack["name"].upper()
    tracked(d, (x + w - 16 - tracked_len(d, name, fn, 0.1), y + 13), name, fn, MUTED, 0.1)

    body_y = y + cap
    body_h = h - cap - foot
    img.paste(vgrad(w, body_h, STEEL[1], STEEL[0]), (x, body_y))
    for rx in (x, x + w - rail):
        img.paste(vgrad(rail, body_h, STEEL[3], STEEL[2]), (rx, body_y))
        for ty in range(body_y + 10, body_y + body_h - 6, 23):
            d.rectangle([rx + 7, ty, rx + rail - 7, ty + 7], fill=STEEL[0])

    py = body_y + 12
    d.rectangle([x + rail + 8, py, x + w - rail - 8, py + patch - 24], fill=STEEL[2], outline=STEEL[4], width=2)
    jacks = 8
    span = (w - 2 * rail - 48) / jacks
    for j in range(jacks):
        jx = round(x + rail + 24 + j * span)
        d.rectangle([jx, py + 14, jx + 18, py + 30], fill=STEEL[0], outline=STEEL[5], width=2)
        d.ellipse([jx + 6, py + 36, jx + 12, py + 42], fill=ACCENT if j % 3 == 0 else STEEL[4])

    # The frame outline goes down before the units, so a pulled unit sits over it.
    ImageDraw.Draw(img).rectangle([x, y, x + w - 1, y + h - 1], outline=STEEL[4], width=2)
    uy = body_y + patch + blank
    for k, slug in enumerate(rack["slugs"]):
        p = by_slug.get(slug)
        if not p:
            continue
        # A pulled unit slides out on its rails, lit; the rest of the rack dims.
        shift = 64 if slug == pulled else 0
        fx0, fx1 = x + rail + 4 + shift, x + w - rail - 4 + shift
        if shift:
            shadow(img, (fx0, uy + 14, fx1, uy + unit), 22, 220)
            glow = Image.new("RGBA", (fx1 - fx0 + 80, unit + 70), (0, 0, 0, 0))
            ImageDraw.Draw(glow).rectangle([40, 35, 40 + fx1 - fx0, 35 + unit - 10], outline=ACCENT + (210,), width=10)
            img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(16)), (fx0 - 40, uy - 30))
        fy0, fy1 = uy + 5, uy + unit - 5
        img.paste(vgrad(fx1 - fx0, fy1 - fy0, (0x2A, 0x21, 0x1C), (0x14, 0x10, 0x0D)), (fx0, fy0))
        d = ImageDraw.Draw(img)
        d.rectangle([fx0, fy0, fx1, fy1], outline=STEEL[4], width=2)
        d.line([fx0 + 2, fy0 + 2, fx1 - 2, fy0 + 2], fill=(0x4A, 0x3C, 0x33), width=2)
        if shift:
            d.rectangle([fx0, fy0, fx1, fy1], outline=ACCENT, width=4)
        for vx in range(fx0 + 16, fx0 + 40, 7):
            d.rectangle([vx, fy0 + 18, vx + 3, fy1 - 18], fill=STEEL[0])
        readout = STATUS_VFD.get(p["status"], "")
        rw = tracked_len(ImageDraw.Draw(img), readout, font(DOT, 9, 800), 0.06) + 16 * S
        rb = vfd(img, round(fx1 - 18 - rw), fy0 + 18, readout, size=9)
        tape(img, fx0 + 54, fy0 + 20, p["title"], 12, rb[0] - (fx0 + 54) - 16)
        d = ImageDraw.Draw(img)
        for b in range(4):
            bx = fx0 + 54 + b * 30
            d.rectangle([bx, fy1 - 40, bx + 24, fy1 - 22], fill=STEEL[0], outline=STEEL[4], width=2)
        led = STATUS_LED.get(p["status"], MUTED)
        lx, ly = fx1 - 44, fy1 - 42
        glow = Image.new("RGBA", (60, 60), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([20, 20, 40, 40], fill=led + (190,))
        img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(7)), (lx - 20, ly - 20))
        d = ImageDraw.Draw(img)
        d.ellipse([lx - 1, ly - 1, lx + 21, ly + 21], outline=STEEL[0], width=3)
        d.ellipse([lx + 3, ly + 3, lx + 17, ly + 17], fill=led)
        if pulled and not shift:
            img.alpha_composite(Image.new("RGBA", (fx1 - fx0 + 1, fy1 - fy0 + 1), (0, 0, 0, 120)), (fx0, fy0))
        uy += unit

    fy = y + h - foot
    img.paste(vgrad(w, foot, STEEL[2], STEEL[0]), (x, fy))
    return h


def build_cover(projects, racks):
    img = ground(cx=0.76, cy=0.45)
    d = ImageDraw.Draw(img)
    pad = 60 * S
    by_slug = {p["slug"]: p for p in projects}

    brand(d, pad, pad)
    y = pad + 100 * S
    role = eyebrow()
    if role:
        kicker(d, pad, y, role)
        y += 46 * S

    f_name = font(DISPLAY, 150, 900)
    for word in ("CHAD", "KRAUS"):
        box = d.textbbox((0, 0), word, font=f_name)
        mask = Image.new("L", (box[2], box[3]), 0)
        ImageDraw.Draw(mask).text((0, 0), word, font=f_name, fill=255)
        fill = vgrad(box[2], box[3], (0xFF, 0xF8, 0xEE), (0xB8, 0x97, 0x7C))
        img.paste(fill, (pad - box[0], y - box[1]), mask)
        y += round(150 * 0.8) * S
    d = ImageDraw.Draw(img)
    y += 30 * S
    tracked(d, (pad, y), "NETWORKS. SOFTWARE. THE BODY.", font(DISPLAY, 34, 700), TEXT, 0.02)

    dom = site_domain().upper()
    tracked(d, (pad, H - pad - 16 * S), dom, font(MONO, 13, 500), MUTED, 0.1)

    rack_w, gap = 480, 56
    shown = racks[:2]
    x0 = W - pad - rack_w * len(shown) - gap * (len(shown) - 1)
    for k, rack in enumerate(shown):
        draw_rack(img, x0 + k * (rack_w + gap), 150 + k * 34, rack_w, rack, by_slug)

    dest = os.path.join(ROOT, "public", "og-image.png")
    img.convert("RGB").save(dest, optimize=True)
    return dest


def build_unit(p, rack, k, by_slug):
    """The share card for /?unit=<slug>: the project's rack with its unit pulled
    out and lit, beside the project's title, tagline and status."""
    img = ground(cx=0.74, cy=0.45)
    d = ImageDraw.Draw(img)
    pad = 60 * S
    col = round(W * 0.5)
    text_w = col - pad - 30 * S

    brand(d, pad, pad)
    y = pad + 76 * S
    kicker(d, pad, y, f"Rack {rack['code']} \u00b7 {unit_label(k)} \u00b7 {rack['name']}")
    y += 40 * S
    f_title, lines, pt = fit_title(d, p["title"], text_w, [96, 88, 80, 72, 64, 56], 2)
    for line in lines:
        d.text((pad, y), line, font=f_title, fill=TEXT)
        y += round(pt * 0.9) * S
    y += 30 * S
    if p["tagline"]:
        for line in wrap(d, p["tagline"], font(MONO, 15, 500), text_w)[:2]:
            d.text((pad, y), line, font=font(MONO, 15, 500), fill=PROSE)
            y += 26 * S

    foot_y = H - pad - 30 * S
    x = pad
    if p["status"]:
        box = vfd(img, x, foot_y - 2 * S, STATUS_VFD.get(p["status"], p["status"].upper()))
        x = box[2] + 16 * S
    tracked(ImageDraw.Draw(img), (x, foot_y + 5 * S), site_domain().upper(), font(MONO, 13, 500), MUTED, 0.08)

    rack_w = 520
    draw_rack(img, W - pad - rack_w - 64, (H - 880) // 2, rack_w, rack, by_slug, pulled=p["slug"])

    dest = os.path.join(OUT, "units", p["slug"] + ".jpg")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img.convert("RGB").save(dest, quality=86, optimize=True)
    return dest


if __name__ == "__main__":
    projects = parse_projects()
    racks = parse_racks()
    if not projects or not racks:
        sys.exit("nothing parsed — check src/data/projects.js and src/data/racks.js")
    where = {}
    for r in racks:
        for k, slug in enumerate(r["slugs"]):
            where[slug] = f"Rack {r['code']} · {unit_label(k)} · {r['name']}"
    print(f"  {'og-image.png':<28} site cover ({site_domain()})")
    build_cover(projects, racks)
    for p in projects:
        print(f"  {os.path.basename(build(p, where.get(p['slug']))):<28} {p['title']}")
    by_slug = {p["slug"]: p for p in projects}
    units = 0
    for r in racks:
        for k, slug in enumerate(r["slugs"]):
            if slug in by_slug:
                build_unit(by_slug[slug], r, k, by_slug)
                print(f"  {'units/' + slug + '.jpg':<28} {by_slug[slug]['title']}, pulled out")
                units += 1
    print(f"generated {len(projects) + 1 + units} og images")
