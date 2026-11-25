"""Builds every PMS Check logo SVG from one geometry. Run with a Python that has fontTools."""
import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "svg"
FONT = ROOT.parent / "app/mobile/node_modules/@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf"

INK, PANEL, PANEL_INK, ACCENT = "#0A0B0F", "#14171B", "#F3F5F6", "#FFC52E"

# Mark geometry on a 174×174 box: two legs and a V, stroke 30, round ends.
STROKE = 30
LEGS = [((15, 15), (15, 159)), ((159, 15), (159, 159))]
VEE = [(15, 15), (87, 119), (159, 15)]
SMALL_STROKE = 38
SMALL_VEE = [(15, 15), (87, 106), (159, 15)]


def capsule(a, b, r):
    (ax, ay), (bx, by) = a, b
    length = math.hypot(bx - ax, by - ay)
    nx, ny = -(by - ay) / length * r, (bx - ax) / length * r
    return (f"M{ax + nx:.2f} {ay + ny:.2f}L{bx + nx:.2f} {by + ny:.2f}"
            f"A{r} {r} 0 0 0 {bx - nx:.2f} {by - ny:.2f}L{ax - nx:.2f} {ay - ny:.2f}"
            f"A{r} {r} 0 0 0 {ax + nx:.2f} {ay + ny:.2f}Z")


def mark_paths(small=False):
    r = (SMALL_STROKE if small else STROKE) / 2
    vee = SMALL_VEE if small else VEE
    legs = "".join(capsule(a, b, r) for a, b in LEGS)
    middle = "".join(capsule(vee[i], vee[i + 1], r) for i in range(len(vee) - 1))
    return legs, middle


def mark(legs_color, middle_color, small=False, transform=""):
    legs, middle = mark_paths(small)
    t = f' transform="{transform}"' if transform else ""
    return f'<g{t}><path fill="{legs_color}" d="{legs}"/><path fill="{middle_color}" d="{middle}"/></g>'


def tile(size=256, radius=58, small=False):
    # Glyph fills 42% of the tile, nudged up 1.5% for optical centring.
    scale = size * 0.42 / 174
    offset = (size - 174 * scale) / 2
    lift = size * 0.015
    m = mark(PANEL_INK, ACCENT, small, f"translate({offset:.2f} {offset - lift:.2f}) scale({scale:.4f})")
    return f'<rect width="{size}" height="{size}" rx="{radius}" fill="{PANEL}"/>{m}'


def wordmark(text, cap_height, color, tracking=-0.01):
    font = TTFont(FONT)
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    upm = font["head"].unitsPerEm
    scale = cap_height / font["OS/2"].sCapHeight
    pen, x = SVGPathPen(glyphs), 0
    for ch in text:
        name = cmap[ord(ch)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, cap_height)))
        x += glyphs[name].width * scale + tracking * upm * scale
    width = x - tracking * upm * scale
    return f'<path fill="{color}" d="{pen.getCommands()}"/>', width


def svg(name, w, h, body, title="PMS Check"):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">'
        f"<title>{title}</title>{body}</svg>\n")


def horizontal(name, symbol_body, symbol_size, text_color, cap_ratio=0.36, gap_ratio=0.22):
    cap = symbol_size * cap_ratio
    text, tw = wordmark("PMS Check", cap, text_color)
    gap = symbol_size * gap_ratio
    ty = (symbol_size - cap) / 2
    body = symbol_body + f'<g transform="translate({symbol_size + gap:.2f} {ty:.2f})">{text}</g>'
    svg(name, symbol_size + gap + tw, symbol_size, body)


def stacked(name, symbol_body, symbol_size, text_color, cap_ratio=0.26):
    cap = symbol_size * cap_ratio
    text, tw = wordmark("PMS Check", cap, text_color)
    w = max(tw, symbol_size)
    gap = symbol_size * 0.2
    body = (f'<g transform="translate({(w - symbol_size) / 2:.2f} 0)">{symbol_body}</g>'
            f'<g transform="translate({(w - tw) / 2:.2f} {symbol_size + gap:.2f})">{text}</g>')
    svg(name, w, symbol_size + gap + cap, body)


def build():
    svg("pms-check-icon.svg", 256, 256, tile())
    svg("pms-check-icon-small.svg", 256, 256, tile(small=True))
    svg("pms-check-icon-square.svg", 1024, 1024, tile(1024, 0))

    svg("pms-check-symbol-dark-bg.svg", 174, 174, mark(PANEL_INK, ACCENT))
    svg("pms-check-symbol-black.svg", 174, 174, mark("#000000", "#000000"))
    svg("pms-check-symbol-white.svg", 174, 174, mark("#FFFFFF", "#FFFFFF"))

    horizontal("pms-check-horizontal.svg", tile(), 256, INK)
    horizontal("pms-check-horizontal-dark-bg.svg", mark(PANEL_INK, ACCENT, transform="scale(1.4713)"), 256, PANEL_INK, cap_ratio=0.6, gap_ratio=0.3)
    horizontal("pms-check-horizontal-black.svg", mark("#000000", "#000000", transform="scale(1.4713)"), 256, "#000000", cap_ratio=0.6, gap_ratio=0.3)
    horizontal("pms-check-horizontal-white.svg", mark("#FFFFFF", "#FFFFFF", transform="scale(1.4713)"), 256, "#FFFFFF", cap_ratio=0.6, gap_ratio=0.3)

    stacked("pms-check-stacked.svg", tile(), 256, INK)
    stacked("pms-check-stacked-dark-bg.svg", mark(PANEL_INK, ACCENT, transform="scale(1.4713)"), 256, PANEL_INK, cap_ratio=0.4)

    # Android adaptive layers: glyph sized to the 66% safe zone of a 1024 canvas.
    scale = 1024 * 0.28 / 174
    off = (1024 - 174 * scale) / 2
    t = f"translate({off:.2f} {off:.2f}) scale({scale:.4f})"
    svg("android-foreground.svg", 1024, 1024, mark(PANEL_INK, ACCENT, transform=t))
    svg("android-monochrome.svg", 1024, 1024, mark("#FFFFFF", "#FFFFFF", transform=t))
    svg("android-background.svg", 1024, 1024, f'<rect width="1024" height="1024" fill="{PANEL}"/>')


if __name__ == "__main__":
    build()
