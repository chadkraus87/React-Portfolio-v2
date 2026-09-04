#!/usr/bin/env /usr/bin/python3
"""Generate the site social card (public/og-image.png) and one per project
(public/og/<slug>.jpg).

Run locally after adding or renaming a project:

    /usr/bin/python3 scripts/make-og-images.py

The output is COMMITTED. It is not part of `npm run build` because Vercel's
build image has Node but not Python/Pillow, and because these only change when
project copy changes — not on every deploy.
"""
import os, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data", "projects.js")
IMGS = os.path.join(ROOT, "src", "assets", "images")
OUT = os.path.join(ROOT, "public", "og")

S = 2                      # 2x for retina
W, H = 1200 * S, 630 * S
PINE, FOREST, MOSS = (30, 58, 43), (46, 89, 64), (107, 143, 113)
MIST, PAPER, INK, BRASS = (228, 235, 228), (247, 246, 241), (32, 38, 31), (168, 134, 47)

SUP, SYS = "/System/Library/Fonts/Supplemental/", "/System/Library/Fonts/"
f_title = ImageFont.truetype(SUP + "Georgia Bold.ttf", 62 * S)
f_tag   = ImageFont.truetype(SYS + "SFNSMono.ttf", 20 * S)
f_sum   = ImageFont.truetype(SYS + "Helvetica.ttc", 21 * S, index=0)
f_meta  = ImageFont.truetype(SYS + "SFNSMono.ttf", 17 * S)


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
            "tagline": g("tagline"), "status": g("status"), "updated": g("updated"),
            "image": imports.get(var.group(1)) if var else None,
        })
    return out


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= max_w:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def build(p):
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 14 * S, H], fill=PINE)                       # brand rail

    panel_w = int(W * 0.42)
    x, right = 78 * S, W - panel_w - 70 * S
    text_w = right - x - 40 * S

    # screenshot panel on the right
    if p["image"]:
        src = os.path.join(IMGS, p["image"])
        if os.path.exists(src):
            shot = ImageOps.fit(Image.open(src).convert("RGB"),
                                (panel_w, H - 150 * S), method=Image.LANCZOS,
                                centering=(0.5, 0.0))
            px, py = W - panel_w - 55 * S, 75 * S
            d.rectangle([px - 3 * S, py - 3 * S, px + panel_w + 3 * S, py + shot.height + 3 * S],
                        fill=FOREST)
            img.paste(shot, (px, py))

    y = 92 * S
    d.text((x, y), "~/", font=f_tag, fill=BRASS)
    d.text((x + 28 * S, y), p["category"].lower(), font=f_tag, fill=MOSS)
    y += 60 * S

    for line in wrap(d, p["title"], f_title, text_w)[:2]:
        d.text((x, y), line, font=f_title, fill=PINE)
        y += 74 * S

    y += 8 * S
    d.rectangle([x, y, x + 84 * S, y + 4 * S], fill=BRASS)
    y += 34 * S

    if p["tagline"]:
        for line in wrap(d, p["tagline"], f_tag, text_w)[:2]:
            d.text((x, y), line, font=f_tag, fill=FOREST)
            y += 32 * S

    # status pill + updated, pinned near the bottom
    y = H - 96 * S
    if p["status"]:
        tw = d.textlength(p["status"], font=f_meta)
        d.rounded_rectangle([x, y, x + tw + 34 * S, y + 40 * S], radius=20 * S,
                            outline=FOREST, width=2 * S, fill=MIST)
        d.text((x + 17 * S, y + 11 * S), p["status"], font=f_meta, fill=FOREST)
        x2 = x + tw + 48 * S
    else:
        x2 = x
    if p["updated"]:
        yr, mo = p["updated"].split("-")
        month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][int(mo)-1]
        d.text((x2, y + 11 * S), f"updated {month} {yr}", font=f_meta, fill=MOSS)

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


def build_cover(projects):
    """The site-wide card used for / and every non-project page."""
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 14 * S, H], fill=PINE)

    f_name = ImageFont.truetype(SUP + "Georgia Bold.ttf", 76 * S)
    f_role = ImageFont.truetype(SYS + "Helvetica.ttc", 29 * S, index=0)
    f_pill = ImageFont.truetype(SYS + "Helvetica.ttc", 20 * S, index=0)

    x, y = 78 * S, 92 * S
    d.text((x, y), "~/", font=f_tag, fill=BRASS)
    d.text((x + 30 * S, y), site_domain(), font=f_tag, fill=MOSS)
    y += 58 * S

    for line in ("Chadwick (Chad)", "Kraus"):
        d.text((x, y), line, font=f_name, fill=PINE)
        y += 84 * S
    y += 24 * S

    d.rectangle([x, y, x + 92 * S, y + 4 * S], fill=BRASS)
    y += 40 * S

    for line in ("Network IT Specialist at Rockbot \u2014",
                 "Tier 2/3 escalations, QA operations,",
                 "and AI tooling built with Claude Code."):
        d.text((x, y), line, font=f_role, fill=INK)
        y += 40 * S

    # Featured projects, taken from the top of projects.js so they stay current.
    y = H - 96 * S
    tx = x
    for label in [p["title"] for p in projects[:3]]:
        tw = d.textlength(label, font=f_pill)
        d.rounded_rectangle([tx, y, tx + tw + 36 * S, y + 44 * S], radius=8 * S, fill=MIST)
        d.text((tx + 18 * S, y + 11 * S), label, font=f_pill, fill=FOREST)
        tx += tw + 36 * S + 12 * S

    photo = Image.open(os.path.join(IMGS, "headshot.jpg")).convert("RGB")
    D = 330 * S
    photo = ImageOps.fit(photo, (D, D), method=Image.LANCZOS, centering=(0.5, 0.4))
    mask = Image.new("L", (D * 4, D * 4), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, D * 4, D * 4], fill=255)
    mask = mask.resize((D, D), Image.LANCZOS)
    px, py = W - D - 96 * S, (H - D) // 2
    ring = 8 * S
    d.ellipse([px - ring, py - ring, px + D + ring, py + D + ring], fill=FOREST)
    img.paste(photo, (px, py), mask)

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
