/*
  The far mountains, m1, fill the screen; in front of them two hands hold the
  lithium, their lower half hidden at first behind the near mountains, m7 and,
  in front of it, m6, which fills the lower half of the screen. Three flocks
  of flamingos cross between them in the whole chapter, either way. The near
  mountains slowly slide away, m6 to the left and down, m7 to the right and
  down, until they have gone and the hands are in view. A click on the
  lithium fades the relief of the orology chapter in over everything, and
  that chapter opens on it.

  fauna.html?embed         only the first frame, shown inside microbi
  fauna.html?from=microbi  no fade-in, continuing from that frame
*/

// The near mountains, in front of everything, back to front. At the start
// each one's ridge stands `ridge` screen heights down (m6 half way, leaving
// the upper half alone, m7 a little higher just behind it); then each slides
// away to its side (`side` screen widths) and down until its ridge has gone
// below the screen. Each is a chain of copies, every other one mirrored, so
// it spans any screen without being magnified, and its foot dissolves like
// powder (assets/images/powder/, made by tools/make_powder_edges.py).
const NEAR = [
  { file: 'm7.png', aspect: 1600 / 720, top: 0.436, ridge: 0.42, side: 0.35 },    // to the right
  { file: 'm6.png', aspect: 2400 / 1350, top: 0.233, ridge: 0.5, side: -0.35 },   // to the left
];   // top: the share of the image above its ridge, which is transparent
const NEAR_WAIT = 1.5;           // seconds before they start to move
const NEAR_TIME = 22;            // seconds they take to slide away
const NEAR_POWDER = 0.16;        // share of their height that dissolves at the foot (as in the tool)

// The hands with the lithium, standing on the bottom of the screen
const HANDS_WIDTH = [0.85, 1.2]; // screen heights, at most this many screen widths

// Flamingos: three flocks in the whole chapter
const FLOCK_FILE = '../assets/images/flamingo_side.gif';
const FLOCK_AT = [[0.8, 2], [7, 10], [15, 19]];   // seconds at which each sets off
const FLOCK_WIDTH = [0.4, 1.0];  // gif width, in screen widths; the flock fills about half of it
const FLOCK_TOP = [-0.15, 0.3];  // top of the gif, in screen heights
const FLOCK_TIME = [14, 26];     // seconds a crossing takes

// After a click on the lithium, the orology chapter's relief fades in over
// everything (#relief in fauna.css), and that chapter opens on it
const FADE_TIME = 2;             // seconds, as in fauna.css
const NEXT_SCENE = 'orology.html?from=fauna';
const NEXT_IMAGES = ['../assets/images/oro_si.PNG', '../assets/images/oro.gif'];   // loaded before we move on

const params = new URLSearchParams(location.search);
const embedded = params.has('embed');
if (embedded) document.body.classList.add('embed');
if (params.has('from')) document.body.classList.add('seamless');

const between = (range) => range[0] + Math.random() * (range[1] - range[0]);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (t) => t * t * (3 - 2 * t);

const near = document.getElementById('near');
const nearCtx = near.getContext('2d');
for (const layer of NEAR) {
  layer.img = new Image();
  layer.img.onload = () => placeNear();
  layer.img.src = '../assets/images/powder/' + layer.file;
}
const offering = document.getElementById('offering');
const litio = document.getElementById('litio');
const flockLayer = document.getElementById('flocks');
const groundStrip = document.getElementById('ground-strip');
const behindNear = [document.getElementById('m1'), offering, flockLayer];

let W = 0, H = 0, dpr = 1;
let slide = 0;   // 0 → 1: how far the near mountains have slid away

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  near.width = Math.round(W * dpr);
  near.height = Math.round(H * dpr);
  offering.style.width = Math.min(HANDS_WIDTH[0] * H, HANDS_WIDTH[1] * W) + 'px';
  placeNear();
}

// Each just tall enough that its ridge stands where it should with its foot
// on the bottom of the screen. Below the highest line where a foot starts
// dissolving, only the rock ground is behind them.
function placeNear() {
  nearCtx.setTransform(1, 0, 0, 1, 0, 0);
  nearCtx.clearRect(0, 0, near.width, near.height);
  const k = ease(slide);
  let line = H;
  for (const layer of NEAR) {
    const img = layer.img;
    if (!img.complete || !img.naturalWidth) continue;
    const h = (1 - layer.ridge) * H / (1 - layer.top);
    const w = h * layer.aspect;
    const x0 = (W - w) / 2 + layer.side * W * k;
    const top = H - h + (1 - layer.top) * h * 1.05 * k;
    if (top >= H) continue;
    line = Math.min(line, top + h * (1 - NEAR_POWDER));
    nearCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = Math.floor(-x0 / w); x0 + i * w < W; i++) {
      const x = x0 + i * w;
      if (i % 2) {
        nearCtx.save();
        nearCtx.translate(x + w, top);
        nearCtx.scale(-1, 1);
        nearCtx.drawImage(img, 0, 0, w, h);
        nearCtx.restore();
      } else {
        nearCtx.drawImage(img, x, top, w, h);
      }
    }
  }
  for (const el of behindNear) el.style.clipPath = `inset(0 0 ${(H - line).toFixed(1)}px 0)`;
  groundStrip.style.clipPath = `inset(${line.toFixed(1)}px 0 0 0)`;
}

// ----- flamingos -----

const flocks = [];
const flockTimes = FLOCK_AT.map(between);   // still to set off

function addFlock(now) {
  const img = new Image();
  img.src = FLOCK_FILE;
  img.alt = '';
  const w = W * between(FLOCK_WIDTH);
  img.style.width = w + 'px';
  flockLayer.appendChild(img);
  const f = {
    img, w,
    dir: Math.random() < 0.5 ? 1 : -1,   // left to right, or mirrored, right to left
    y: H * between(FLOCK_TOP),
    start: now,
    time: between(FLOCK_TIME) * 1000,
  };
  flocks.push(f);
  moveFlock(f, now);
}

function moveFlock(f, now) {
  const k = (now - f.start) / f.time;
  const x = f.dir > 0 ? -f.w + k * (W + f.w) : W - k * (W + f.w);
  // (mirrored about its own centre, so it stays where it is placed)
  f.img.style.transform = `translate(${x}px, ${f.y}px)${f.dir > 0 ? '' : ' scaleX(-1)'}`;
  return k < 1;
}

function moveFlocks(now) {
  for (let i = flocks.length - 1; i >= 0; i--) {
    if (!moveFlock(flocks[i], now)) { flocks[i].img.remove(); flocks.splice(i, 1); }
  }
}

// ----- the end: the orology relief fades in over everything -----

let leaving = false;

function loadImage(src) {
  return new Promise((done) => {
    const img = new Image();
    img.onload = img.onerror = done;
    img.src = src;
  });
}

function finale() {
  if (leaving) return;
  leaving = true;
  document.body.style.cursor = '';
  Promise.all(NEXT_IMAGES.map(loadImage)).then(() => {
    const relief = document.createElement('div');
    relief.id = 'relief';
    document.body.appendChild(relief);
    relief.getBoundingClientRect();   // so the fade starts from transparent
    relief.classList.add('shown');
    setTimeout(() => { location.href = NEXT_SCENE; }, FADE_TIME * 1000);
  });
}

// ----- pointer: the lithium, once m6 has moved away from it -----

function onLitio(x, y) {
  if (slide < 0.5) return false;
  const r = litio.getBoundingClientRect();
  // the stone's visible shape fills roughly the middle of its picture
  const cx = r.left + r.width * 0.46, cy = r.top + r.height * 0.5;
  return ((x - cx) / (r.width * 0.4)) ** 2 + ((y - cy) / (r.height * 0.36)) ** 2 < 1;
}

function trackPointer() {
  window.addEventListener('pointermove', (e) => {
    if (leaving || document.body.classList.contains('menu-open')) return;
    document.body.style.cursor = onLitio(e.clientX, e.clientY) ? 'pointer' : '';
  });
  window.addEventListener('pointerup', (e) => {
    if (leaving || e.target.closest('button, nav')) return;
    if (onLitio(e.clientX, e.clientY)) finale();
  });
}

// ----- main loop -----

resize();
window.addEventListener('resize', resize);

if (!embedded) {
  trackPointer();
  let start = null;
  const frame = (now) => {
    if (start === null) start = now;   // the clock starts with the first frame shown
    const t = (now - start) / 1000;
    slide = clamp01((t - NEAR_WAIT) / NEAR_TIME);
    placeNear();
    while (flockTimes.length && t >= flockTimes[0] && !leaving) { flockTimes.shift(); addFlock(now); }
    moveFlocks(now);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
