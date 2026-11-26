"""Leadsndeals 'Scan to book a demo' QR poster (same layout as the WAAU poster, in Leadsndeals colours)."""
import sys, pathlib
import segno
from PIL import Image, ImageDraw, ImageFont, ImageFilter

URL = "https://leadsndeals.com"
proj = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)

W, H = 1600, 2000
BLACK = (14, 14, 16)
GOLD_A, GOLD_B, GOLD_C = (201, 154, 0), (242, 194, 27), (255, 216, 77)
FB = "C:/Windows/Fonts/segoeuib.ttf"   # Segoe UI Bold
FR = "C:/Windows/Fonts/segoeui.ttf"

def lin_grad(size, c1, c2, horizontal=True):
    w, h = size
    g = Image.new("RGB", (w, h))
    px = g.load()
    for i in range(w if horizontal else h):
        t = i / max((w if horizontal else h) - 1, 1)
        c = tuple(round(c1[k] + (c2[k] - c1[k]) * t) for k in range(3))
        if horizontal:
            for y in range(h): px[i, y] = c
        else:
            for x in range(w): px[x, i] = c
    return g

def gold_grad(size):
    """3-stop gold gradient, diagonal."""
    w, h = size
    g = Image.new("RGB", (w, h))
    px = g.load()
    for y in range(h):
        for x in range(w):
            t = (x / w + y / h) / 2
            a, b = (GOLD_A, GOLD_B) if t < 0.5 else (GOLD_B, GOLD_C)
            u = t * 2 if t < 0.5 else (t - 0.5) * 2
            px[x, y] = tuple(round(a[k] + (b[k] - a[k]) * u) for k in range(3))
    return g

# ---------- background: near-black with a soft golden glow (top-left), like the WAAU green one ----------
bg = lin_grad((W, H), (18, 18, 20), (8, 8, 10), horizontal=False).convert("RGBA")
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse((-500, -600, 900, 700), fill=(242, 194, 27, 70))
glow = glow.filter(ImageFilter.GaussianBlur(220))
bg.alpha_composite(glow)
draw = ImageDraw.Draw(bg)

# ---------- logo ----------
logo = Image.open(proj / "public/brand/logo.png").convert("RGBA")
lw = 760
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
bg.alpha_composite(logo, ((W - lw) // 2, 150))

# ---------- title: "Scan to " white + "book a demo" gold gradient ----------
f_title = ImageFont.truetype(FB, 116)
a, b = "Scan to ", "book a demo"
wa, wb = draw.textlength(a, font=f_title), draw.textlength(b, font=f_title)
x0 = (W - (wa + wb)) / 2
ty = 430
draw.text((x0, ty), a, font=f_title, fill=(244, 243, 238))
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).text((x0 + wa, ty), b, font=f_title, fill=255)
gold = lin_grad((W, H), GOLD_B, GOLD_C).convert("RGBA")
bg.paste(gold, (0, 0), mask)

# ---------- QR on a white rounded card ----------
qr = segno.make(URL, error="h", boost_error=False)
matrix = [list(r) for r in qr.matrix]
n = len(matrix)
card = 1100
cx0, cy0 = (W - card) // 2, 620
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle((cx0, cy0 + 30, cx0 + card, cy0 + card + 30), 80, fill=(0, 0, 0, 160))
bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(40)))
ImageDraw.Draw(bg).rounded_rectangle((cx0, cy0, cx0 + card, cy0 + card), 80, fill=(255, 255, 255))

pad = 100
mod = (card - 2 * pad) / n
qx, qy = cx0 + pad, cy0 + pad
qsize = round(mod * n)

# modules layer (dark), finder patterns drawn separately with a gold gradient
modl = Image.new("L", (qsize, qsize), 0)
md = ImageDraw.Draw(modl)
finder = lambda r, c: (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)
# clear area in the middle for the logo
logo_frac = 0.24
lo, hi = n * (0.5 - logo_frac / 2) - 0.5, n * (0.5 + logo_frac / 2) + 0.5
for r in range(n):
    for c in range(n):
        if not matrix[r][c] or finder(r, c):
            continue
        if lo <= r <= hi and lo <= c <= hi:
            continue
        x, y = c * mod, r * mod
        g = mod * 0.08
        md.rounded_rectangle((x + g, y + g, x + mod - g, y + mod - g), radius=mod * 0.28, fill=255)
dark = lin_grad((qsize, qsize), (16, 16, 18), (58, 48, 12)).convert("RGBA")  # near-black → deep gold-brown
bg.paste(dark, (qx, qy), modl)

# rounded finder patterns: gold gradient ring + dark centre
fin = Image.new("L", (qsize, qsize), 0)
fd = ImageDraw.Draw(fin)
cen = Image.new("L", (qsize, qsize), 0)
cd = ImageDraw.Draw(cen)
for (r0, c0) in [(0, 0), (0, n - 7), (n - 7, 0)]:
    x, y = c0 * mod, r0 * mod
    s = 7 * mod
    fd.rounded_rectangle((x, y, x + s, y + s), radius=mod * 2.2, fill=255)
    fd.rounded_rectangle((x + mod, y + mod, x + s - mod, y + s - mod), radius=mod * 1.4, fill=0)
    cd.rounded_rectangle((x + 2 * mod, y + 2 * mod, x + 5 * mod, y + 5 * mod), radius=mod * 0.9, fill=255)
bg.paste(dark, (qx, qy), fin)  # dark corners: scanners need strong contrast here
bg.paste(dark, (qx, qy), cen)

# centre logo: the yellow N badge on a white rounded plate
badge = Image.open(proj / "src/app/icon.png").convert("RGBA")
bs = round(qsize * 0.20)
badge = badge.resize((bs, bs), Image.LANCZOS)
plate = bs + round(mod * 1.4)
px0 = qx + (qsize - plate) // 2
py0 = qy + (qsize - plate) // 2
ImageDraw.Draw(bg).rounded_rectangle((px0, py0, px0 + plate, py0 + plate), radius=plate * 0.24, fill=(255, 255, 255))
bg.alpha_composite(badge, (qx + (qsize - bs) // 2, qy + (qsize - bs) // 2))

# ---------- footer ----------
f_foot = ImageFont.truetype(FR, 44)
foot = "WhatsApp · SMS · Voice calls · Websites & apps · leadsndeals.com"
fw = draw.textlength(foot, font=f_foot)
ImageDraw.Draw(bg).text(((W - fw) / 2, 1830), foot, font=f_foot, fill=(190, 189, 182))

bg.convert("RGB").save(out / "leadsndeals-book-demo-poster.png", optimize=True)

# ---------- standalone QR (card only) and a plain SVG ----------
bg.crop((cx0, cy0, cx0 + card, cy0 + card)).convert("RGB").save(out / "leadsndeals-book-demo-qr.png", optimize=True)
qr.save(str(out / "leadsndeals-book-demo-qr.svg"), scale=10, border=4, dark="#111111")
print("modules", n, "version", qr.version, "error", qr.error)
