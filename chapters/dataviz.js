document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('question').classList.add('visible'), QUESTION_AT * 1000);
  createChapterSketch(spamSketch);
});

/*
  The question appears, then news articles start popping up like spam: slowly
  at first, then faster and faster, mostly right next to earlier ones, like a
  virus spreading, until they bury the whole screen.
*/

const NEWS_COUNT = 12;           // news1.PNG … news12.PNG
const TEXTURE_MAX = 800;         // images are downscaled to this for drawing

const QUESTION_AT = 1;           // seconds before the question fades in
const SPREAD_START = 2;          // seconds before the first article appears
const FIRST_INTERVAL = 0.9;      // seconds between the first articles
const ACCELERATION = 0.9;        // each new article comes this much sooner than the last
const MIN_INTERVAL = 0.05;
const MAX_NEWS = 260;            // the screen is buried well before this

const NEWS_SIZE = [0.16, 0.3];   // longest side, as a fraction of the screen's longest side
const NEAR_PARENT = 0.75;        // share of articles that appear next to an earlier one
const SPEED = [0.3, 4];          // px per frame when an article starts sliding in
const FRICTION = [0.95, 0.985];  // how quickly it slows down (higher = longer glide)
const FADE_IN = 0.35;            // seconds to pop in

function spamSketch(p) {
  const raw = [];
  let textures = [];
  const all = [];          // every article, for redrawing after a resize
  let moving = [];         // articles still sliding
  let settled;             // offscreen layer with the articles that stopped, drawn once
  let interval = FIRST_INTERVAL;
  let nextAt = SPREAD_START;

  p.preload = () => {
    for (let i = 1; i <= NEWS_COUNT; i++) raw.push(p.loadImage(`../assets/images/news${i}.PNG`));
  };

  function shrink(img, maxSide) {
    const copy = img.get();
    if (Math.max(copy.width, copy.height) > maxSide) {
      if (copy.width > copy.height) copy.resize(maxSide, 0);
      else copy.resize(0, maxSide);
    }
    return copy;
  }

  function makeSettledLayer() {
    if (settled) settled.remove();
    settled = p.createGraphics(p.width, p.height);
    settled.imageMode(p.CENTER);
    for (const n of all) if (!moving.includes(n)) drawNews(settled, n, 1);
  }

  p.setup = () => {
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.imageMode(p.CENTER);
    textures = raw.map((img) => shrink(img, TEXTURE_MAX));
    makeSettledLayer();
  };

  function spawn(t) {
    const img = p.random(textures);
    const long = Math.max(p.width, p.height) * p.random(NEWS_SIZE[0], NEWS_SIZE[1]);
    const scale = long / Math.max(img.width, img.height);
    const w = img.width * scale, h = img.height * scale;

    // most appear right next to an earlier one, like an infection spreading
    let x, y;
    if (all.length > 2 && p.random() < NEAR_PARENT) {
      const parent = p.random(all);
      x = parent.x + p.random(-0.6, 0.6) * parent.w;
      y = parent.y + p.random(-0.6, 0.6) * parent.h;
    } else {
      x = p.random(p.width);
      y = p.random(p.height);
    }

    // it slides into (x, y) at its own speed: start back along its direction
    // by the distance a damped slide covers
    const dir = p5.Vector.random2D();
    const speed = p.random(SPEED[0], SPEED[1]);
    const friction = p.random(FRICTION[0], FRICTION[1]);
    const dist = speed / (1 - friction);
    const n = {
      img, w, h,
      x: x - dir.x * dist,
      y: y - dir.y * dist,
      vx: dir.x * speed,
      vy: dir.y * speed,
      friction,
      angle: p.random(-0.05, 0.05),
      born: t,
    };
    all.push(n);
    moving.push(n);
  }

  function drawNews(g, n, alpha) {
    const k = 0.92 + 0.08 * alpha;   // pops up slightly as it appears
    const ctx = g.drawingContext;
    g.push();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    g.translate(n.x, n.y);
    g.rotate(n.angle);
    g.image(n.img, 0, 0, n.w * k, n.h * k);
    g.pop();
  }

  p.draw = () => {
    const t = p.millis() / 1000;

    while (t >= nextAt && all.length < MAX_NEWS) {
      spawn(t);
      interval = Math.max(MIN_INTERVAL, interval * ACCELERATION);
      nextAt += interval;
    }

    p.clear();
    p.drawingContext.drawImage(settled.elt, 0, 0, p.width, p.height);

    // once an article has stopped it goes onto the settled layer for good, but
    // only in the order they appeared, so nothing jumps behind a newer article
    let olderStillMoving = false;
    moving = moving.filter((n) => {
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= n.friction;
      n.vy *= n.friction;
      const alpha = Math.min(1, (t - n.born) / FADE_IN);
      const stopped = alpha >= 1 && Math.hypot(n.vx, n.vy) < 0.03;
      if (!stopped) olderStillMoving = true;
      if (stopped && !olderStillMoving) {
        drawNews(settled, n, 1);
        return false;
      }
      drawNews(p, n, alpha);
      return true;
    });
  };

  p.windowResized = () => {
    const sx = p.windowWidth / p.width, sy = p.windowHeight / p.height;
    for (const n of all) { n.x *= sx; n.y *= sy; }
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    makeSettledLayer();
  };
}
