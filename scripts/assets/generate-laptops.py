import math
import random
import sys

from PIL import Image, ImageDraw, ImageFilter

# ── Decorative laptop mockups for the Cinematic project carousel ──
# Abstract dashboards only: no text, logos or project data.
OUT = sys.argv[1]
W, H = 1920, 1200
HUES = [
    ((32, 229, 210), (101, 245, 255)),
    ((90, 150, 255), (140, 200, 255)),
    ((167, 120, 250), (230, 150, 255)),
    ((255, 170, 90), (255, 214, 140)),
]


def rgba(color, alpha):
    return (*color, alpha)


def rounded(draw, box, radius, **kw):
    draw.rounded_rectangle(box, radius=radius, **kw)


def lines(draw, x, y, widths, color, height=10, gap=18):
    for i, width in enumerate(widths):
        rounded(draw, (x, y + i * gap, x + width, y + i * gap + height), height // 2, fill=color)


def dashboard(size, accent, accent2, seed):
    rnd = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, (9, 15, 26, 255))
    d = ImageDraw.Draw(img, "RGBA")
    # Sidebar and top bar.
    d.rectangle((0, 0, int(w * 0.15), h), fill=(13, 22, 36, 255))
    rounded(d, (24, 26, 70, 72), 12, fill=rgba(accent, 255))
    for i in range(7):
        y = 120 + i * 58
        rounded(d, (24, y, 52, y + 28), 8, fill=rgba(accent if i == 1 else (60, 80, 100), 200))
        rounded(d, (64, y + 8, 64 + rnd.randint(60, 120), y + 20), 6, fill=(70, 90, 110, 160))
    left = int(w * 0.15) + 30
    rounded(d, (left, 28, left + 260, 46), 9, fill=(200, 215, 230, 200))
    rounded(d, (w - 300, 22, w - 40, 58), 18, fill=(20, 32, 50, 255), outline=(40, 60, 80, 255))
    # KPI cards.
    card_w = (w - left - 40 - 3 * 24) / 4
    for i in range(4):
        x = left + i * (card_w + 24)
        rounded(d, (x, 90, x + card_w, 210), 16, fill=(15, 26, 42, 255), outline=(32, 50, 70, 255))
        rounded(d, (x + 22, 112, x + 22 + card_w * 0.45, 124), 6, fill=(110, 130, 150, 180))
        rounded(d, (x + 22, 140, x + 22 + card_w * 0.6, 170), 8, fill=(230, 240, 248, 235))
        rounded(d, (x + 22, 184, x + 22 + card_w * 0.3, 194), 5, fill=rgba(accent if i % 2 == 0 else accent2, 230))
    # Line chart panel.
    px0, py0, px1, py1 = left, 236, left + (w - left - 40) * 0.62, h - 230
    rounded(d, (px0, py0, px1, py1), 18, fill=(15, 26, 42, 255), outline=(32, 50, 70, 255))
    for gy in range(5):
        y = py0 + 60 + gy * (py1 - py0 - 90) / 4
        d.line((px0 + 30, y, px1 - 30, y), fill=(40, 58, 78, 255), width=2)
    points = []
    steps = 14
    value = 0.4
    for i in range(steps + 1):
        value = min(0.92, max(0.12, value + rnd.uniform(-0.18, 0.22)))
        x = px0 + 40 + i * (px1 - px0 - 80) / steps
        y = py1 - 40 - value * (py1 - py0 - 110)
        points.append((x, y))
    fill = [(points[0][0], py1 - 40)] + points + [(points[-1][0], py1 - 40)]
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(fill, fill=rgba(accent, 70))
    img.alpha_composite(layer)
    d = ImageDraw.Draw(img, "RGBA")
    d.line(points, fill=rgba(accent2, 255), width=6, joint="curve")
    for x, y in points[::3]:
        d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=(255, 255, 255, 255))
    lines(d, px0 + 30, py0 + 22, [220], (200, 215, 230, 200), 14)
    # Donut panel.
    dx0, dx1 = px1 + 24, w - 40
    rounded(d, (dx0, py0, dx1, py0 + (py1 - py0) * 0.58), 18, fill=(15, 26, 42, 255), outline=(32, 50, 70, 255))
    cx, cy = (dx0 + dx1) / 2, py0 + (py1 - py0) * 0.32
    r = min(dx1 - dx0, (py1 - py0) * 0.5) * 0.3
    start = -90
    for share, color in ((0.46, accent), (0.3, accent2), (0.24, (60, 80, 110))):
        end = start + share * 360
        d.arc((cx - r, cy - r, cx + r, cy + r), start, end, fill=rgba(color, 255), width=int(r * 0.32))
        start = end
    # Bars panel.
    by0 = py0 + (py1 - py0) * 0.58 + 24
    rounded(d, (dx0, by0, dx1, py1), 18, fill=(15, 26, 42, 255), outline=(32, 50, 70, 255))
    bars = 8
    bw = (dx1 - dx0 - 60) / bars
    for i in range(bars):
        bh = rnd.uniform(0.25, 0.9) * (py1 - by0 - 50)
        x = dx0 + 30 + i * bw
        rounded(d, (x + 6, py1 - 24 - bh, x + bw - 6, py1 - 24), 6, fill=rgba(accent if i % 3 else accent2, 220))
    # Table rows.
    ty = h - 200
    rounded(d, (left, ty, w - 40, h - 30), 18, fill=(15, 26, 42, 255), outline=(32, 50, 70, 255))
    for i in range(4):
        y = ty + 30 + i * 36
        d.ellipse((left + 26, y, left + 46, y + 20), fill=rgba(accent2 if i % 2 else accent, 230))
        lines(d, left + 64, y + 5, [rnd.randint(160, 260)], (170, 185, 200, 170))
        lines(d, left + 420, y + 5, [rnd.randint(80, 180)], (110, 130, 150, 150))
        rounded(d, (w - 210, y + 2, w - 90, y + 18), 8, fill=rgba(accent, 120))
    return img


def laptop(index):
    accent, accent2 = HUES[index]
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas, "RGBA")
    # Screen lid.
    lid = (250, 60, W - 250, 960)
    rounded(d, lid, 40, fill=(18, 22, 28, 255), outline=(70, 80, 92, 255), width=4)
    inner = (lid[0] + 34, lid[1] + 34, lid[2] - 34, lid[3] - 40)
    screen = dashboard((inner[2] - inner[0], inner[3] - inner[1]), accent, accent2, seed=index * 7 + 3)
    canvas.alpha_composite(screen, (inner[0], inner[1]))
    d = ImageDraw.Draw(canvas, "RGBA")
    d.ellipse((W / 2 - 6, lid[1] + 12, W / 2 + 6, lid[1] + 24), fill=(40, 46, 54, 255))
    # Glass glare across the screen.
    glare = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glare).polygon(
        [(inner[0], inner[1]), (inner[0] + 520, inner[1]), (inner[0] + 120, inner[3]), (inner[0], inner[3])],
        fill=(255, 255, 255, 18),
    )
    canvas.alpha_composite(glare)
    # Base deck in perspective.
    d = ImageDraw.Draw(canvas, "RGBA")
    d.polygon([(150, 990), (W - 150, 990), (W - 40, 1090), (40, 1090)], fill=(120, 130, 142, 255))
    d.polygon([(150, 960), (W - 150, 960), (W - 150, 990), (150, 990)], fill=(70, 78, 88, 255))
    d.polygon([(40, 1090), (W - 40, 1090), (W - 60, 1112), (60, 1112)], fill=(55, 62, 72, 255))
    rounded(d, (W / 2 - 160, 1000, W / 2 + 160, 1040), 14, fill=(100, 110, 122, 255))
    # Accent glow under the laptop.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((200, 1060, W - 200, 1180), fill=rgba(accent, 90))
    canvas = Image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(40)), canvas)
    out = canvas.resize((960, 600), Image.LANCZOS)
    out.save(f"{OUT}/laptop-{index}.webp", quality=84, method=6)
    print(f"laptop-{index}.webp", out.size)


if __name__ == "__main__":
    for i in range(len(HUES)):
        laptop(i)
