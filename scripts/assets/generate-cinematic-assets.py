import sys
import numpy as np
from PIL import Image, ImageFilter

OUT = sys.argv[1]
rng = np.random.default_rng(7)

# ── Noise ──
PERM = rng.permutation(4096)
VAL = rng.random(4096).astype(np.float32)


def hash3(x, y, z):
    return VAL[PERM[(PERM[(PERM[x & 4095] + y) & 4095] + z) & 4095]]


def vnoise3(x, y, z):
    xi, yi, zi = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64), np.floor(z).astype(np.int64)
    xf, yf, zf = x - xi, y - yi, z - zi
    u, v, w = [t * t * (3 - 2 * t) for t in (xf, yf, zf)]
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                weight = (u if dx else 1 - u) * (v if dy else 1 - v) * (w if dz else 1 - w)
                out = out + weight * hash3(xi + dx, yi + dy, zi + dz)
    return out


def fbm3(x, y, z, octaves=6, lac=2.0, gain=0.5):
    total, amp, freq, norm = 0, 1.0, 1.0, 0
    for i in range(octaves):
        total = total + amp * vnoise3(x * freq + i * 17.3, y * freq + i * 9.1, z * freq + i * 3.7)
        norm += amp
        amp *= gain
        freq *= lac
    return total / norm


def fbm1(x, octaves=6, seed=0):
    zeros = np.zeros_like(x)
    return fbm3(x, zeros + seed * 13.1, zeros + seed * 7.7, octaves)


def save(arr, name, quality=82):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    img.save(f"{OUT}/{name}", quality=quality, method=6)
    print(name, img.size)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ── Night earth (equirectangular) ──
def earth(w=2048, h=1024):
    lon = (np.arange(w) / w) * 2 * np.pi
    lat = (0.5 - (np.arange(h) + 0.5) / h) * np.pi
    lon, lat = np.meshgrid(lon, lat)
    x, y, z = np.cos(lat) * np.cos(lon), np.sin(lat), np.cos(lat) * np.sin(lon)
    n = fbm3(x * 1.8 + 5, y * 1.8 + 5, z * 1.8 + 5, 7)
    land = smoothstep(0.5, 0.53, n)
    coast = smoothstep(0.47, 0.5, n) * (1 - smoothstep(0.52, 0.56, n))
    detail = fbm3(x * 9, y * 9, z * 9, 4)
    ocean = np.stack([2 + 3 * detail, 10 + 10 * detail, 18 + 14 * detail], -1)
    ground = np.stack([6 + 10 * detail, 26 + 22 * detail, 34 + 24 * detail], -1)
    img = ocean * (1 - land[..., None]) + ground * land[..., None]
    img += coast[..., None] * np.array([10, 70, 75])
    # City lights: dense clusters on land.
    cities = fbm3(x * 22, y * 22, z * 22, 3)
    lights = land * smoothstep(0.64, 0.8, cities) * (np.abs(lat) < 1.2) * (rng.random((h, w)) > 0.55)
    sparkle = (rng.random((h, w)) > 0.996) * land * 0.9
    glow = np.clip(lights * 1.1 + sparkle, 0, 1.2)
    img += glow[..., None] * np.array([90, 230, 225])
    save(img, "earth-night.jpg", 80)


# ── Warm planet (About) ──
def planet(size=1200):
    s = np.linspace(-1, 1, size)
    X, Y = np.meshgrid(s, -s)
    r = np.sqrt(X**2 + Y**2)
    R = 0.86
    inside = r < R
    Z = np.sqrt(np.clip(R**2 - X**2 - Y**2, 0, None)) / R
    nx, ny = X / R, Y / R
    tex = fbm3(nx * 3 + 2, ny * 3 + 2, Z * 3 + 2, 7)
    bands = fbm3(nx * 1.2, ny * 6, Z * 1.2, 5)
    light = np.array([-0.55, 0.55, 0.62])
    light /= np.linalg.norm(light)
    lam = np.clip(nx * light[0] + ny * light[1] + Z * light[2], 0, 1)
    base = np.stack([150 + 90 * tex, 92 + 60 * tex, 52 + 40 * bands], -1)
    shade = (lam**1.3)[..., None] * 1.1
    img = base * shade
    rim = smoothstep(R * 0.9, R, r) * inside * (0.3 + lam)
    img += rim[..., None] * np.array([255, 170, 100]) * 0.8
    alpha = inside * 255.0
    # Atmosphere halo outside the disc.
    halo = np.clip(1 - (r - R) / 0.12, 0, 1) * (r >= R)
    lit_side = np.clip((X * -1 + Y) * 0.7 + 0.5, 0.15, 1)
    img = img * inside[..., None] + (halo * lit_side)[..., None] * np.array([255, 160, 90])
    alpha = np.maximum(alpha, halo**2 * lit_side * 200)
    save(np.dstack([img, alpha]), "planet-warm.webp", 84)


# ── Mountain range ──
def mountains(w=2560, h=760, name="terrain.webp", layers=4, glow_left=True):
    xs = np.linspace(0, 8, w)
    img = np.zeros((h, w, 3))
    alpha = np.zeros((h, w))
    rows = np.arange(h)[:, None]
    for li in range(layers):
        depth = li / (layers - 1)
        ridge = fbm1(xs * (0.55 + li * 0.3) + li * 11, 6, seed=li)
        ridge = np.abs(ridge - 0.5) * 2
        ridge = 1 - ridge
        top = h * (0.2 + 0.22 * depth) + (1 - ridge) * h * (0.42 - 0.12 * depth)
        top = top[None, :]
        mask = rows >= top
        rock = fbm3(np.arange(w)[None, :] / h * 14 + li * 5, rows / h * 14, np.zeros((h, 1)) + li, 5)
        dist = rows - top
        shade = np.clip(1 - dist / (h * 0.5), 0, 1)
        col = np.array([6, 14, 22]) * (1 - depth) + np.array([3, 6, 10]) * depth
        layer = col + (rock[..., None] ** 2) * np.array([30, 44, 52]) * (1 - depth * 0.5)
        layer = layer + (shade**10)[..., None] * np.array([6, 22, 26]) * (1 - depth * 0.5)
        rim = np.exp(-np.clip(dist, 0, None) / 2.5) * mask
        layer = layer + rim[..., None] * np.array([50, 180, 190]) * (0.55 - depth * 0.35)
        img = np.where(mask[..., None], layer, img)
        alpha = np.where(mask, 255, alpha)
        # Fog between layers.
        fog = np.exp(-np.clip(dist, 0, None) / (h * 0.03)) * mask * 0.12 * (1 - depth)
        img = img + fog[..., None] * np.array([20, 60, 70])
    # Scattered warm lights in the valleys.
    lights = (rng.random((h, w)) > 0.99993) * (rows > h * 0.6) * (alpha > 0)
    lm = Image.fromarray((np.clip(lights, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    lm = np.asarray(lm, dtype=float)[..., None] / 255 * 9
    img = img + np.clip(lm, 0, 1) * np.array([255, 150, 70])
    if glow_left:
        X = np.arange(w)[None, :]
        g = np.exp(-(((X - w * 0.12) / (w * 0.05)) ** 2 + ((rows - h * 0.6) / (h * 0.12)) ** 2))
        img = img + g[..., None] * np.array([120, 60, 20]) * (alpha[..., None] > 0)
    save(np.dstack([img, alpha]), name, 82)


# ── Planet horizon (hero base) ──
def horizon(w=2560, h=520):
    X = np.linspace(-1, 1, w)[None, :]
    rows = np.arange(h)[:, None]
    edge = h * 0.32 + (X**2) * h * 0.55
    mask = rows >= edge
    dist = rows - edge
    rock = fbm3(np.linspace(0, 60, w)[None, :], rows / h * 14, np.zeros((h, 1)), 6)
    img = np.array([5, 10, 16]) + rock[..., None] * np.array([26, 34, 40])
    img = img * np.clip(1 - dist / h, 0.25, 1)[..., None]
    rim = np.exp(-np.clip(dist, 0, None) / 3) * mask
    img = img + rim[..., None] * np.array([90, 230, 240])
    above = np.exp(-np.clip(-dist, 0, None) / 28) * (~mask)
    glow = np.exp(-(((X + 0.62) / 0.12) ** 2)) * np.exp(-np.abs(dist) / 60)
    img = img * mask[..., None] + glow[..., None] * np.array([255, 150, 70]) * 1.4
    img = img + above[..., None] * np.array([30, 140, 150]) * 0.7
    alpha = np.clip(mask * 255 + above * 160 + glow * 255, 0, 255)
    save(np.dstack([img, alpha]), "horizon.webp", 82)


# ── Space backdrop ──
def space(w=1920, h=1200):
    ys, xs = np.mgrid[0:h, 0:w] / max(w, h)
    neb = fbm3(xs * 3, ys * 3, np.zeros_like(xs) + 1.5, 6)
    neb2 = fbm3(xs * 6 + 4, ys * 6, np.zeros_like(xs) + 3, 5)
    img = np.array([4, 7, 12]) + np.stack([neb * 0, neb * 22, neb * 28], -1) * smoothstep(0.45, 0.8, neb)[..., None] * 1.6
    img += np.stack([neb2 * 0, neb2 * 10, neb2 * 16], -1)
    stars = rng.random((h, w))
    img += ((stars > 0.9990) * 200 + (stars > 0.996) * 50)[..., None]
    save(img, "space.jpg", 78)


if __name__ == "__main__":
    which = sys.argv[2:] or ["earth", "planet", "mountains", "horizon", "space"]
    if "earth" in which:
        earth()
    if "planet" in which:
        planet()
    if "mountains" in which:
        mountains()
    if "horizon" in which:
        horizon()
    if "space" in which:
        space()
