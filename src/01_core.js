/* =====================================================================
   imps Adventure — 01 core: Konstanten, Utilities, Input, Save
   ===================================================================== */
'use strict';
const TILE = 16, VW = 320, VH = 240, CHATW = 96, TW = VW + CHATW; // Spielfläche 320x240 + Chat 96
const GRAV = 0.28, MAXFALL = 6.0;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sign = v => v < 0 ? -1 : v > 0 ? 1 : 0;
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rectHit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const pad2 = n => (n < 10 ? '0' : '') + n;
const fmtTime = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + pad2(s % 60); };
const fmtMs = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + pad2(s % 60) + '.' + pad2(Math.floor((ms % 1000) / 10)); };

function makeRng(seed) {
  let a = seed >>> 0;
  const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.int = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  f.chance = p => f() < p;
  return f;
}

/* ---------------- Input ---------------- */
const Input = {
  down: {}, pressed: {}, released: {}, anyPressed: false, lastKey: null, gpPrev: {},
  map: {
    left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
    jump: ['Space', 'KeyW', 'ArrowUp'], run: ['ShiftLeft', 'ShiftRight', 'KeyK'], perk: ['KeyE', 'KeyJ'],
    marx: ['KeyH'], pause: ['Escape', 'KeyP'], ok: ['Enter', 'Space', 'KeyE'], back: ['Escape', 'Backspace'], mute: ['KeyM'], debugLife: ['KeyB'], debugInv: ['KeyV'],
    one: ['Digit1'], two: ['Digit2'], three: ['Digit3'], four: ['Digit4'], five: ['Digit5'], six: ['Digit6']
  },
  init() {
    window.addEventListener('keydown', e => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (!this.down[e.code]) { this.pressed[e.code] = true; this.anyPressed = true; this.lastKey = e.code; }
      this.down[e.code] = true;
      AudioSys.resume();
    });
    window.addEventListener('keyup', e => { this.down[e.code] = false; this.released[e.code] = true; });
    window.addEventListener('blur', () => { this.down = {}; });
  },
  pollGamepad() {
    let gps; try { gps = navigator.getGamepads ? navigator.getGamepads() : null; } catch (e) { return; }
    const gp = gps && gps[0]; if (!gp) return;
    const b = i => gp.buttons[i] && gp.buttons[i].pressed;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    const virt = {
      ArrowLeft: b(14) || ax < -0.5, ArrowRight: b(15) || ax > 0.5, ArrowUp: b(12) || ay < -0.5, ArrowDown: b(13) || ay > 0.5,
      Space: b(0), ShiftLeft: b(2) || b(1), KeyE: b(3), Escape: b(9), Enter: b(0), KeyH: b(4) || b(5)
    };
    for (const k in virt) {
      const v = !!virt[k];
      if (v && !this.gpPrev[k]) { this.pressed[k] = true; this.anyPressed = true; this.down[k] = true; AudioSys.resume(); }
      if (!v && this.gpPrev[k]) { this.released[k] = true; this.down[k] = false; }
      this.gpPrev[k] = v;
    }
  },
  is(action) { return this.map[action].some(c => this.down[c]); },
  was(action) { return this.map[action].some(c => this.pressed[c]); },
  wasReleased(action) { return this.map[action].some(c => this.released[c]); },
  endFrame() { this.pressed = {}; this.released = {}; this.anyPressed = false; }
};

/* ---------------- Save system ---------------- */
const Save = {
  KEY: 'impsAdventure.v1', data: null,
  defaults() { return { options: { music: 0.6, sfx: 0.8, chat: true, shake: true, vote: true, scale: 0 }, slots: [null, null, null], current: 0 }; },
  newSlot(difficulty) {
    return {
      created: Date.now(), bits: 0, totalBits: 0, brb: difficulty === 'hard' ? 3 : 5, levelsDone: [], unlocked: 1, subs: {}, holfs: {}, bestTimes: {}, peakViewers: {},
      perks: [], equipped: [], slots: 1, sponsors: [], skin: 'default', warps: [], fridge: null, seen: {}, stats: { deaths: 0, stomps: 0, jokes: 0, marx: 0, playtime: 0, polls: 0 },
      difficulty: difficulty || 'normal', finished: false, prologueSeen: false
    };
  },
  load() {
    try { const raw = localStorage.getItem(this.KEY); this.data = raw ? JSON.parse(raw) : this.defaults(); }
    catch (e) { this.data = this.defaults(); }
    if (!this.data.options) this.data.options = this.defaults().options;
    if (!this.data.slots) this.data.slots = [null, null, null];
    return this.data;
  },
  store() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
  get slot() { return this.data.slots[this.data.current]; },
  get opt() { return this.data.options; }
};

class Cooldown { constructor(t) { this.t = 0; this.max = t; } tick(dt = 1) { if (this.t > 0) this.t -= dt; } get ready() { return this.t <= 0; } fire() { this.t = this.max; } get frac() { return this.max ? clamp(this.t / this.max, 0, 1) : 0; } }

const Events = {
  h: {},
  on(n, f) { (this.h[n] = this.h[n] || []).push(f); },
  emit(n, ...a) { (this.h[n] || []).forEach(f => f(...a)); }
};
