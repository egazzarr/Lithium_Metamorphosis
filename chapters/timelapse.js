/*
  The lithium salt timelapse: annual world and Chile lithium mine production,
  1995–2025, poured as grains, then Chile's 2023 refining mix as a grain-filled
  donut. Copied from lithium_timelapse_collaboration/02_latest_plot_and_compounds/
  lithium_salt_timelapse_latest.html (its README, NOTES.md and SOURCES.md hold
  the data notes and the source of every value), with these changes for the
  dataviz chapter:
    - it draws on a transparent canvas, over the chapter's background photo,
      instead of on black;
    - it uses the site's Lato, Light and a fifth bigger (TEXT_SCALE), instead
      of Lato 250 from Google Fonts, to read better over the photo;
    - the world's sand is a bright sandy orange, Chile's stays white, and both
      have the same grain (Chile's): only the colour tells them apart;
    - on a portrait screen (a phone held upright) the plot shrinks to the top
      half and the donut sits below it, instead of side by side;
    - it waits, hidden, until dataviz.js calls startTimelapse() as the news fly
      away, then plays by itself; a click replays it once it has finished.
*/

(() => {
  'use strict';
  // Each annual point uses the current-year column in the next year's USGS MCS.
  // The companion CSV identifies the source PDF for every observation.
  const DATA = [{"year":1995,"world_annual_tonnes_Li":6300,"chile_annual_tonnes_Li":2100,"world_cumulative_since_1995_tonnes_Li":6300,"chile_cumulative_since_1995_tonnes_Li":2100},{"year":1996,"world_annual_tonnes_Li":6600,"chile_annual_tonnes_Li":2100,"world_cumulative_since_1995_tonnes_Li":12900,"chile_cumulative_since_1995_tonnes_Li":4200},{"year":1997,"world_annual_tonnes_Li":11000,"chile_annual_tonnes_Li":4500,"world_cumulative_since_1995_tonnes_Li":23900,"chile_cumulative_since_1995_tonnes_Li":8700},{"year":1998,"world_annual_tonnes_Li":16000,"chile_annual_tonnes_Li":4500,"world_cumulative_since_1995_tonnes_Li":39900,"chile_cumulative_since_1995_tonnes_Li":13200},{"year":1999,"world_annual_tonnes_Li":15000,"chile_annual_tonnes_Li":5000,"world_cumulative_since_1995_tonnes_Li":54900,"chile_cumulative_since_1995_tonnes_Li":18200},{"year":2000,"world_annual_tonnes_Li":13000,"chile_annual_tonnes_Li":5500,"world_cumulative_since_1995_tonnes_Li":67900,"chile_cumulative_since_1995_tonnes_Li":23700},{"year":2001,"world_annual_tonnes_Li":15100,"chile_annual_tonnes_Li":6400,"world_cumulative_since_1995_tonnes_Li":83000,"chile_cumulative_since_1995_tonnes_Li":30100},{"year":2002,"world_annual_tonnes_Li":15100,"chile_annual_tonnes_Li":6800,"world_cumulative_since_1995_tonnes_Li":98100,"chile_cumulative_since_1995_tonnes_Li":36900},{"year":2003,"world_annual_tonnes_Li":14200,"chile_annual_tonnes_Li":5900,"world_cumulative_since_1995_tonnes_Li":112300,"chile_cumulative_since_1995_tonnes_Li":42800},{"year":2004,"world_annual_tonnes_Li":15500,"chile_annual_tonnes_Li":6600,"world_cumulative_since_1995_tonnes_Li":127800,"chile_cumulative_since_1995_tonnes_Li":49400},{"year":2005,"world_annual_tonnes_Li":20400,"chile_annual_tonnes_Li":8000,"world_cumulative_since_1995_tonnes_Li":148200,"chile_cumulative_since_1995_tonnes_Li":57400},{"year":2006,"world_annual_tonnes_Li":21100,"chile_annual_tonnes_Li":8300,"world_cumulative_since_1995_tonnes_Li":169300,"chile_cumulative_since_1995_tonnes_Li":65700},{"year":2007,"world_annual_tonnes_Li":25000,"chile_annual_tonnes_Li":9400,"world_cumulative_since_1995_tonnes_Li":194300,"chile_cumulative_since_1995_tonnes_Li":75100},{"year":2008,"world_annual_tonnes_Li":27400,"chile_annual_tonnes_Li":12000,"world_cumulative_since_1995_tonnes_Li":221700,"chile_cumulative_since_1995_tonnes_Li":87100},{"year":2009,"world_annual_tonnes_Li":18000,"chile_annual_tonnes_Li":7400,"world_cumulative_since_1995_tonnes_Li":239700,"chile_cumulative_since_1995_tonnes_Li":94500},{"year":2010,"world_annual_tonnes_Li":25300,"chile_annual_tonnes_Li":8800,"world_cumulative_since_1995_tonnes_Li":265000,"chile_cumulative_since_1995_tonnes_Li":103300},{"year":2011,"world_annual_tonnes_Li":34000,"chile_annual_tonnes_Li":12600,"world_cumulative_since_1995_tonnes_Li":299000,"chile_cumulative_since_1995_tonnes_Li":115900},{"year":2012,"world_annual_tonnes_Li":37000,"chile_annual_tonnes_Li":13000,"world_cumulative_since_1995_tonnes_Li":336000,"chile_cumulative_since_1995_tonnes_Li":128900},{"year":2013,"world_annual_tonnes_Li":35000,"chile_annual_tonnes_Li":13500,"world_cumulative_since_1995_tonnes_Li":371000,"chile_cumulative_since_1995_tonnes_Li":142400},{"year":2014,"world_annual_tonnes_Li":36000,"chile_annual_tonnes_Li":12900,"world_cumulative_since_1995_tonnes_Li":407000,"chile_cumulative_since_1995_tonnes_Li":155300},{"year":2015,"world_annual_tonnes_Li":32500,"chile_annual_tonnes_Li":11700,"world_cumulative_since_1995_tonnes_Li":439500,"chile_cumulative_since_1995_tonnes_Li":167000},{"year":2016,"world_annual_tonnes_Li":35000,"chile_annual_tonnes_Li":12000,"world_cumulative_since_1995_tonnes_Li":474500,"chile_cumulative_since_1995_tonnes_Li":179000},{"year":2017,"world_annual_tonnes_Li":43000,"chile_annual_tonnes_Li":14100,"world_cumulative_since_1995_tonnes_Li":517500,"chile_cumulative_since_1995_tonnes_Li":193100},{"year":2018,"world_annual_tonnes_Li":85000,"chile_annual_tonnes_Li":16000,"world_cumulative_since_1995_tonnes_Li":602500,"chile_cumulative_since_1995_tonnes_Li":209100},{"year":2019,"world_annual_tonnes_Li":77000,"chile_annual_tonnes_Li":18000,"world_cumulative_since_1995_tonnes_Li":679500,"chile_cumulative_since_1995_tonnes_Li":227100},{"year":2020,"world_annual_tonnes_Li":82000,"chile_annual_tonnes_Li":18000,"world_cumulative_since_1995_tonnes_Li":761500,"chile_cumulative_since_1995_tonnes_Li":245100},{"year":2021,"world_annual_tonnes_Li":100000,"chile_annual_tonnes_Li":26000,"world_cumulative_since_1995_tonnes_Li":861500,"chile_cumulative_since_1995_tonnes_Li":271100},{"year":2022,"world_annual_tonnes_Li":130000,"chile_annual_tonnes_Li":39000,"world_cumulative_since_1995_tonnes_Li":991500,"chile_cumulative_since_1995_tonnes_Li":310100},{"year":2023,"world_annual_tonnes_Li":180000,"chile_annual_tonnes_Li":44000,"world_cumulative_since_1995_tonnes_Li":1171500,"chile_cumulative_since_1995_tonnes_Li":354100},{"year":2024,"world_annual_tonnes_Li":240000,"chile_annual_tonnes_Li":49000,"world_cumulative_since_1995_tonnes_Li":1411500,"chile_cumulative_since_1995_tonnes_Li":403100},{"year":2025,"world_annual_tonnes_Li":290000,"chile_annual_tonnes_Li":56000,"world_cumulative_since_1995_tonnes_Li":1701500,"chile_cumulative_since_1995_tonnes_Li":459100}];
  const REFINING_2023 = Object.freeze({ carbonate: .82, hydroxide: .11, sulfate: .07 });
  const timelapse = document.getElementById('timelapse');
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const promptNode = document.getElementById('prompt');
  const accessibleStatus = document.getElementById('accessible-status');
  const startYear = DATA[0].year;
  const endYear = DATA[DATA.length - 1].year;
  const axisMax = 350000;
  const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const world = d => d.world_annual_tonnes_Li;
  const chile = d => d.chile_annual_tonnes_Li;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const TAU = Math.PI * 2;
  const START_ANGLE = -Math.PI / 2;
  const timings = { world: 15600, pause: 600, highlight: 2300, hold: 2700, split: 2700, flow: 6600 };
  const TEXT_FONT = "'Lato Light', Lato, sans-serif";
  const SAND = { world: '244,152,64', chile: '255,255,251' };   // r,g,b: bright sandy orange, white
  const sand = (accessor, alpha) => `rgba(${accessor === chile ? SAND.chile : SAND.world},${alpha})`;
  const TEXT_SCALE = 1.2;
  let W = 0, H = 0, dpr = 1, portrait = false, fullPlot, smallPlot, worldPattern, chilePattern;
  let donutLayer, donutLayerContext, donutLayerPad = 0, nextDeposit = 0, depositedProgress = 0;
  let phase = 'ready', started = 0, previousFrame = 0, frameId = 0;
  let falling = [], spawnCarry = 0, lastAnnouncedYear = -1;

  function rng(seed) { let s = seed >>> 0; return () => ((s = Math.imul(1664525, s) + 1013904223 | 0) >>> 0) / 4294967296; }
  const random = rng(294517);
  function valueAt(year, accessor) {
    const i = clamp(Math.floor(year - startYear), 0, DATA.length - 1);
    if (i === DATA.length - 1) return accessor(DATA[i]);
    return lerp(accessor(DATA[i]), accessor(DATA[i + 1]), clamp(year - DATA[i].year, 0, 1));
  }
  function plotAt(split) {
    const p = {};
    for (const key of ['l', 'r', 't', 'b']) p[key] = lerp(fullPlot[key], smallPlot[key], split);
    p.w = p.r - p.l; p.h = p.b - p.t;
    return p;
  }
  function xFinal(year, p) { return p.l + (year - startYear) / (endYear - startYear) * p.w; }
  function xAt(year, currentYear, p) { return xFinal(year, p) + (endYear - currentYear) / (endYear - startYear) * p.w; }
  function yOf(value, p) { return p.b - value / axisMax * p.h; }

  function drawRock(g, x, y, radius, color, seed) {
    const corners = 5 + (seed % 3);
    const rotation = ((seed * 9973) % 6283) / 1000;
    g.fillStyle = color;
    g.beginPath();
    for (let i = 0; i < corners; i++) {
      const h = (Math.imul(seed ^ (i * 374761393), 1664525) >>> 0) / 4294967296;
      const angle = rotation + i * TAU / corners;
      const r = radius * (.65 + .55 * h);
      const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fill();
  }
  function makeRockTile(seed, accessor) {
    const side = 384, tile = document.createElement('canvas');
    tile.width = side; tile.height = side;
    const g = tile.getContext('2d'), rr = rng(seed);
    const attempts = 43000;
    for (let i = 0; i < attempts; i++) {
      const x = rr() * side, y = rr() * side;
      const patch = .5 + .25 * Math.sin(TAU * 3 * x / side) + .25 * Math.sin(TAU * 4 * y / side + 1.2);
      if (rr() > .39 + .53 * patch) continue;
      const large = rr() < .12;
      const radius = large ? 1.25 + rr() * 2.2 : .48 + rr() * 1.32;
      const color = sand(accessor, .39 + rr() * .58);
      const rockSeed = Math.floor(rr() * 1000000);
      drawRock(g, x, y, radius, color, rockSeed);
      if (x < 4) drawRock(g, x + side, y, radius, color, rockSeed);
      if (x > side - 4) drawRock(g, x - side, y, radius, color, rockSeed);
      if (y < 4) drawRock(g, x, y + side, radius, color, rockSeed);
      if (y > side - 4) drawRock(g, x, y - side, radius, color, rockSeed);
    }
    return ctx.createPattern(tile, 'repeat');
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(W * dpr); canvas.height = Math.ceil(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = W < 850;
    portrait = H > W * 1.15;
    fullPlot = { l: narrow ? 60 : Math.max(82, W * .072), r: W - (narrow ? 92 : Math.max(125, W * .13)), t: Math.max(95, H * .14), b: H - Math.max(99, H * .16) };
    if (portrait) {
      // the plot shrinks into the top half, keeping its proportions; the donut goes below
      const scale = Math.min(1, (H * .36) / (fullPlot.b - fullPlot.t));
      const smallW = (fullPlot.r - fullPlot.l) * scale, smallH = (fullPlot.b - fullPlot.t) * scale;
      const smallT = Math.max(95, H * .13);
      smallPlot = { l: fullPlot.l, r: fullPlot.l + smallW, t: smallT, b: smallT + smallH };
    } else {
      const smallL = narrow ? 52 : Math.max(62, W * .052), smallR = W * .445;
      const uniformScale = (smallR - smallL) / (fullPlot.r - fullPlot.l);
      const smallH = (fullPlot.b - fullPlot.t) * uniformScale;
      const smallT = H * .51 - smallH / 2;
      smallPlot = { l: smallL, r: smallR, t: smallT, b: smallT + smallH };
    }
    worldPattern = makeRockTile(14201, world);
    chilePattern = makeRockTile(28870, chile);
    resetDonutLayer();
    if (phase === 'ready') render(0, 0);
    else if (phase === 'done') render(Infinity, 0);
  }
  function thinText(text, x, y, options = {}) {
    ctx.save();
    ctx.fillStyle = options.color || '#f6f6f4';
    ctx.font = `${(options.size || 13) * TEXT_SCALE}px ${TEXT_FONT}`;
    ctx.textAlign = options.align || 'left'; ctx.textBaseline = options.baseline || 'middle';
    ctx.fillText(text, x, y); ctx.restore();
  }
  function axes(currentYear, p) {
    ctx.save(); ctx.strokeStyle = '#d8d8d5'; ctx.lineWidth = .55;
    ctx.beginPath(); ctx.moveTo(p.l, p.t); ctx.lineTo(p.l, p.b); ctx.lineTo(p.r, p.b); ctx.stroke();
    for (const v of [0, 100000, 200000, 300000]) {
      const y = yOf(v, p);
      ctx.beginPath(); ctx.moveTo(p.l - 4, y); ctx.lineTo(p.l, y); ctx.stroke();
      thinText(v ? `${v / 1000}k` : '0', p.l - 9, y, { size: W < 850 ? 10 : 12, align: 'right', color: '#d8d8d5' });
    }
    thinText('t Li / year', p.l + 3, p.t - 17, { size: W < 850 ? 10 : 11, color: '#d8d8d5' });
    const step = W < 850 ? 10 : 5;
    for (let year = startYear; year <= currentYear + .00001; year += step) {
      const x = xAt(year, currentYear, p);
      if (x < p.l - 1 || x > p.r + 1) continue;
      ctx.beginPath(); ctx.moveTo(x, p.b); ctx.lineTo(x, p.b + 5); ctx.stroke();
      thinText(String(year), x, p.b + 15, { size: W < 850 ? 10 : 12, align: 'center', color: '#dadad7' });
    }
    ctx.restore();
  }
  // Explicit lineTo vertices retain every reported annual rise and dip.
  function shapePath(currentYear, accessor, p) {
    const firstX = xAt(startYear, currentYear, p);
    ctx.beginPath(); ctx.moveTo(firstX, p.b);
    ctx.lineTo(firstX, yOf(accessor(DATA[0]), p));
    for (const d of DATA) {
      if (d.year > currentYear) break;
      ctx.lineTo(xAt(d.year, currentYear, p), yOf(accessor(d), p));
    }
    if (currentYear < endYear && currentYear % 1 > .00001) ctx.lineTo(p.r, yOf(valueAt(currentYear, accessor), p));
    ctx.lineTo(p.r, p.b); ctx.closePath();
  }
  function surfaceGrains(accessor, currentYear, p, seed, visibleLeft = p.l, visibleRight = p.r) {
    const rr = rng(seed);
    const count = Math.round(p.w * 3.4);
    for (let i = 0; i < count; i++) {
      const year = startYear + rr() * (endYear - startYear);
      const x = xAt(year, currentYear, p);
      const edge = accessor === chile && rr() < .24 ? p.b : yOf(valueAt(year, accessor), p);
      const scatter = (rr() < .55 ? -1 : 1) * Math.pow(rr(), 2.3) * 17;
      const y = edge + scatter;
      const radius = .23 + rr() * 1.12;
      if (x < visibleLeft || x > Math.min(p.r, visibleRight) || y < p.t - 10 || y > p.b + 13) continue;
      drawRock(ctx, x, y, radius, sand(accessor, .25 + rr() * .68), i + seed);
    }
  }
  function hairlineProfile(accessor, currentYear, p, visibleLeft = p.l, visibleRight = p.r) {
    ctx.save(); ctx.beginPath();
    ctx.rect(visibleLeft, p.t, Math.max(0, visibleRight - visibleLeft), p.h); ctx.clip();
    ctx.beginPath(); ctx.moveTo(xAt(startYear, currentYear, p), yOf(accessor(DATA[0]), p));
    for (const d of DATA) {
      if (d.year > currentYear) break;
      ctx.lineTo(xAt(d.year, currentYear, p), yOf(accessor(d), p));
    }
    if (currentYear < endYear && currentYear % 1 > .00001) ctx.lineTo(p.r, yOf(valueAt(currentYear, accessor), p));
    ctx.strokeStyle = sand(accessor, .16);
    ctx.lineWidth = .36; ctx.stroke(); ctx.restore();
  }
  function worldPile(currentYear, p) {
    if (currentYear <= startYear) return;
    ctx.save(); ctx.beginPath(); ctx.rect(p.l, p.t, p.w, p.h); ctx.clip();
    shapePath(currentYear, world, p);
    ctx.fillStyle = worldPattern; ctx.fill();
    ctx.restore();
    hairlineProfile(world, currentYear, p);
    surfaceGrains(world, currentYear, p, 42118);
  }
  function chilePile(highlight, drain, p) {
    if (highlight <= 0) return;
    ctx.save(); shapePath(endYear, chile, p); ctx.clip();
    // the Chile band is cut out of the world pile, down to the background photo
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(p.l, p.t, drain > 0 ? p.w : p.w * highlight, p.h);
    ctx.globalCompositeOperation = 'source-over';
    const visibleLeft = p.l + p.w * drain;
    const visibleRight = p.l + p.w * highlight;
    ctx.beginPath(); ctx.rect(visibleLeft, p.t, Math.max(0, visibleRight - visibleLeft), p.h); ctx.clip();
    ctx.fillStyle = chilePattern; ctx.fillRect(p.l, p.t, p.w, p.h);
    ctx.restore();
    hairlineProfile(chile, endYear, p, visibleLeft, visibleRight);
    surfaceGrains(chile, endYear, p, 61904, visibleLeft, visibleRight);
  }
  function labels(currentYear, highlight, split, p) {
    if (currentYear > startYear + .04) {
      const tipY = yOf(valueAt(currentYear, world), p);
      const labelY = Math.max(p.t + 12, tipY - 31);
      const title = 'WORLD PRODUCTION';
      const value = `${format.format(Math.round(valueAt(currentYear, world)))} t Li  ·  ${Math.floor(currentYear)}`;
      const titleSize = W < 850 ? 11 : 15, valueSize = W < 850 ? 10 : 14;
      // right-aligned at the tip, unless the plot is too narrow for it: then from the axis
      ctx.save();
      ctx.font = `${titleSize * TEXT_SCALE}px ${TEXT_FONT}`;
      const wide = ctx.measureText(title).width;
      ctx.font = `${valueSize * TEXT_SCALE}px ${TEXT_FONT}`;
      const widest = Math.max(wide, ctx.measureText(value).width);
      ctx.restore();
      const fits = p.r - 9 - widest > p.l + 6;
      const x = fits ? p.r - 9 : p.l + 8, align = fits ? 'right' : 'left';
      thinText(title, x, labelY, { align, size: titleSize });
      thinText(value, x, labelY + (W < 850 ? 19 : 24), { align, size: valueSize, color: '#d4d4d0' });
    }
    if (highlight > .7) {
      const y = (p.b + yOf(chile(DATA[DATA.length - 1]), p)) / 2;
      const x = p.r + (W < 850 ? 7 : 15);
      thinText('CHILE', x, y - 12, { size: W < 850 ? 11 : 15 });
      thinText('56,000 t Li', x, y + 12, { size: W < 850 ? 9 : 12, color: '#d4d4d0' });
    }
  }
  function spawnWorld(currentYear, p, delta) {
    spawnCarry += delta * (W < 850 ? 330 : 650) / 1000;
    let count = Math.min(70, Math.floor(spawnCarry)); spawnCarry -= count;
    while (count--) {
      const year = Math.max(startYear, currentYear - random() * .54);
      falling.push({ x: p.r + (random() - .5) * 65, year, y: -12 - random() * 75,
        speed: .55 + random() * .72, radius: .25 + random() * 1.1,
        alpha: .17 + random() * .6, drift: (random() - .5) * 19 });
    }
  }
  function drawWorldRain(currentYear, p, delta) {
    const remaining = [];
    ctx.save(); ctx.beginPath(); ctx.rect(p.l, 0, p.w, p.b); ctx.clip();
    for (const grain of falling) {
      grain.y += grain.speed * delta; grain.x += grain.drift * delta / 1000;
      if (grain.y > yOf(valueAt(grain.year, world), p) + 3) continue;
      if (grain.x >= p.l && grain.x <= p.r) {
        drawRock(ctx, grain.x, grain.y, grain.radius, sand(world, grain.alpha), Math.floor(grain.year * 1000));
      }
      remaining.push(grain);
    }
    ctx.restore(); falling = remaining.slice(-1300);
  }
  function donutGeometry() {
    if (portrait) {
      const R = Math.min(W * .3, H * .16);
      return { cx: W * .5, cy: H * .74, R, r: R * .53 };
    }
    const R = Math.min(W * .155, H * .245, (W * .5 - 45) * .47);
    return { cx: W * .755, cy: H * .61, R, r: R * .53 };
  }
  const donutGrains = (() => {
    const rr = rng(47421), result = [];
    for (let i = 0; i < 27000; i++) {
      const f = rr() * .93;
      const hydroxide = f >= REFINING_2023.carbonate;
      const radial = rr();
      const distance = Math.abs(f - .66) / .66;
      const arrival = clamp(.18 + .72 * Math.pow(distance, .76) + rr() * .08, .18, .995);
      result.push({ f, radial, edge: rr(), arrival,
        size: hydroxide ? 1.05 + rr() * 1.55 : .62 + rr() * 1.18,
        alpha: hydroxide ? .56 + rr() * .43 : .37 + rr() * .6,
        seed: Math.floor(rr() * 1000000), hydroxide });
    }
    return result.sort((a, b) => a.arrival - b.arrival);
  })();
  function resetDonutLayer() {
    const geo = donutGeometry();
    donutLayerPad = geo.R + 17;
    donutLayer = document.createElement('canvas');
    donutLayer.width = Math.ceil(2 * donutLayerPad * dpr);
    donutLayer.height = Math.ceil(2 * donutLayerPad * dpr);
    donutLayerContext = donutLayer.getContext('2d');
    donutLayerContext.setTransform(dpr, 0, 0, dpr, donutLayerPad * dpr, donutLayerPad * dpr);
    nextDeposit = 0; depositedProgress = 0;
  }
  function ringPosition(grain, geo, fraction = grain.f, radial = grain.radial) {
    const a = START_ANGLE + TAU * fraction;
    const edgeScatter = radial < .085 ? -(.085 - radial) * (.5 + grain.edge * 1.1)
      : radial > .915 ? (radial - .915) * (.5 + grain.edge * 1.1) : 0;
    const r = lerp(geo.r, geo.R, radial + edgeScatter)
      + 1.5 * Math.sin(a * 43 + grain.seed);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  }
  function updateDonutLayer(fill, geo) {
    if (fill < depositedProgress) {
      donutLayerContext.save(); donutLayerContext.setTransform(1, 0, 0, 1, 0, 0);
      donutLayerContext.clearRect(0, 0, donutLayer.width, donutLayer.height);
      donutLayerContext.restore(); nextDeposit = 0;
    }
    while (nextDeposit < donutGrains.length && donutGrains[nextDeposit].arrival <= fill) {
      const grain = donutGrains[nextDeposit];
      const pos = ringPosition(grain, geo);
      const color = grain.hydroxide ? `rgba(255,255,251,${grain.alpha})` : `rgba(229,230,224,${grain.alpha})`;
      drawRock(donutLayerContext, pos.x, pos.y, grain.size, color, grain.seed);
      nextDeposit++;
    }
    depositedProgress = fill;
  }
  function drawDonut(fill, split) {
    if (split < .12) return;
    const geo = donutGeometry();
    updateDonutLayer(fill, geo);
    ctx.save();
    ctx.drawImage(donutLayer, geo.cx - donutLayerPad, geo.cy - donutLayerPad,
      donutLayerPad * 2, donutLayerPad * 2);
    // A rock enters at the stream landing point, then rolls around the ring.
    if (fill > .05) {
      for (let i = nextDeposit; i < donutGrains.length; i++) {
        const grain = donutGrains[i];
        if (grain.arrival > fill + .055) break;
        const travel = clamp(1 - (grain.arrival - fill) / .055, 0, 1);
        const pos = ringPosition(grain, geo, lerp(.66, grain.f, ease(travel)), lerp(.73, grain.radial, travel));
        const color = grain.hydroxide ? `rgba(255,255,251,${grain.alpha})` : `rgba(229,230,224,${grain.alpha})`;
        drawRock(ctx, geo.cx + pos.x, geo.cy + pos.y, grain.size * .8, color, grain.seed);
      }
    }
    if (split > .7) {
      const alpha = clamp((split - .7) / .3, 0, 1);
      ctx.globalAlpha = alpha;
      if (W < 850) {
        thinText('LITHIUM', geo.cx, geo.cy - 8, { align: 'center', size: 9 });
        thinText('COMPOUNDS', geo.cx, geo.cy + 8, { align: 'center', size: 9 });
      } else thinText('LITHIUM COMPOUNDS', geo.cx, geo.cy, { align: 'center', size: 14 });
      if (fill > .55) thinText('LITHIUM CARBONATE  82%', geo.cx, geo.cy - geo.R - 21,
        { align: 'center', size: W < 850 ? 10 : 13 });
      // upright, there is no room at its side: below it instead
      if (fill > .67) {
        if (portrait) thinText('LITHIUM HYDROXIDE  11%', geo.cx, geo.cy + geo.R + 21, { align: 'center', size: 10 });
        else thinText('LITHIUM HYDROXIDE  11%', geo.cx - geo.R - 8, geo.cy - geo.R * .6,
          { align: 'right', size: W < 850 ? 9 : 12 });
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function cubic(a, b, c, d, t) { const u = 1 - t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d; }
  const transferGrains = (() => {
    const rr = rng(159220), grains = [];
    for (let i = 0; i < 1850; i++) {
      const start = rr() * .86;
      grains.push({ start, u: Math.min(.995, Math.max(.78 + rr() * .22, start + .055)),
        endpoint: rr(), wiggle: rr() * TAU, size: .35 + rr() * 1.2,
        alpha: .31 + rr() * .67, seed: Math.floor(rr() * 1000000) });
    }
    return grains;
  })();
  function drawTransfer(drain, p) {
    if (drain <= 0 || drain >= 1) return;
    const geo = donutGeometry();
    for (const grain of transferGrains) {
      const q = (drain - grain.start) / .18;
      if (q <= 0 || q >= 1) continue;
      const t = ease(q);
      const sourceYear = startYear + grain.u * (endYear - startYear);
      const x0 = xFinal(sourceYear, p);
      const y0 = yOf(valueAt(sourceYear, chile), p) + 3;
      const x3 = geo.cx - geo.R * (.4 + grain.endpoint * .45);
      const y3 = geo.cy + geo.R * (.25 + grain.endpoint * .45);
      const x = cubic(x0, p.r + 24, geo.cx - geo.R * 1.5, x3, t);
      const y = cubic(y0, p.b + H * .06, H * .81, y3, t)
        + Math.sin(t * 25 + grain.wiggle) * (1 - t) * 2.8;
      drawRock(ctx, x, y, grain.size, `rgba(251,251,247,${grain.alpha})`, grain.seed);
    }
  }
  function timeline(elapsed) {
    const scale = reducedMotion.matches ? .08 : 1;
    let t = elapsed / scale;
    const worldP = clamp(t / timings.world, 0, 1);
    t -= timings.world + timings.pause;
    const highlight = ease(clamp(t / timings.highlight, 0, 1));
    t -= timings.highlight + timings.hold;
    const split = ease(clamp(t / timings.split, 0, 1));
    t -= timings.split;
    const drain = ease(clamp(t / timings.flow, 0, 1));
    const complete = t >= timings.flow;
    return { currentYear: startYear + worldP * (endYear - startYear), worldP, highlight, split, drain, complete };
  }
  function render(elapsed, delta) {
    const state = timeline(elapsed);
    const p = plotAt(state.split);
    ctx.clearRect(0, 0, W, H);
    worldPile(state.currentYear, p);
    chilePile(state.highlight, state.drain, p);
    if (state.worldP < 1 && phase === 'running' && !reducedMotion.matches) {
      spawnWorld(state.currentYear, p, delta); drawWorldRain(state.currentYear, p, delta);
    }
    axes(state.currentYear, p);
    labels(state.currentYear, state.highlight, state.split, p);
    drawDonut(state.drain, state.split);
    drawTransfer(state.drain, p);
    const roundedYear = Math.floor(state.currentYear);
    if (phase === 'running' && roundedYear !== lastAnnouncedYear && roundedYear % 5 === 0) {
      accessibleStatus.textContent = `${roundedYear}: world ${format.format(Math.round(valueAt(state.currentYear, world)))} tonnes of lithium, Chile ${format.format(Math.round(valueAt(state.currentYear, chile)))} tonnes.`;
      lastAnnouncedYear = roundedYear;
    }
    return state.complete;
  }
  function frame(now) {
    if (phase !== 'running') return;
    const delta = clamp(now - previousFrame, 0, 50);
    previousFrame = now;
    const done = render(now - started, delta);
    if (done) {
      phase = 'done'; falling = []; render(Infinity, 0);
      promptNode.textContent = 'CLICK TO REPLAY'; promptNode.classList.remove('hidden');
      accessibleStatus.textContent = 'Completed. 2025 world mine production: 290,000 tonnes of lithium; Chile: 56,000 tonnes. Chilean refined lithium product mix in 2023: 82% carbonate, 11% hydroxide, 7% sulfate.';
    } else frameId = requestAnimationFrame(frame);
  }
  function play() {
    if (phase === 'running') return;
    cancelAnimationFrame(frameId); phase = 'running'; falling = []; spawnCarry = 0;
    resetDonutLayer();
    lastAnnouncedYear = -1; started = performance.now(); previousFrame = started;
    promptNode.classList.add('hidden'); frameId = requestAnimationFrame(frame);
  }

  // dataviz.js shows it and starts it as the news fly away
  window.startTimelapse = () => {
    timelapse.classList.add('shown');
    play();
  };
  document.body.addEventListener('click', event => {
    if (phase === 'done' && !event.target.closest('a, button, nav')) play();
  });
  canvas.addEventListener('keydown', event => {
    if (phase === 'done' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); play(); }
  });
  window.addEventListener('resize', resize);
  document.fonts.load(`16px ${TEXT_FONT}`).then(resize);   // the canvas text needs it loaded
  resize();
})();
