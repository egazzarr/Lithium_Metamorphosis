document.addEventListener('DOMContentLoaded', () => {
  layoutTitle();
  window.addEventListener('resize', layoutTitle);
  document.fonts.load(`10px ${TITLE_FONT}`);   // the canvas letter mask needs it ready
  trackPointer();

  createChapterSketch(dustSketch);    // background: floating dust
  createChapterSketch(pileSketch);    // on top: the rock pile, then the title scene

  setTimeout(() => playCaption(0), CAPTION_START * 1000);
});

/*
  pile   – one rock rests at the bottom centre; while the pointer is over the
           stones (or a finger touches them) rocks keep falling where it is and
           slide down into a cone at the bottom, while the captions play
  camera – CAMERA_DELAY seconds after the last caption has gone, the camera
           rises and the pile slides out of view
  title  – the title appears as a thick glowing outline, with two microbes
           creeping through the inside of the letters after the pointer;
           then we move on to the microbi chapter
*/

const ROCK_FILES = ['rock1.png', 'rock2.png', 'rock3.png', 'rock4.PNG'];
const ROCK_SIZE = [40, 100];     // visual size range (square root of visible area), in px on desktop
const FIRST_ROCK_SIZE = 120;
const FIRST_ROCK_FILE = 'rock4.PNG';
const FIRST_GLOW_PERIOD = 4.5;   // seconds per slow pulse of the first rock's glow, inviting a hover
const ROCK_TEXTURE_MAX = 260;    // rocks are downscaled to this for drawing

// Pile building: while the pointer is over the stones, rocks fall where it is
// and slide down until the slope is gentle enough, building a wide cone
const DROP_EVERY = 0.22;         // seconds between rocks
const DROP_JITTER = 18;          // px; how far from the pointer a rock may fall
const MAX_PILE = 280;            // safety cap; rocks that roll off the screen are removed
const SCATTER = 0.1;             // share of rocks that bounce off towards the sides
const REPOSE_ANGLE = [22, 34];   // degrees; per-rock steepest slope it can stop on (the cone's steepness)

// Rocks lean gently towards the pointer
const PILE_MAGNET = 22;          // px a rock right next to the pointer is pulled out of place
const PILE_MAGNET_RANGE = 160;   // px; the pull fades out beyond this
const FALL_MAGNET = 0.01;        // how much falling rocks drift towards the pointer
const SINK = 0.35;               // how much rocks overlap the ones below

// Inner-voice captions at the top
const CAPTIONS = ['Where am I?', 'It is so dark here ...'];
const CAPTION_START = 5;
const CAPTION_FADE = 1.5, CAPTION_HOLD = 4, CAPTION_GAP = 4;   // fade matches the CSS

// Camera
const CAMERA_DELAY = 4;          // seconds after the last caption has faded out
const CAMERA_MOVE = 4;           // seconds the camera takes to rise past the pile
const TITLE_DURING_CAMERA = 0.7; // the title starts when the camera is this far through its move

// Title scene
const TITLE_FADE = 2;            // keep in sync with #chapter-title in the CSS
const TITLE_HOLD = 10;

// Microbes creeping into the letters
const MICROBE_FILES = ['microbo1.png', 'microbo2.png'];
const MICROBE_SIZE = 0.32;       // size relative to the shorter side of the screen
const MICROBE_TRAVEL = 16;       // seconds a full crossing takes

const TITLE_FONT = "'Anton Title', sans-serif";
let titleLayout = null;
let captionsEndedAt = null;

// Shared between the two sketches: how far the camera has risen, in px
const world = { shift: 0 };

// Mouse or finger. A finger only counts while it touches the screen.
const pointer = { x: 0, y: 0, active: false };

function trackPointer() {
  const update = (e) => {
    // the scene ignores the pointer while the chapter menu is open
    if (document.body.classList.contains('menu-open')) { pointer.active = false; return; }
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  };
  const release = (e) => { if (e.pointerType !== 'mouse') pointer.active = false; };
  window.addEventListener('pointermove', update);
  window.addEventListener('pointerdown', update);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  document.documentElement.addEventListener('mouseleave', () => { pointer.active = false; });
}

function playCaption(i) {
  const caption = document.getElementById('caption');
  if (i >= CAPTIONS.length) return;
  caption.textContent = CAPTIONS[i];
  caption.classList.add('visible');
  setTimeout(() => {
    caption.classList.remove('visible');
    if (i === CAPTIONS.length - 1) {
      setTimeout(() => { captionsEndedAt = performance.now(); }, CAPTION_FADE * 1000);
    } else {
      setTimeout(() => playCaption(i + 1), (CAPTION_FADE + CAPTION_GAP) * 1000);
    }
  }, (CAPTION_FADE + CAPTION_HOLD) * 1000);
}

// Fits the two title lines to fill the screen: each line spans the full width
// and takes half the height, so the letters come out tall and stretched.
// On portrait screens the title is laid out sideways along the long side.
// The sketch uses the same layout to keep the microbes inside the letters.
function layoutTitle() {
  const w = window.innerWidth, h = window.innerHeight;
  const rotate = h > w * 1.15;
  const tw = rotate ? h : w, th = rotate ? w : h;
  const capRatio = 0.86;                 // Anton cap height / font size
  const pad = th * 0.04, gap = th * 0.04;
  const capH = (th - 2 * pad - gap) / 2;
  const baselines = [pad + capH, th - pad];

  const lines = baselines.map((y, i) => ({
    text: ['LITHIUM', 'METAMORPHOSIS'][i], x: tw * 0.02, y, length: tw * 0.96, fontSize: capH / capRatio,
  }));

  document.getElementById('chapter-title').setAttribute('viewBox', `0 0 ${w} ${h}`);
  for (const group of document.querySelectorAll('.title-group')) {
    group.setAttribute('transform', rotate ? `translate(${w} 0) rotate(90)` : '');
    group.querySelectorAll('text').forEach((el, i) => {
      el.setAttribute('x', lines[i].x);
      el.setAttribute('y', lines[i].y);
      el.setAttribute('textLength', lines[i].length);
      el.setAttribute('font-size', lines[i].fontSize);
    });
  }
  titleLayout = { rotate, w, lines };
}

// Background layer: floating dust, sliding down at different speeds
// (parallax) when the camera rises.
function dustSketch(p) {
  const dust = [];

  p.setup = () => {
    p.pixelDensity(1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    const count = Math.round(170 * Math.min(1, (p.width * p.height) / 1.3e6) + 40);
    for (let i = 0; i < count; i++) {
      const z = p.random(0.15, 1);       // 1 = close to the camera, moves fastest
      dust.push({
        x: p.random(),
        y: p.random(),
        z,
        r: p.random(0.6, 2.4) * z,
        a: p.random(25, 100),
        seed: p.random(1000),
      });
    }
  };

  p.draw = () => {
    p.clear();
    p.noStroke();
    const span = p.height + 40;
    const t = p.millis() / 1000;
    for (const d of dust) {
      // slow drift, plus the camera's rise
      const y = ((d.y * span + t * 6 * d.z + world.shift * d.z) % span + span) % span - 20;
      const x = d.x * p.width + (p.noise(d.seed, t * 0.12) - 0.5) * 40;
      p.fill(210, 190, 160, d.a);
      p.circle(x, y, d.r * 2);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}

function pileSketch(p) {
  const rockImages = [];
  const microbeImages = [];
  const textures = [];
  let microbeTextures = [];
  let pile = [];           // rocks resting on (or falling onto) the pile, in screen space before the camera shift
  let microbes = [];
  let first;               // the rock that starts it all
  let firstGlow = 1;       // its inviting glow, fading once rocks start falling
  let hasDropped = false;
  let surface;             // highest point of the pile per column
  const COL = 4;           // column width of the surface map, px
  let groundY;
  let lastDrop = 0;
  let layer, letterLayer;  // offscreen: what goes inside the letters, and the letter mask
  let phase = 'pile';
  let cameraStart = 0, titleStart = 0;
  let leaving = false;

  p.preload = () => {
    for (const file of ROCK_FILES) rockImages.push(p.loadImage('../assets/images/' + file));
    for (const file of MICROBE_FILES) microbeImages.push(p.loadImage('../assets/images/' + file));
  };

  // Crops away the transparent border so every image is sized by its visible shape.
  function trim(img) {
    img.loadPixels();
    let minX = img.width, minY = img.height, maxX = -1, maxY = -1;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        if (img.pixels[(y * img.width + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return img;
    return img.get(minX, minY, maxX - minX + 1, maxY - minY + 1);
  }

  function shrink(img, maxSide) {
    const copy = img.get();
    if (Math.max(copy.width, copy.height) > maxSide) {
      if (copy.width > copy.height) copy.resize(maxSide, 0);
      else copy.resize(0, maxSide);
    }
    return copy;
  }

  // 0 → 1 between a and b, eased
  function ramp(t, a, b) {
    const x = p.constrain((t - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  }

  // rocks are a bit smaller on phones
  function sizeScale() {
    return p.constrain(Math.min(p.width, p.height) / 800, 0.55, 1);
  }

  function makeLayers() {
    if (layer) { layer.remove(); letterLayer.remove(); }
    layer = p.createGraphics(p.width, p.height);
    layer.imageMode(p.CENTER);
    letterLayer = p.createGraphics(p.width, p.height);
  }

  // ----- the pile -----
  // The pile's outline is kept as a height per narrow column. Rocks are treated
  // as ellipses: a falling rock lands where its lower half touches the outline,
  // tumbles downhill (or gets kicked sideways) until the slope is gentle enough
  // for it, and only then raises the outline by its upper half.

  function resetSurface() {
    groundY = p.height * 0.985;
    surface = new Float32Array(Math.ceil(p.width / COL) + 1).fill(groundY);
  }

  function halfProfile(r, dx) {
    const f = dx / (r.w * 0.45);
    return f >= 1 ? 0 : (r.h / 2) * Math.sqrt(1 - f * f);
  }

  // where the rock's centre would rest at x (beyond the screen edges it's bare ground)
  function restY(r, x) {
    let y = groundY - (r.h / 2) * (1 - SINK);
    const c0 = Math.max(0, Math.floor((x - r.w * 0.45) / COL));
    const c1 = Math.min(surface.length - 1, Math.ceil((x + r.w * 0.45) / COL));
    for (let c = c0; c <= c1; c++) {
      y = Math.min(y, surface[c] - halfProfile(r, Math.abs(c * COL - x)) * (1 - SINK));
    }
    return y;
  }

  function addToSurface(r) {
    const c0 = Math.max(0, Math.floor((r.x - r.w * 0.45) / COL));
    const c1 = Math.min(surface.length - 1, Math.ceil((r.x + r.w * 0.45) / COL));
    for (let c = c0; c <= c1; c++) {
      surface[c] = Math.min(surface[c], r.y - halfProfile(r, Math.abs(c * COL - r.x)));
    }
  }

  function makeRock(size, tex = p.random(textures)) {
    const scale = size * sizeScale() / Math.sqrt(tex.w * tex.h);
    return { img: tex.img, w: tex.w * scale, h: tex.h * scale, angle: p.random(-p.PI, p.PI) };
  }

  function dropRock() {
    const r = makeRock(p.random(ROCK_SIZE[0], ROCK_SIZE[1]));
    r.x = pointer.x + p.randomGaussian(0, DROP_JITTER);
    r.y = -r.h - p.random(0, 80);
    r.vy = p.random(0, 2);
    // a few rocks bounce off outwards (away from the cone's middle), the rest just tumble a little
    const outward = p.random() < 0.5 ? -1 : 1;
    r.kick = p.random() < SCATTER ? outward * p.random(3, 6) : p.random(-0.6, 0.6);
    r.ox = 0;
    r.oy = 0;
    r.spin = p.random(-0.06, 0.06);
    r.slope = Math.tan(p.radians(p.random(REPOSE_ANGLE[0], REPOSE_ANGLE[1])));
    r.bounced = false;
    r.state = 'falling';
    pile.push(r);
  }

  // Is the pointer over the stones (anywhere on the pile, or just above it)?
  function overStones() {
    if (!pointer.active) return false;
    const c = Math.round(pointer.x / COL);
    if (c < 0 || c >= surface.length || surface[c] >= groundY) return false;
    return pointer.y >= surface[c] + world.shift - 25;
  }

  function updatePile() {
    for (let i = pile.length - 1; i >= 0; i--) {
      const r = pile[i];
      if (r.state === 'falling') {
        r.vy += 0.6;
        r.y += r.vy;
        r.angle += r.spin;
        // drifts a little towards the pointer on the way down
        if (pointer.active) {
          const d = Math.hypot(pointer.x - r.x, pointer.y - (r.y + world.shift));
          r.x += (pointer.x - r.x) * FALL_MAGNET * PILE_MAGNET_RANGE / (d + PILE_MAGNET_RANGE);
        }
        const ground = restY(r, r.x);
        if (r.y >= ground) {
          r.y = ground;
          if (!r.bounced && r.vy > 5) {
            r.vy = -r.vy * 0.2;
            r.bounced = true;
          } else {
            r.state = 'rolling';
            r.vx = r.kick;
          }
        }
      } else if (r.state === 'rolling') {
        // the kick carries it sideways first, then it slides down while the slope is too steep
        let dx = 0;
        if (Math.abs(r.vx) > 0.4) {
          dx = r.vx;
          r.vx *= 0.95;
        } else {
          // look half a rock-width to each side, so small dips between rocks
          // don't stop it: it keeps sliding while the slope is steeper than its angle
          const reach = r.w * 0.5;
          const here = restY(r, r.x);
          const yl = restY(r, r.x - reach), yr = restY(r, r.x + reach);
          const [dir, lower] = yl > yr ? [-1, yl] : [1, yr];
          if (lower - here > reach * r.slope) dx = dir * 3;
        }
        r.x += dx;
        r.y += (restY(r, r.x) - r.y) * 0.5;
        r.angle += dx / (r.w * 0.5);   // turning as it rolls

        if (r.x < -r.w || r.x > p.width + r.w) { pile.splice(i, 1); continue; }   // rolled off the screen
        if (dx === 0) {
          r.y = restY(r, r.x);
          r.state = 'rest';
          addToSurface(r);
        }
      }
    }
  }

  // Every rock is drawn slightly pulled towards the pointer, easing in and out,
  // without changing where it actually rests in the pile.
  function drawPile() {
    for (const r of pile) {
      const y = r.y + world.shift;
      let tx = 0, ty = 0;
      if (pointer.active) {
        const dx = pointer.x - r.x, dy = pointer.y - y;
        const d = Math.hypot(dx, dy) || 1;
        const pull = PILE_MAGNET * PILE_MAGNET_RANGE ** 2 / (d * d + PILE_MAGNET_RANGE ** 2);
        const k = Math.min(pull, d * 0.5) / d;   // never past the pointer itself
        tx = dx * k;
        ty = dy * k;
      }
      r.ox = (r.ox || 0) + (tx - (r.ox || 0)) * 0.06;
      r.oy = (r.oy || 0) + (ty - (r.oy || 0)) * 0.06;
      if (y - r.h > p.height) continue;
      p.push();
      p.translate(r.x + r.ox, y + r.oy);
      p.rotate(r.angle);
      if (r === first && firstGlow > 0.01) {
        drawGlowing(r);
      } else {
        p.image(r.img, 0, 0, r.w, r.h);
      }
      p.pop();
    }
  }

  // The first rock breathes slowly with a soft warm halo until rocks start to fall.
  function drawGlowing(r) {
    firstGlow += ((hasDropped ? 0 : 1) - firstGlow) * 0.02;
    const t = p.millis() / 1000;
    const pulse = 0.5 - 0.5 * Math.cos(t * p.TWO_PI / FIRST_GLOW_PERIOD);   // 0 → 1 → 0
    const ctx = p.drawingContext;
    ctx.shadowColor = `rgba(255, 240, 215, ${firstGlow * (0.35 + 0.4 * pulse)})`;
    ctx.shadowBlur = firstGlow * (10 + 22 * pulse);
    const k = 1 + 0.03 * pulse * firstGlow;
    p.image(r.img, 0, 0, r.w * k, r.h * k);
  }

  // ----- setup and main loop -----

  p.setup = () => {
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.imageMode(p.CENTER);
    makeLayers();

    for (const raw of rockImages) {
      const trimmed = trim(raw);
      textures.push({ img: shrink(trimmed, ROCK_TEXTURE_MAX), w: trimmed.width, h: trimmed.height });
    }
    microbeTextures = microbeImages.map((raw) => shrink(trim(raw), 600));

    // the single rock waiting at the bottom
    resetSurface();
    first = makeRock(FIRST_ROCK_SIZE, textures[ROCK_FILES.indexOf(FIRST_ROCK_FILE)]);
    first.angle = 0;
    first.x = p.width / 2;
    first.y = restY(first, first.x);
    first.state = 'rest';
    addToSurface(first);
    pile.push(first);
  };

  p.draw = () => {
    const now = performance.now();

    if (phase === 'pile') {
      if (pile.length < MAX_PILE && overStones() && now - lastDrop > DROP_EVERY * 1000) {
        lastDrop = now;
        hasDropped = true;
        dropRock();
      }
      if (captionsEndedAt && now - captionsEndedAt > CAMERA_DELAY * 1000) {
        phase = 'camera';
        cameraStart = now;
      }
    }

    if (phase !== 'pile') {
      const c = ramp((now - cameraStart) / 1000, 0, CAMERA_MOVE);
      world.shift = c * p.height * 1.15;
      document.body.style.setProperty('--shift', world.shift.toFixed(1));
      document.body.style.setProperty('--depth', (c * 0.5).toFixed(3));
      if (phase === 'camera' && c >= TITLE_DURING_CAMERA) startTitle(now);
    }

    updatePile();
    p.clear();
    drawPile();

    if (phase !== 'title') return;

    // ----- title: the microbes, seen only through the letters -----
    const tt = (now - titleStart) / 1000;
    const end = TITLE_FADE + TITLE_HOLD;
    const visible = ramp(tt, 0, TITLE_FADE) * (1 - ramp(tt, end, end + TITLE_FADE));

    layer.clear();
    drawMicrobes(layer, tt);
    drawLetters();
    const ctx = p.drawingContext;
    ctx.globalAlpha = visible;
    ctx.drawImage(letterLayer.elt, 0, 0, p.width, p.height);
    ctx.globalAlpha = 1;

    if (tt >= end + TITLE_FADE && !leaving) {
      leaving = true;
      goToNextChapter();
    }
  };

  function startTitle(now) {
    phase = 'title';
    titleStart = now;
    const title = document.getElementById('chapter-title');
    title.classList.add('visible');
    setTimeout(() => title.classList.remove('visible'), (TITLE_FADE + TITLE_HOLD) * 1000);

    // paths as fractions of the screen; each one sways along its way.
    // The two paths never cross: microbo2 keeps to the upper-left half,
    // microbo1 rises on the right, below microbo2's line.
    microbes = [
      // microbo2: bottom left → top right
      { img: microbeTextures[1], from: [-0.15, 0.85], to: [0.85, -0.15], waves: 1.5, amp: 0.025, delay: 0.5 },
      // microbo1: bottom → top
      { img: microbeTextures[0], from: [0.72, 1.25], to: [0.85, 0], waves: 2, amp: 0.03, delay: 1.5 },
    ].map((m) => ({ ...m, seed: p.random(p.TWO_PI) }));
  }

  // Two microbes creeping in on wavy paths of their own (they ignore the pointer).
  function drawMicrobes(g, tt) {
    const W = p.width, H = p.height;
    const size = Math.min(W, H) * MICROBE_SIZE;
    for (const m of microbes) {
      const u = (tt - m.delay) / MICROBE_TRAVEL;
      if (u < 0 || u > 1) continue;

      const a = p.createVector(m.from[0] * W, m.from[1] * H);
      const b = p.createVector(m.to[0] * W, m.to[1] * H);
      const dir = p5.Vector.sub(b, a);
      const side = p.createVector(-dir.y, dir.x).normalize();
      const pos = p5.Vector.lerp(a, b, u)
        .add(side.mult(Math.sin(u * p.TWO_PI * m.waves + m.seed) * m.amp * Math.min(W, H)));

      // turn smoothly to face where it is heading (images are drawn pointing up)
      const heading = m.prev ? Math.atan2(pos.y - m.prev.y, pos.x - m.prev.x) : dir.heading();
      if (m.angle === undefined) m.angle = heading;
      m.angle += Math.atan2(Math.sin(heading - m.angle), Math.cos(heading - m.angle)) * 0.03;
      m.prev = pos;

      const scale = size / Math.sqrt(m.img.width * m.img.height);
      g.push();
      g.translate(pos.x, pos.y);
      g.rotate(m.angle + p.HALF_PI);
      g.image(m.img, 0, 0, m.img.width * scale, m.img.height * scale);
      g.pop();
    }
  }

  // Fills the title letters, then keeps only what falls inside them.
  function drawLetters() {
    const lctx = letterLayer.drawingContext;
    letterLayer.clear();
    lctx.save();
    if (titleLayout.rotate) {
      lctx.translate(titleLayout.w, 0);
      lctx.rotate(Math.PI / 2);
    }
    lctx.fillStyle = '#fff';
    lctx.textBaseline = 'alphabetic';
    for (const line of titleLayout.lines) {
      lctx.font = `${line.fontSize}px ${TITLE_FONT}`;
      const natural = lctx.measureText(line.text).width;
      lctx.save();
      lctx.translate(line.x, line.y);
      lctx.scale(line.length / natural, 1);   // same stretch as the SVG textLength
      lctx.fillText(line.text, 0, 0);
      lctx.restore();
    }
    lctx.restore();
    lctx.save();
    lctx.globalCompositeOperation = 'source-in';
    lctx.drawImage(layer.elt, 0, 0, p.width, p.height);
    lctx.restore();
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    makeLayers();
  };
}
