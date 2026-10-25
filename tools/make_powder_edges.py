"""
Makes the mountain layers of the fauna chapter dissolve at their bottom edge
like powder or cloud: cloudy blotches with a fine grain, instead of a smooth
fade. (Their sides stay whole: the chapter chains mirrored copies side by
side, which meet without a seam.)

Reads  assets/images/m1.png, m2.png, m6.png, m7.png, m8.png
Writes assets/images/powder/<same name>

Run it again after replacing one of those images:
    python tools/make_powder_edges.py
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMAGES = os.path.join(HERE, '..', 'assets', 'images')
OUT = os.path.join(IMAGES, 'powder')
FILES = ['m1.png', 'm2.png', 'm6.png', 'm7.png', 'm8.png']

EDGE_SIDES = 0       # share of the width that dissolves at each side (0: none)
EDGE_BOTTOM = 0.16    # share of the height that dissolves at the bottom
CLOUD = 34            # px of the cloudy blotches


def smooth_noise(w, h, scale, rng):
    """Value noise: random values on a grid every `scale` px, smoothly interpolated."""
    gw, gh = int(w / scale) + 2, int(h / scale) + 2
    grid = rng.random_sample((gh, gw)).astype(np.float32)
    ys = np.arange(h, dtype=np.float32) / scale
    xs = np.arange(w, dtype=np.float32) / scale
    y0, x0 = ys.astype(int), xs.astype(int)
    fy, fx = ys - y0, xs - x0
    sy, sx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
    a = grid[y0][:, x0]
    b = grid[y0][:, x0 + 1]
    c = grid[y0 + 1][:, x0]
    d = grid[y0 + 1][:, x0 + 1]
    sx, sy = sx[None, :], sy[:, None]
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy


def powder(img, seed):
    rgba = np.array(img.convert('RGBA'), dtype=np.float32)
    h, w = rgba.shape[:2]
    rng = np.random.RandomState(seed)   # the same powder every time
    cloud = 0.6 * smooth_noise(w, h, CLOUD, rng) + 0.3 * smooth_noise(w, h, CLOUD / 3, rng)
    grain = rng.random_sample((h, w)).astype(np.float32)
    xs = np.arange(w, dtype=np.float32)
    ys = np.arange(h, dtype=np.float32)
    dy = (h - 1 - ys)[:, None] / (EDGE_BOTTOM * h)
    if EDGE_SIDES > 0:
        dx = np.minimum(xs, w - 1 - xs)[None, :] / (EDGE_SIDES * w)
        depth = np.minimum(dx, dy)   # 0 at an edge → 1 and more inside
    else:
        depth = np.broadcast_to(dy, (h, w)).copy()
    keep = np.clip((depth * 1.35 - 0.12 - (0.75 * cloud + 0.35 * grain) * 0.75) * 5, 0, 1)
    keep[depth >= 1] = 1
    rgba[..., 3] *= keep
    return Image.fromarray(rgba.astype(np.uint8), 'RGBA')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for i, name in enumerate(FILES):
        src = os.path.join(IMAGES, name)
        powder(Image.open(src), seed=i + 1).save(os.path.join(OUT, name), optimize=True)
        print('wrote', os.path.join('assets', 'images', 'powder', name))
