document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => question.classList.add('visible'), QUESTION_AT * 1000);
  createChapterSketch(spamSketch);
});

/*
  The question appears, then news articles start popping up like spam: slowly
  at first, then faster and faster, mostly right next to earlier ones, like a
  virus spreading, until they bury the whole screen. Then the question goes;
  a few seconds later the news fly away to the sides, the newest first, and
  leave the screen to the lithium salt timelapse (timelapse.js).
*/

const NEWS_COUNT = 12;           // news1.PNG … news12.PNG
const TEXTURE_MAX = 800;         // images are downscaled to this for drawing

const QUESTION_AT = 1;           // seconds before the question fades in
const SPREAD_START = 2;          // seconds before the first article appears
const FIRST_INTERVAL = 0.9;      // seconds between the first articles
const ACCELERATION = 0.9;        // each new article comes this much sooner than the last
const MIN_INTERVAL = 0.05;
const MAX_NEWS = 400;            // the screen is buried well before this

const NEWS_SIZE = [0.16, 0.3];   // longest side, as a fraction of the screen's longest side
const NEAR_PARENT = 0.75;        // share of articles that appear next to an earlier one
const SPEED = [0.3, 4];          // px per frame when an article starts sliding in
const FRICTION = [0.95, 0.985];  // how quickly it slows down (higher = longer glide)
const FADE_IN = 0.35;            // seconds to pop in

// Is the screen covered? A grid of points, each covered once an article lies over it
const GRID = [24, 16];
const FILL_GAPS = 0.85;          // once this share is covered, new articles go to the gaps

const BURIED_WAIT = 3;           // seconds between the screen being covered and the news flying away
const FLY_STAGGER = 1.4;         // seconds over which the news set off, the newest first
const FLY_SPEED = [3, 8];        // px per frame as an article sets off …
const FLY_ACCELERATION = 1.07;   // … growing by this much each frame
const CHART_AFTER = 0.6;         // seconds after the first article flies before the timelapse starts

const SHADOW = { blur: 24, offsetY: 6, color: 'rgba(0, 0, 0, 0.55)' };

const question = document.getElementById('question');

function spamSketch(p) {
  const raw = [];
  let textures = [];       // { img: with its shadow drawn in, w, h: the article inside it }
  const all = [];          // every article, for redrawing after a resize
  let moving = [];         // articles still sliding
  let settled;             // offscreen layer with the articles that stopped, drawn once
  let interval = FIRST_INTERVAL;
  let nextAt = SPREAD_START;
  let covered = [];        // per grid point
  let buriedAt = null;     // when the screen was covered
  let flying = null;       // articles flying away, once they do
  let chartStarted = false;

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

  // The shadow is drawn into each texture once, so hundreds of articles can
  // fly at once without blurring every frame.
  function withShadow(img) {
    const pad = SHADOW.blur * 1.5;
    const g = p.createGraphics(img.width + 2 * pad, img.height + 2 * pad);
    g.pixelDensity(1);
    const ctx = g.drawingContext;
    ctx.shadowColor = SHADOW.color;
    ctx.shadowBlur = SHADOW.blur;
    ctx.shadowOffsetY = SHADOW.offsetY;
    g.image(img, pad, pad);
    return { img: g, w: img.width, h: img.height };
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
    textures = raw.map((img) => withShadow(shrink(img, TEXTURE_MAX)));
    covered = new Array(GRID[0] * GRID[1]).fill(false);
    makeSettledLayer();
  };

  function gridPoint(i) {
    return {
      x: ((i % GRID[0]) + 0.5) / GRID[0] * p.width,
      y: (Math.floor(i / GRID[0]) + 0.5) / GRID[1] * p.height,
    };
  }

  function cover(n) {
    covered.forEach((c, i) => {
      if (c) return;
      const g = gridPoint(i);
      if (Math.abs(g.x - n.tx) < n.w * 0.47 && Math.abs(g.y - n.ty) < n.h * 0.47) covered[i] = true;
    });
  }

  function coveredShare() {
    return covered.filter(Boolean).length / covered.length;
  }

  function spawn(t) {
    const tex = p.random(textures);
    const long = Math.max(p.width, p.height) * p.random(NEWS_SIZE[0], NEWS_SIZE[1]);
    const scale = long / Math.max(tex.w, tex.h);
    const w = tex.w * scale, h = tex.h * scale;

    // most appear right next to an earlier one, like an infection spreading;
    // at the end they go to the last gaps
    let x, y;
    const gaps = coveredShare() > FILL_GAPS ? covered.map((c, i) => i).filter((i) => !covered[i]) : [];
    if (gaps.length) {
      ({ x, y } = gridPoint(p.random(gaps)));
      x += p.random(-0.25, 0.25) * w;
      y += p.random(-0.25, 0.25) * h;
    } else if (all.length > 2 && p.random() < NEAR_PARENT) {
      const parent = p.random(all);
      x = parent.tx + p.random(-0.6, 0.6) * parent.w;
      y = parent.ty + p.random(-0.6, 0.6) * parent.h;
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
      img: tex.img, scale, w, h,
      tx: x, ty: y,
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
    cover(n);
  }

  function drawNews(g, n, alpha) {
    const k = (0.92 + 0.08 * alpha) * n.scale;   // pops up slightly as it appears
    g.push();
    g.drawingContext.globalAlpha = alpha;
    g.translate(n.x, n.y);
    g.rotate(n.angle);
    g.image(n.img, 0, 0, n.img.width * k, n.img.height * k);
    g.pop();
  }

  // The newest set off first; each flies to the nearer side, a little up or
  // down, faster and faster.
  function flyAway(t) {
    flying = all.slice().reverse().map((n, i) => {
      const dir = n.x < p.width / 2 ? -1 : 1;
      const speed = p.random(FLY_SPEED[0], FLY_SPEED[1]);
      return Object.assign(n, {
        leaveAt: t + i / all.length * FLY_STAGGER,
        vx: dir * speed,
        vy: p.random(-0.25, 0.25) * speed,
        spin: p.random(-0.004, 0.004),
      });
    }).reverse();   // drawn oldest first, as before
    moving = [];
    settled.remove();
    settled = null;
  }

  function drawFlying(t) {
    flying = flying.filter((n) => {
      if (t >= n.leaveAt) {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= FLY_ACCELERATION;
        n.vy *= FLY_ACCELERATION;
        n.angle += n.spin;
      }
      const r = Math.max(n.w, n.h);
      if (n.x < -r || n.x > p.width + r || n.y < -r || n.y > p.height + r) return false;
      drawNews(p, n, 1);
      return true;
    });
  }

  p.draw = () => {
    const t = p.millis() / 1000;
    p.clear();

    if (flying) {
      drawFlying(t);
      if (!chartStarted && t >= buriedAt + BURIED_WAIT + CHART_AFTER) {
        chartStarted = true;
        window.startTimelapse();
      }
      return;
    }

    while (buriedAt === null && t >= nextAt && all.length < MAX_NEWS) {
      spawn(t);
      interval = Math.max(MIN_INTERVAL, interval * ACCELERATION);
      nextAt += interval;
    }

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

    // buried: every grid point covered (or no more news to come)
    if (buriedAt === null && (coveredShare() === 1 || all.length >= MAX_NEWS)) {
      buriedAt = t;
      question.classList.remove('visible');
    }
    if (buriedAt !== null && t >= buriedAt + BURIED_WAIT) flyAway(t);
  };

  p.windowResized = () => {
    const sx = p.windowWidth / p.width, sy = p.windowHeight / p.height;
    for (const n of all) { n.x *= sx; n.y *= sy; n.tx *= sx; n.ty *= sy; }
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (settled) makeSettledLayer();
  };
}
