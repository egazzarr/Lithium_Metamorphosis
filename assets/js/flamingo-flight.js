// Flocks of flamingos seen from the front, flying straight past the viewer:
// half rising from below, half (upside down) coming down from above. Used at
// the end of the fauna chapter, where they thicken until they cover the view,
// and at the start of the orology chapter, where they thin out again.
//
//   const flight = new FlamingoFlight(container);
//   flight.rate = 20;     // flocks setting off per second; change it at any time
//   flight.fill(30);      // start with 30 already on their way
//
// All the flocks are drawn on one canvas, from the frames of flamingo_front.gif
// laid one under the other (tools/make_flight_frames.py): dozens of separate
// full-size gifs at once brought the page down to a few frames per second.

const FLIGHT_FRAMES = '../assets/images/flamingo_front_frames.png';
const FLIGHT_FRAME_COUNT = 8;
const FLIGHT_FRAME_TIME = 120;     // ms per frame, as in the gif
const FLIGHT_ASPECT = 1714 / 4096;
const FLIGHT_WIDTH = [0.8, 1.6];   // gif width, in screen widths
const FLIGHT_TIME = [2.4, 3.8];    // seconds a flock takes to cross the screen
const FLIGHT_MAX_DPR = 2;

class FlamingoFlight {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.sheet = new Image();
    this.sheet.src = FLIGHT_FRAMES;   // ready before the first one sets off
    this.rate = 0;
    this.birds = [];
    this.debt = 0;
    this.last = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const frame = (now) => { this.update(now); requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
  }

  get count() { return this.birds.length; }

  resize() {
    this.dpr = Math.min(FLIGHT_MAX_DPR, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(window.innerWidth * this.dpr);
    this.canvas.height = Math.round(window.innerHeight * this.dpr);
  }

  add(now, progress = 0) {
    const W = window.innerWidth;
    const between = (r) => r[0] + Math.random() * (r[1] - r[0]);
    const w = W * between(FLIGHT_WIDTH);
    const time = between(FLIGHT_TIME) * 1000;
    this.birds.push({
      w, h: w * FLIGHT_ASPECT, time,
      up: Math.random() < 0.5,
      x: Math.random() * W - w / 2,
      start: now - progress * time,
      phase: Math.random() * FLIGHT_FRAME_COUNT * FLIGHT_FRAME_TIME,   // each one flaps in its own time
    });
  }

  // n flocks already on their way, spread over the screen
  fill(n) {
    const now = performance.now();
    for (let i = 0; i < n; i++) this.add(now, Math.random());
  }

  draw(b, now) {
    const H = window.innerHeight;
    const k = (now - b.start) / b.time;
    if (k >= 1) return false;
    const y = b.up ? H - k * (H + b.h) : -b.h + k * (H + b.h);
    const sheet = this.sheet;
    if (!sheet.complete || !sheet.naturalWidth) return true;
    const fw = sheet.naturalWidth, fh = sheet.naturalHeight / FLIGHT_FRAME_COUNT;
    const f = Math.floor((now - b.start + b.phase) / FLIGHT_FRAME_TIME) % FLIGHT_FRAME_COUNT;
    const ctx = this.ctx;
    if (b.up) {
      ctx.drawImage(sheet, 0, f * fh, fw, fh, b.x, y, b.w, b.h);
    } else {
      ctx.save();
      ctx.translate(0, 2 * y + b.h);
      ctx.scale(1, -1);
      ctx.drawImage(sheet, 0, f * fh, fw, fh, b.x, y, b.w, b.h);
      ctx.restore();
    }
    return true;
  }

  update(now) {
    const dt = this.last === null ? 0 : Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.debt += this.rate * dt;
    while (this.debt >= 1) { this.debt -= 1; this.add(now); }
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.birds = this.birds.filter((b) => this.draw(b, now));
  }
}
