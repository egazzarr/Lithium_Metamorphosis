// primordiale.html starts at the bowl; once the title has gone it carries on
// into the microbes without a break, and from there on counts as the microbi
// chapter (address, buttons and menu switch over). microbi.html, opened from
// the menu or the buttons, starts at that point.
const START = document.body.dataset.start || 'bowl';
if (new URLSearchParams(location.search).has('from')) document.body.classList.add('seamless');

document.addEventListener('DOMContentLoaded', () => {
  document.fonts.load(`10px ${LABEL_FONT}`);   // the microbe labels are drawn on the canvas
  trackPointer();

  createChapterSketch(sceneSketch);   // on top: the bowl of rocks, then the microbes

  if (START === 'bowl') setTimeout(() => playCaption(0), CAPTION_START * 1000);
});

/*
  bowl     – small fragments fall like grains from the top of the screen into
             an invisible bowl at the bottom, bounce a little where they hit
             its sides and run down them, filling it level instead of piling
             up. Only a few fall while the pointer is elsewhere; with the
             pointer over the bowl many more pour in around it
  rise     – once the last caption has gone, the camera rises and eases to a
             stop just as the last rocks have gone below the screen
  title    – there the title blurs in at once, in the middle of the screen,
             stays TITLE_HOLD seconds and blurs out the way it came
  beyond   – the camera rises on, gathering speed, and the first microbes
             come into view. Once the title is behind, primordiale.html hands
             over to microbi.html, which starts with the microbes
  microbes – the camera keeps rising through MICROBE_SCREENS screens of
             microbes, very scarce at first and crowded only at the end, while the light warms
             from grey-black to brown-orange; hovering one stops the camera,
             makes it glow and draws a line to its name, so the more they are
             explored the longer it lasts
  emerge   – at the top we come up out of the ground: the mountains of the
             flamingo chapter come down from above, their powdery lower edges
             resting on the rock, and once they are in place that chapter takes over
*/

const ROCK_FILES = ['rock1.png', 'rock2.png', 'rock3.png', 'rock4.png', 'rock5.png'];
const ROCK_SIZE = [8, 22];      // tiny fragments, sized by square root of visible area
const FIRST_ROCK_SIZE = 24;
const FIRST_ROCK_FILE = 'rock1.png';
const FIRST_GLOW_PERIOD = 4.5;   // seconds per slow pulse of the first rock's glow, inviting a hover
const ROCK_TEXTURE_MAX = 90;     // rocks are downscaled to this for drawing

// The bowl: an invisible curve at the bottom centre that the grains fall into
const BOWL_WIDTH = 0.3;          // half-width, as a share of the screen width (capped by the height)
const BOWL_WIDTH_PORTRAIT = 0.44;   // the same on tall screens such as phones
const BOWL_DEPTH = 0.45;         // depth, as a share of the half-width
const BOWL_BOTTOM = 0.93;        // where its lowest point sits, as a share of the screen height
const OFFSCREEN = 60;            // px of ground mapped beyond the screen edges
const SPAWN_RATE = [0.5, 2.5];   // grains per second with the pointer away: a few, slowly more
const SPAWN_RAMP = [4, 30];      // seconds over which that rate grows
const HOVER_RATE = 30;           // grains per second with the pointer over the bowl
const FALL_GRAVITY = 0.45;       // px per frame²
const FALL_MAX = 14;             // px per frame
const BOUNCE = [0.15, 0.35];     // share of the speed kept in the one small hop off the bowl
const BOUNCE_MIN = 3;            // px per frame; slower landings don't hop
const SLIDE_KICK = 0.45;         // how much of the fall turns into running down the slope on landing
const BOWL_FULL = 0.95;          // stop adding grains once it is this full
const MAX_ROCKS = 1400;
const ROLL_PULL = 0.14;          // how strongly the slope accelerates a grain
const ROLL_FRICTION = 0.97;
const ROLL_MAX = 5;              // px per frame
const REPOSE_ANGLE = [3, 9];     // degrees; low, so the bowl fills level instead of making a pile
const SINK = 0.35;               // how much rocks overlap the ones below

// Rocks lean gently towards the pointer
const PILE_MAGNET = 22;          // px a rock right next to the pointer is pulled out of place
const PILE_MAGNET_RANGE = 160;   // px; the pull fades out beyond this

// Inner-voice captions at the top
const CAPTIONS = ['Where am I?', 'It is so dark here ...'];
const CAPTION_START = 5;
const CAPTION_FADE = 1.5, CAPTION_HOLD = 4, CAPTION_GAP = 4;   // fade matches the CSS

// Camera
const CAMERA_DELAY = 1;          // seconds after the last caption has faded out
const CAMERA_START = 3;          // seconds the camera takes to reach its full speed after the title
const CAMERA_RISE = 1.3;         // screen heights above the bowl where the title stands, until the rise has measured it
const RISE_TIME = 5;             // seconds the camera takes to rise until the rocks are gone, easing in and out
const RISE_MARGIN = 12;          // px the highest rock is below the screen when the camera stops

// Title
const TITLE_HOLD = 5;            // seconds it stays, from blurring in to starting to blur out (primordiale.css)
const TITLE_OUT = 0.6;           // screen heights the camera rises past it before the microbi chapter starts

// Microbes
const MICROBE_FILES = [   // named microbo_NAME.png; NAME is shown on hover
  'microbo_Artemia franciscana.png',
  'microbo_Artemia persimilis.png',
  'microbo_Boeckella poopoensis.png',
  'microbo_Cyanothece spp..png',
  'microbo_Cyprideis.png',
  'microbo_Dunaliella salina.png',
  'microbo_Haloroundia speciosa.png',
  'microbo_Microcoleus chthonoplastes.png',
  'microbo_Pleuroxus hardingi.png',
  'microbo_Synechococcus spp..png',
];
const MICROBE_PACE = 8;          // seconds per screen height while the camera rises through them
const MICROBE_SCREENS = 3;       // screen heights of microbes above the title: about 24 s untouched
const MICROBE_PER_KIND = 3;      // at most this many of each kind in all
const MICROBE_TRIES = 80;        // places tried for each before it is left out, so none overlap
const MICROBE_CROWDING = 3.5;    // > 1: scarce near the title, denser and denser further up
const MICROBE_SIZE = [110, 300]; // px, by square root of visible area (smaller on phones)
const MICROBE_STRETCH = [0.75, 1.3];   // each one is stretched a little differently in width and height
const MICROBE_TEXTURE_MAX = 560;
const MICROBE_DRIFT = 90;        // px a wandering microbe strays from its spot
const LABEL_FONT = "'Lato Thin', sans-serif";
const MICROBES_PAGE = 'microbi.html';
const NEXT_SCENE = 'fauna.html?from=microbi';
const NEXT_SCENE_FRAME = 'fauna.html?embed';   // its first frame, shown above the ground
const EMERGE_SPEED = 1.6;        // × the microbe pace while we come up out of the ground (fauna.js RISE matches it)
const MICROBES_EARLY = 0.2;      // screen heights before microbi's start where the first microbes already are: just out of view above the title

// The page colour behind everything, from the dark to the warm brown-orange
// the flamingo scene starts from (fauna.css)
const BG_DARK = [11, 10, 9], BG_WARM = [138, 85, 48];

let captionsEndedAt = null;

// Shared between the two sketches: how far the camera has risen, in px
const world = { shift: 0 };

// Mouse or finger. A finger only counts while it touches the screen.
const pointer = { x: 0, y: 0, active: false, tapUntil: 0 };
const TAP_HOLD = 4;              // seconds a tapped microbe stays selected

function trackPointer() {
  const update = (e) => {
    // the scene ignores the pointer while the chapter menu is open
    if (document.body.classList.contains('menu-open')) { pointer.active = false; return; }
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  };
  // a lifted finger still counts where it last tapped for a few seconds,
  // so a tapped microbe keeps its name on screen
  const release = (e) => {
    if (e.pointerType === 'mouse') return;
    pointer.active = false;
    pointer.tapUntil = performance.now() + TAP_HOLD * 1000;
  };
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

// Everything here lives in world coordinates: on screen, y + world.shift.
function sceneSketch(p) {
  const rockImages = [], microbeImages = [];
  const textures = [], microbeTextures = [];
  let rocks = [];
  let microbes = [];
  let first;               // the rock that starts it all
  let firstGlow = 1;       // its inviting glow, fading once rocks start falling
  let hasDropped = false;
  let surface;             // highest point of the fill per column
  const COL = 4;           // column width of the surface map, px
  let bowl;
  let spawnDebt = 0;       // rocks owed to the spawn rate, carried between frames
  let phase = 'bowl';
  let startedAt = 0;
  let riseTop = 0, microbesStart = 0, microbesTop = 0;   // camera shift at the title, where microbi starts, and at the last microbes
  let cameraSpeed = 0;
  let riseStartedAt = 0, titleAt = 0;   // when the camera set off from the bowl, and when it stopped at the title
  let lastFrame = 0;

  // A missing file is skipped instead of holding the whole scene on "Loading..."
  p.preload = () => {
    ROCK_FILES.forEach((file, i) => {
      rockImages[i] = p.loadImage('../assets/images/' + file, undefined, () => { rockImages[i] = null; });
    });
    if (START === 'microbes') MICROBE_FILES.forEach((file, i) => {   // primordiale never shows them
      microbeImages[i] = p.loadImage('../assets/images/' + encodeURIComponent(file), undefined,
        () => { microbeImages[i] = null; });
    });
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

  // things are a bit smaller on phones
  function sizeScale() {
    return p.constrain(Math.min(p.width, p.height) / 800, 0.55, 1);
  }

  // ----- the bowl -----
  // The fill's outline is kept as a height per narrow column, starting as the
  // bowl's curve. Rocks are treated as ellipses resting on that outline: they
  // roll while the slope under them is steeper than they can rest on, and only
  // when they stop do they raise the outline by their upper half.

  function makeBowl() {
    const R = Math.min(p.width * (p.width < p.height ? BOWL_WIDTH_PORTRAIT : BOWL_WIDTH), p.height * 0.55);
    const bottom = p.height * BOWL_BOTTOM;
    bowl = { cx: p.width / 2, R, bottom, rim: bottom - R * BOWL_DEPTH };
    // the map reaches beyond both screen edges, where the rocks start
    surface = new Float32Array(Math.ceil((p.width + 2 * OFFSCREEN) / COL) + 3);
    for (let c = 0; c < surface.length; c++) surface[c] = bowlY(colX(c));
  }

  // surface column ↔ x on screen
  function colX(c) { return c * COL - OFFSCREEN - COL; }
  function xCol(x) { return (x + OFFSCREEN + COL) / COL; }

  function bowlY(x) {
    const d = Math.min(1, Math.abs(x - bowl.cx) / bowl.R);
    return bowl.bottom - (bowl.bottom - bowl.rim) * d * d;
  }

  function halfProfile(r, dx) {
    const f = dx / (r.w * 0.45);
    return f >= 1 ? 0 : (r.h / 2) * Math.sqrt(1 - f * f);
  }

  // where the rock's centre would rest at x
  function restY(r, x) {
    let y = bowlY(x) - (r.h / 2) * (1 - SINK);
    const c0 = Math.max(0, Math.floor(xCol(x - r.w * 0.45)));
    const c1 = Math.min(surface.length - 1, Math.ceil(xCol(x + r.w * 0.45)));
    for (let c = c0; c <= c1; c++) {
      y = Math.min(y, surface[c] - halfProfile(r, Math.abs(colX(c) - x)) * (1 - SINK));
    }
    return y;
  }

  function addToSurface(r) {
    const c0 = Math.max(0, Math.floor(xCol(r.x - r.w * 0.45)));
    const c1 = Math.min(surface.length - 1, Math.ceil(xCol(r.x + r.w * 0.45)));
    for (let c = c0; c <= c1; c++) {
      surface[c] = Math.min(surface[c], r.y - halfProfile(r, Math.abs(colX(c) - r.x)));
    }
  }

  // how full the bowl is at its centre, 0 → 1
  function fill() {
    const top = surface[Math.round(xCol(bowl.cx))];
    return (bowl.bottom - top) / (bowl.bottom - bowl.rim);
  }

  // is the pointer over the bowl (or the air just above it)?
  function pointerInBowl() {
    if (!pointer.active) return false;
    const y = pointer.y - world.shift;
    return Math.abs(pointer.x - bowl.cx) < bowl.R && y > bowl.rim - bowl.R * 0.4 && y < p.height;
  }

  function makeRock(size, tex = p.random(textures)) {
    const scale = size * sizeScale() / Math.sqrt(tex.w * tex.h);
    return { img: tex.img, w: tex.w * scale, h: tex.h * scale, angle: p.random(-p.PI, p.PI) };
  }

  // A new grain falls from above the top of the screen into the bowl: anywhere
  // over it, or around the pointer while that is over the bowl.
  function spawnRock(nearPointer) {
    const r = makeRock(p.random(ROCK_SIZE[0], ROCK_SIZE[1]));
    r.ox = 0;
    r.oy = 0;
    r.slope = Math.tan(p.radians(p.random(REPOSE_ANGLE[0], REPOSE_ANGLE[1])));
    const x = nearPointer ? pointer.x + p.randomGaussian(0, bowl.R * 0.3) : bowl.cx + p.random(-1, 1) * bowl.R;
    r.x = p.constrain(x, bowl.cx - bowl.R * 0.95, bowl.cx + bowl.R * 0.95);
    r.y = -world.shift - p.random(20, 120);
    r.vx = p.random(-0.3, 0.3);
    r.vy = p.random(0, 3);
    r.spin = p.random(-0.08, 0.08);
    r.bounced = false;
    r.state = 'falling';
    rocks.push(r);
  }

  // the slope of the ground under a grain: + going down to the right
  function slopeAt(r) {
    const e = Math.max(COL, r.w * 0.5);
    return (restY(r, r.x + e) - restY(r, r.x - e)) / (2 * e);
  }

  function updateRocks() {
    for (const r of rocks) {
      if (r.state === 'falling') {
        r.vy = Math.min(r.vy + FALL_GRAVITY, FALL_MAX);
        r.y += r.vy;
        r.x = p.constrain(r.x + r.vx, bowl.cx - bowl.R, bowl.cx + bowl.R);
        r.angle += r.spin;
        const ground = restY(r, r.x);
        if (r.y >= ground) {
          r.y = ground;
          // part of the fall turns into running down the slope it hit
          r.vx += slopeAt(r) * r.vy * SLIDE_KICK;
          if (!r.bounced && r.vy > BOUNCE_MIN) {
            r.bounced = true;   // one small hop, then it runs
            r.vy = -r.vy * p.random(BOUNCE[0], BOUNCE[1]);
            r.vx *= 0.8;
            r.y -= 1;
          } else {
            r.state = 'rolling';
          }
        }
        continue;
      }
      if (r.state !== 'rolling') continue;
      // look half a rock-width to each side, so small dips between rocks don't
      // stop it and it can't balance on top of another: it rolls towards the
      // lower side while that side drops more steeply than it can rest on
      const reach = Math.max(COL, r.w * 0.5);
      const here = restY(r, r.x);
      const dropL = restY(r, r.x - reach) - here, dropR = restY(r, r.x + reach) - here;
      const [dir, drop] = dropL > dropR ? [-1, dropL] : [1, dropR];
      const steep = drop > reach * r.slope;
      if (steep) r.vx += dir * (drop / reach) * ROLL_PULL;
      r.vx = p.constrain(r.vx * ROLL_FRICTION, -ROLL_MAX, ROLL_MAX);
      r.x = p.constrain(r.x + r.vx, bowl.cx - bowl.R, bowl.cx + bowl.R);
      r.y = restY(r, r.x);
      r.angle += r.vx / (r.w * 0.5);   // turning as it rolls
      if (!steep && Math.abs(r.vx) < 0.12) {
        r.state = 'rest';
        addToSurface(r);
      }
    }
  }

  // Every rock is drawn slightly pulled towards the pointer, easing in and out,
  // without changing where it actually rests.
  function drawRocks() {
    for (const r of rocks) {
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
      r.ox += (tx - r.ox) * 0.06;
      r.oy += (ty - r.oy) * 0.06;
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

  // ----- the microbes -----
  // Scattered above the title, scarce at first and denser further up, free to
  // overlap. Each is sized, stretched and mirrored at random. Some wander
  // slowly around their spot, others only twitch in place.

  function placeMicrobes() {
    microbes = [];
    if (!microbeTextures.length) return;
    const bottom = -microbesStart + p.height * MICROBES_EARLY;   // met while the title is leaving
    const top = -microbesTop + p.height * 0.02;
    const count = MICROBE_PER_KIND * microbeTextures.length;
    // every kind turns up MICROBE_PER_KIND times, in a random order
    const kinds = p.shuffle(microbeTextures.flatMap((_, k) => Array(MICROBE_PER_KIND).fill(k)));
    for (let i = 0; i < count; i++) {
      const tex = microbeTextures[kinds[i]];
      const size = p.random(MICROBE_SIZE[0], MICROBE_SIZE[1]) * sizeScale();
      const scale = size / Math.sqrt(tex.w * tex.h);
      const m = {
        tex, size,
        w: tex.w * scale * p.random(MICROBE_STRETCH[0], MICROBE_STRETCH[1]),
        h: tex.h * scale * p.random(MICROBE_STRETCH[0], MICROBE_STRETCH[1]),
        flip: p.random() < 0.5 ? -1 : 1,
        wander: p.random() < 0.5,
        base: p.random(-0.6, 0.6),
        seed: p.random(1000),
        glow: 0, label: 0,
      };
      // the room it may take up, turned any way and wandering as far as it can
      m.room = Math.hypot(m.w, m.h) / 2 + (m.wander ? MICROBE_DRIFT : 6);
      for (let k = 0; k < MICROBE_TRIES; k++) {
        // 0 at the bottom → 1 at the top; the first one right at the bottom, so it is met at once
        const height = i === 0 && k === 0 ? 0 : Math.pow(p.random(), 1 / MICROBE_CROWDING);
        m.hx = p.random(size * 0.3, p.width - size * 0.3);
        m.hy = bottom + (top - bottom) * height;
        if (microbes.every((o) => Math.hypot(o.hx - m.hx, o.hy - m.hy) > o.room + m.room)) {
          microbes.push(m);
          break;
        }
      }
    }
  }

  function moveMicrobes(t) {
    for (const m of microbes) {
      if (m.wander) {
        m.x = m.hx + (p.noise(m.seed, t * 0.04) - 0.5) * 2 * MICROBE_DRIFT;
        m.y = m.hy + (p.noise(m.seed + 50, t * 0.04) - 0.5) * 2 * MICROBE_DRIFT;
        m.angle = m.base + (p.noise(m.seed + 100, t * 0.05) - 0.5) * 0.8;
        m.squash = 1;
      } else {
        m.x = m.hx + (p.noise(m.seed, t * 0.35) - 0.5) * 12;
        m.y = m.hy + (p.noise(m.seed + 50, t * 0.35) - 0.5) * 12;
        m.angle = m.base + Math.sin(t * 1.3 + m.seed) * 0.06;
        m.squash = 1 + Math.sin(t * 1.7 + m.seed * 3) * 0.04;   // breathing in place
      }
    }
  }

  // the microbe under the pointer, if any (tested in its own rotated frame)
  function hoveredMicrobe() {
    if (!pointer.active && performance.now() > pointer.tapUntil) return null;
    for (let i = microbes.length - 1; i >= 0; i--) {
      const m = microbes[i];
      const dx = pointer.x - m.x, dy = pointer.y - (m.y + world.shift);
      const c = Math.cos(-m.angle), s = Math.sin(-m.angle);
      const lx = dx * c - dy * s, ly = dx * s + dy * c;
      if ((lx / (m.w * 0.45)) ** 2 + (ly / (m.h * 0.45)) ** 2 < 1) return m;
    }
    return null;
  }

  function drawMicrobes(hovered) {
    const ctx = p.drawingContext;
    const t = p.millis() / 1000;
    const pulse = 0.5 - 0.5 * Math.cos(t * p.TWO_PI / FIRST_GLOW_PERIOD);
    for (const m of microbes) {
      m.glow += ((m === hovered ? 1 : 0) - m.glow) * 0.08;
      m.label = m === hovered ? Math.min(1, m.label + 0.035) : Math.max(0, m.label - 0.08);
      const y = m.y + world.shift;
      if (y + m.size < -60 || y - m.size > p.height + 60) continue;
      p.push();
      p.translate(m.x, y);
      p.rotate(m.angle);
      p.scale(m.flip * m.squash, 1 / m.squash);
      if (m.glow > 0.01) {
        ctx.shadowColor = `rgba(255, 240, 215, ${m.glow * (0.4 + 0.3 * pulse)})`;
        ctx.shadowBlur = m.glow * (12 + 12 * pulse);
      }
      const k = 1 + 0.04 * m.glow;
      p.image(m.tex.img, 0, 0, m.w * k, m.h * k);
      p.pop();
      if (m.label > 0) drawLabel(m, y);
    }
  }

  // A thin line grows out of the microbe, bends, and runs under its name.
  function drawLabel(m, y) {
    const ctx = p.drawingContext;
    const size = Math.round(p.constrain(p.width / 90, 13, 16));
    ctx.save();
    ctx.font = `${size}px ${LABEL_FONT}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.12em';
    const textW = ctx.measureText(m.tex.name).width;
    const dir = m.x + m.w * 0.4 + 40 + textW > p.width - 16 ? -1 : 1;

    const ax = m.x + dir * m.w * 0.32, ay = y - m.h * 0.32;   // on the microbe's shoulder
    const ex = ax + dir * 34, ey = ay - 34;                   // the bend
    const fx = ex + dir * (textW + 12);
    const l1 = Math.hypot(ex - ax, ey - ay), l2 = Math.abs(fx - ex);
    const grown = ramp(m.label, 0, 0.7) * (l1 + l2);

    ctx.strokeStyle = 'rgba(245, 238, 225, 0.85)';
    ctx.lineWidth = 0.75;
    ctx.shadowColor = 'rgba(255, 245, 225, 0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    if (grown <= l1) {
      ctx.lineTo(ax + (ex - ax) * grown / l1, ay + (ey - ay) * grown / l1);
    } else {
      ctx.lineTo(ex, ey);
      ctx.lineTo(ex + dir * (grown - l1), ey);
    }
    ctx.stroke();

    ctx.globalAlpha = ramp(m.label, 0.55, 1);
    ctx.fillStyle = 'rgb(245, 238, 225)';
    ctx.shadowBlur = 8;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = dir > 0 ? 'left' : 'right';
    ctx.fillText(m.tex.name, ex + dir * 6, ey - 7);
    ctx.restore();
  }

  function addMicrobeTexture(raw, i) {
    const trimmed = trim(raw);
    microbeTextures.push({
      img: shrink(trimmed, MICROBE_TEXTURE_MAX), w: trimmed.width, h: trimmed.height,
      name: MICROBE_FILES[i].replace(/^[^_]*_/, '').replace(/\.png$/i, ''),   // microbo_NAME.png
    });
  }

  // From here on this is the microbi chapter: its address, its buttons, its
  // place in the menu; and the flamingo chapter's first frame starts loading.
  function becomeMicrobi() {
    if (START === 'bowl') {
      history.replaceState(null, '', MICROBES_PAGE);
      document.title = 'Lithium Metamorphosis — Microbi';
      document.querySelectorAll('#back-btn, #next-btn').forEach((el) => el.remove());
      renderNavButtons();
      const tiles = document.querySelectorAll('.menu-tile');
      tiles.forEach((tile) => tile.classList.remove('current'));
      tiles[CHAPTER_ORDER.indexOf(MICROBES_PAGE)]?.classList.add('current');
    }
    document.getElementById('above').src = NEXT_SCENE_FRAME;
  }

  // ----- setup and main loop -----

  p.setup = () => {
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.imageMode(p.CENTER);

    rockImages.forEach((raw, i) => {
      if (!raw) return;
      const trimmed = trim(raw);
      textures.push({
        img: shrink(trimmed, ROCK_TEXTURE_MAX), w: trimmed.width, h: trimmed.height, file: ROCK_FILES[i],
      });
    });
    microbeImages.forEach((raw, i) => { if (raw) addMicrobeTexture(raw, i); });
    // primordiale fetches them while the rocks fall, ready for when it reaches them
    if (START === 'bowl') {
      MICROBE_FILES.forEach((file, i) => {
        p.loadImage('../assets/images/' + encodeURIComponent(file), (img) => addMicrobeTexture(img, i), () => {});
      });
    }

    // A small seed stone waits at the bottom of the bowl.
    makeBowl();
    first = makeRock(FIRST_ROCK_SIZE, textures.find((tex) => tex.file === FIRST_ROCK_FILE) || textures[0]);
    first.angle = 0;
    first.x = bowl.cx;
    first.y = restY(first, first.x);
    first.ox = first.oy = 0;
    first.state = 'rest';
    addToSurface(first);
    rocks.push(first);

    riseTop = p.height * CAMERA_RISE;
    microbesStart = riseTop + p.height * TITLE_OUT;
    microbesTop = microbesStart + p.height * MICROBE_SCREENS;
    if (START === 'microbes') placeMicrobes();   // primordiale never reaches them
    startedAt = lastFrame = performance.now();

    if (START === 'bowl') setShift(0);   // the title waits above, out of view

    // microbi.html: the title has just gone and the camera is already rising
    if (START === 'microbes') {
      phase = 'microbes';
      rocks = [];
      setShift(microbesStart);
      cameraSpeed = p.height / MICROBE_PACE;
      becomeMicrobi();
    }
  };

  function setShift(shift) {
    world.shift = shift;
    const style = document.body.style;
    style.setProperty('--shift', Math.min(shift, p.height * 1.3).toFixed(1));   // the photo only reaches so far
    style.setProperty('--depth', (0.5 * Math.min(1, shift / riseTop) +
      0.5 * p.constrain((shift - riseTop) / (microbesTop - riseTop), 0, 1)).toFixed(3));
    style.setProperty('--title-shift', (shift - riseTop).toFixed(1));
  }

  // among the microbes the light slowly warms, 0 → 1
  function setWarmth(k) {
    const style = document.body.style;
    style.setProperty('--warm', k.toFixed(3));
    const c = BG_DARK.map((v, i) => Math.round(v + (BG_WARM[i] - v) * k));
    style.backgroundColor = `rgb(${c.join(',')})`;
  }

  p.draw = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    const t = (now - startedAt) / 1000;

    // rocks keep coming until the title appears: a few on their own, many
    // more while the pointer is over the bowl
    if (phase === 'bowl' || phase === 'rise' || phase === 'title' || phase === 'beyond') {
      const hovering = phase === 'bowl' && pointerInBowl();
      if (phase === 'bowl' && rocks.length < MAX_ROCKS && fill() < BOWL_FULL) {
        spawnDebt += dt * (hovering ? HOVER_RATE
          : p.lerp(SPAWN_RATE[0], SPAWN_RATE[1], ramp(t, SPAWN_RAMP[0], SPAWN_RAMP[1])));
        // the very first one comes soon, so the scene doesn't sit still
        if (!hasDropped && t > 1.5) spawnDebt = Math.max(spawnDebt, 1);
        while (spawnDebt >= 1) {
          spawnDebt -= 1;
          hasDropped = true;
          spawnRock(hovering);
        }
      }
      updateRocks();
    }

    if (phase === 'bowl' && captionsEndedAt && now - captionsEndedAt > CAMERA_DELAY * 1000) {
      phase = 'rise';
      riseStartedAt = now;
      // the camera will stop, with the title in the middle of the screen, just
      // as the highest rock in the bowl has gone below it
      riseTop = p.height - Math.min(...surface) + RISE_MARGIN;
      microbesStart = riseTop + p.height * TITLE_OUT;
      microbesTop = microbesStart + p.height * MICROBE_SCREENS;
      placeMicrobes();   // the first ones are met while the title leaves
    }

    // up from the bowl, easing to a stop as the rocks go
    if (phase === 'rise') {
      const k = Math.min(1, (now - riseStartedAt) / (RISE_TIME * 1000));
      setShift(riseTop * k * k * (3 - 2 * k));
      if (k >= 1) {
        phase = 'title';
        titleAt = now;
        document.getElementById('chapter-title').classList.add('shown');
      }
    }
    if (phase === 'title' && now - titleAt > TITLE_HOLD * 1000) {
      phase = 'beyond';
      cameraSpeed = 0;
      document.getElementById('chapter-title').classList.remove('shown');   // blurs out as it came
    }

    // on again, gathering speed to the pace the microbes go on with: past the
    // title and on among the microbes without a break
    if (phase === 'beyond') {
      cameraSpeed = Math.min(p.height / MICROBE_PACE, cameraSpeed + p.height / MICROBE_PACE * dt / CAMERA_START);
      setShift(world.shift + cameraSpeed * dt);
      if (world.shift >= microbesStart) {
        phase = 'microbes';
        rocks = [];   // long out of sight
        if (!microbes.length) placeMicrobes();
        becomeMicrobi();
      }
    }

    // The camera rises through the microbes and waits while one is being read;
    // the light warms with the height. At the top it keeps going, a little
    // faster, up out of the ground.
    const hovered = phase === 'microbes' ? hoveredMicrobe() : null;
    document.body.classList.toggle('over-microbe', !!hovered);
    if (phase === 'microbes' || phase === 'emerge') {
      const pace = p.height / MICROBE_PACE * (phase === 'emerge' ? EMERGE_SPEED : 1);
      cameraSpeed += ((hovered ? 0 : pace) - cameraSpeed) * Math.min(1, dt * 1.5);
      setShift(world.shift + cameraSpeed * dt);
      setWarmth(ramp(world.shift, microbesStart, microbesTop));
      if (phase === 'microbes' && world.shift >= microbesTop) phase = 'emerge';
    }
    // the flamingo chapter's first frame comes down from above until it fills the screen
    if (phase === 'emerge') {
      const up = Math.min(p.height, world.shift - microbesTop);
      document.getElementById('above').style.transform = `translateY(${(up - p.height).toFixed(1)}px)`;
      document.body.style.setProperty('--emerge', (up / p.height).toFixed(3));
      if (up >= p.height) {
        phase = 'leaving';
        window.location.href = NEXT_SCENE;   // no fade: that page starts on this frame
      }
    }

    moveMicrobes(t);
    p.clear();
    if (rocks.length) drawRocks();
    drawMicrobes(hovered);
  };

  // A resize or a phone turned sideways rebuilds what hasn't been seen yet:
  // the bowl while it is still on screen, the microbes until we reach them.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    if (phase === 'bowl' && first) {   // (not before setup has made the first rock)
      makeBowl();
      rocks = [first];
      first.x = bowl.cx;
      first.y = restY(first, first.x);
      addToSurface(first);
    }
    if (phase === 'bowl' || phase === 'rise' || phase === 'title' || phase === 'beyond') {
      if (phase === 'bowl') riseTop = p.height * CAMERA_RISE;   // measured again when the rise starts
      microbesStart = riseTop + p.height * TITLE_OUT;
      microbesTop = microbesStart + p.height * MICROBE_SCREENS;
      if (START === 'microbes') placeMicrobes();
    }
  };
}
