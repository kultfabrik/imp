/* =====================================================================
   03 audio: WebAudio Chiptune-Tracker (4 Kanäle) + synthetische SFX
   ===================================================================== */
const NOTE_IDX = { c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11 };
function noteFreq(n) {
  if (typeof n === 'number') return 440 * Math.pow(2, (n - 69) / 12);
  const m = /^([a-g][#b]?)(-?\d)$/.exec(n); if (!m) return 0;
  const midi = 12 * (parseInt(m[2]) + 1) + NOTE_IDX[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function midiOf(n) { const m = /^([a-g][#b]?)(-?\d)$/.exec(n); return 12 * (parseInt(m[2]) + 1) + NOTE_IDX[m[1]]; }

const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10], harm: [0, 2, 3, 5, 7, 8, 11], penta: [0, 2, 4, 7, 9], mpenta: [0, 3, 5, 7, 10] };

/* ---- procedural song generator ----
   spec: {bpm, root(midi), scale, prog:[[deg,quality]...] per bar, bars, seed, lead:'sq25'|'sq50'|'sq12', bass:'walk'|'oct'|'pump'|'dub'|'waltz'|'polka',
          drums:'rock'|'ska'|'bossa'|'polka'|'dub'|'waltz'|'none'|'four'|'march', density:0..1, melody:[optional handwritten tokens per step], swing }
   Output: {bpm, steps(per bar 16 or 12), ch:[{wave, vol, pat:[...]}], stepsTotal}
*/
function chordTones(root, scale, deg) {
  const sc = SCALES[scale]; const n = sc.length;
  const t = i => root + sc[(deg + i) % n] + 12 * Math.floor((deg + i) / n);
  return [t(0), t(2), t(4)];
}
function generateSong(spec) {
  const rng = makeRng(spec.seed || 1);
  const stepsPerBar = spec.steps || 16, bars = spec.bars || 8;
  const total = stepsPerBar * bars;
  const sc = SCALES[spec.scale || 'major'];
  const lead = [], harm = [], bass = [], drums = [], arp = [];
  const prog = spec.prog || [0, 5, 3, 4];
  const dens = spec.density == null ? 0.6 : spec.density;
  // motif: rhythmic template for 1 bar, reused with variation
  const motifLen = stepsPerBar;
  const baseRhythm = [];
  for (let s = 0; s < motifLen; s++) {
    const strong = s % 4 === 0, mid = s % 2 === 0;
    baseRhythm.push(strong ? rng() < 0.9 : mid ? rng() < dens : rng() < dens * 0.45);
  }
  let curDeg = 0; let lastNote = spec.root + 12;
  const scaleNote = (idx) => { const n = sc.length; return spec.root + 12 + sc[((idx % n) + n) % n] + 12 * Math.floor(idx / n); };
  const nearestScaleIdx = (midi) => { let best = 0, bd = 99; for (let i = -7; i < 21; i++) { const d = Math.abs(scaleNote(i) - midi); if (d < bd) { bd = d; best = i; } } return best; };
  let idx = nearestScaleIdx(lastNote);
  for (let b = 0; b < bars; b++) {
    const chord = prog[b % prog.length]; const tones = chordTones(spec.root, spec.scale || 'major', chord);
    const isLast = (b % 4 === 3);
    for (let s = 0; s < stepsPerBar; s++) {
      const g = b * stepsPerBar + s;
      // lead
      let hit = baseRhythm[s] && (!isLast || s < stepsPerBar - 4 || rng() < 0.5);
      if (spec.melody) { const tok = spec.melody[g % spec.melody.length]; lead.push(tok); }
      else if (hit) {
        // choose next idx: chord tone on strong beats
        if (s % 4 === 0 || rng() < 0.4) {
          const want = rng.pick(tones) + 12 + (rng() < 0.3 ? 12 : 0);
          const ni = nearestScaleIdx(want);
          idx = Math.abs(ni - idx) > 5 ? idx + sign(ni - idx) * rng.int(1, 3) : ni;
        } else idx += rng.pick([-2, -1, -1, 1, 1, 2]);
        idx = clamp(idx, 2, 16);
        lead.push(scaleNote(idx));
      } else lead.push(rng() < 0.35 ? '-' : '.');
      // harmony (2nd pulse): sustained chord tones or off-beats
      if (spec.harmStyle === 'off') harm.push(s % 4 === 2 ? tones[rng.int(0, 2)] + 12 : s % 4 === 3 ? '-' : '.');
      else if (spec.harmStyle === 'pad') harm.push(s === 0 ? tones[1] + 12 : '.');
      else if (spec.harmStyle === 'ska') harm.push(s % 4 === 2 ? tones[2] + 12 : s % 4 === 3 ? '-' : '.');
      else if (spec.harmStyle === 'waltz') harm.push((stepsPerBar === 12 && (s === 4 || s === 8)) ? tones[1] + 12 : (s === 6 || s === 10) ? '-' : '.');
      else harm.push(s % 8 === 4 ? tones[2] + 12 : s % 8 === 6 ? '-' : '.');
      // arp channel (only at hype)
      arp.push(tones[(s + b) % 3] + 24);
      // bass
      const r = tones[0] - 12, five = tones[2] - 12, oct = tones[0];
      const bs = spec.bass || 'oct';
      let bn = '.';
      if (bs === 'oct') bn = s % 4 === 0 ? r : s % 4 === 2 ? oct : (s % 2 === 1 ? '-' : '.');
      else if (bs === 'walk') bn = s % 4 === 0 ? [r, five, oct, five][(s / 4) | 0] : s % 4 === 2 ? '-' : '.';
      else if (bs === 'pump') bn = s % 2 === 0 ? r : '.';
      else if (bs === 'dub') bn = s === 0 ? r : s === 6 ? five : s === 10 ? r : s === 3 || s === 9 ? '-' : '.';
      else if (bs === 'polka') bn = s % 4 === 0 ? r : s % 4 === 2 ? five : s % 2 === 1 ? '-' : '.';
      else if (bs === 'waltz') bn = s === 0 ? r : s === 3 ? '-' : '.';
      else if (bs === 'funk') bn = s === 0 ? r : s === 3 ? r : s === 6 ? oct : s === 10 ? five : s === 11 ? '-' : s === 12 ? r : s === 14 ? five + 2 : s === 15 ? '-' : (s === 1 || s === 4 || s === 7 || s === 13 ? '-' : '.');
      else if (bs === 'march') bn = s % 4 === 0 ? r : s % 4 === 2 ? r : s % 2 === 1 ? '-' : '.';
      else if (bs === 'synth') bn = s % 2 === 0 ? (s % 8 === 6 ? oct : r) : '-';
      bass.push(bn);
      // drums
      const d = spec.drums || 'rock'; let dn = '-';
      if (d === 'rock') dn = s % 8 === 0 ? 'k' : s % 8 === 4 ? 's' : s % 2 === 0 ? 'h' : (s === 15 && isLast ? 's' : '-');
      else if (d === 'ska') dn = s % 4 === 0 ? 'k' : s % 4 === 2 ? 's' : 'h';
      else if (d === 'bossa') dn = (s === 0 || s === 6 || s === 10 || s === 12) ? 'k' : (s === 3 || s === 11) ? 's' : s % 2 === 0 ? 'h' : '-';
      else if (d === 'polka') dn = s % 4 === 0 ? 'k' : s % 4 === 2 ? 's' : '-';
      else if (d === 'dub') dn = s === 0 ? 'k' : s === 8 ? 's' : s % 4 === 2 ? 'h' : '-';
      else if (d === 'waltz') dn = s === 0 ? 'k' : (s === 4 || s === 8) ? 'h' : '-';
      else if (d === 'four') dn = s % 4 === 0 ? 'k' : s % 4 === 2 ? 'h' : s % 8 === 4 ? 's' : '-';
      else if (d === 'march') dn = s % 4 === 0 ? 'k' : s % 4 === 2 ? 's' : s % 4 === 3 ? 's' : '-';
      else if (d === 'none') dn = '-';
      else if (d === 'synth') dn = s % 4 === 0 ? 'k' : s % 8 === 4 ? 's' : s % 2 === 1 ? 'h' : '-';
      drums.push(dn);
    }
  }
  return {
    bpm: spec.bpm || 120, stepsPerBar, total,
    ch: [
      { wave: spec.lead || 'sq25', vol: spec.leadVol || 0.22, pat: lead, hype: 0 },
      { wave: spec.harmWave || 'sq50', vol: 0.12, pat: harm, hype: 0 },
      { wave: 'tri', vol: 0.34, pat: bass, hype: 0 },
      { wave: 'noise', vol: 0.16, pat: drums, hype: spec.drums === 'none' ? 9 : 0 },
      { wave: 'sq12', vol: 0.08, pat: arp, hype: 2 }
    ]
  };
}

// handwritten melodies (16 steps per bar, tokens: midi numbers / '.' hold / '-' rest)
function mel(str, oct = 0) { return str.trim().split(/\s+/).map(t => (t === '.' || t === '-') ? t : midiOf(t) + oct * 12); }
const HOLD_MELODY = mel(`
 e5 . . . g5 . . . c6 . . . b5 . . .
 a5 . . . g5 . . . e5 . . . . . - -
 d5 . . . f5 . . . a5 . . . g5 . . .
 f5 . . . e5 . . . d5 . . . . . - -
 e5 . . . g5 . . . c6 . . . b5 . . .
 a5 . . . g5 . . . e5 . . . g5 . . .
 a5 . . b5 . . c6 . . . . . b5 . g5 .
 c6 . . . . . . . - - - - - - - -`);
const MEDDL_MELODY = mel(`
 g5 . e5 . g5 . e5 . c5 . . . e5 . g5 .
 a5 . a5 . f5 . . . d5 . . . f5 . a5 .
 g5 . e5 . g5 . e5 . c5 . . . e5 . g5 .
 d5 . f5 . e5 . d5 . c5 . . . . . - -`);
const TITLE_MELODY = mel(`
 c5 . . e5 . . g5 . c6 . . . b5 . g5 .
 a5 . . . f5 . . . g5 . . . . . - -
 d5 . . f5 . . a5 . d6 . . . c6 . a5 .
 g5 . . . e5 . . . c5 . . . . . - -
 e5 . . g5 . . b5 . e6 . . . d6 . b5 .
 c6 . . . a5 . . . f5 . . . g5 . . .
 c5 . e5 . g5 . c6 . e6 . . . d6 . . .
 c6 . . . . . . . - - - - - - - -`);
const WALTZ_MELODY = mel(`
 a4 . . . . . c5 . . . e5 . a5 . . . . . e5 . . . c5 . a4 . . . . . . . . . . .
 b4 . . . . . d5 . . . f5 . b5 . . . . . f5 . . . d5 . b4 . . . . . . . . . . .
 c5 . . . . . e5 . . . g5 . c6 . . . . . g5 . . . e5 . a5 . . . . . . . . . . .
 e5 . . . . . d5 . . . c5 . b4 . . . . . . . . . . . a4 . . . . . . . . . . .`);
const BABA_MELODY = mel(`
 g4 . a4 . b4 . d5 . b4 . . . a4 . g4 .
 e4 . . . g4 . . . a4 . . . . . - -
 g4 . a4 . b4 . d5 . e5 . . . d5 . b4 .
 a4 . . . g4 . . . . . . . . . - -`);

const SONGS = {
  title: { bpm: 128, root: 48, scale: 'major', prog: [0, 3, 4, 0], bars: 8, melody: TITLE_MELODY, bass: 'walk', drums: 'rock', harmStyle: 'off', seed: 1 },
  hub: { bpm: 96, root: 48, scale: 'major', prog: [0, 5, 3, 4], bars: 8, bass: 'dub', drums: 'four', harmStyle: 'pad', density: 0.35, seed: 7, lead: 'sq50', leadVol: 0.16 },
  w1: { bpm: 150, root: 50, scale: 'major', prog: [0, 3, 0, 4, 0, 3, 4, 0], bars: 8, bass: 'walk', drums: 'ska', harmStyle: 'ska', density: 0.6, seed: 11 },
  w2: { bpm: 118, root: 45, scale: 'dorian', prog: [0, 0, 3, 4], bars: 8, bass: 'funk', drums: 'synth', harmStyle: 'off', density: 0.55, seed: 22, lead: 'sq50' },
  w3: { bpm: 108, root: 53, scale: 'major', prog: [0, 1, 4, 0, 3, 1, 4, 4], bars: 8, bass: 'walk', drums: 'bossa', harmStyle: 'pad', density: 0.4, seed: 33, lead: 'sq12', leadVol: 0.2 },
  w4: { bpm: 140, root: 48, scale: 'major', prog: [0, 0, 4, 4, 0, 0, 4, 0], bars: 8, melody: MEDDL_MELODY, bass: 'polka', drums: 'polka', harmStyle: 'ska', seed: 44 },
  w5: { bpm: 84, root: 43, scale: 'minor', prog: [0, 0, 5, 4], bars: 8, bass: 'dub', drums: 'dub', harmStyle: 'off', density: 0.35, seed: 55, lead: 'sq12', leadVol: 0.18 },
  w6: { bpm: 112, root: 55, scale: 'major', prog: [0, 3, 5, 4], bars: 8, melody: BABA_MELODY, bass: 'oct', drums: 'four', harmStyle: 'pad', seed: 66, lead: 'sq12', leadVol: 0.2 },
  w7: { bpm: 160, root: 45, scale: 'harm', prog: [0, 1, 0, 4], bars: 8, steps: 12, melody: WALTZ_MELODY, bass: 'waltz', drums: 'waltz', harmStyle: 'waltz', seed: 77, lead: 'sq50' },
  w8: { bpm: 132, root: 45, scale: 'minor', prog: [0, 5, 2, 6], bars: 8, bass: 'synth', drums: 'synth', harmStyle: 'off', density: 0.7, seed: 88, lead: 'sq25' },
  w9: { bpm: 116, root: 48, scale: 'major', prog: [0, 3, 4, 0], bars: 8, melody: HOLD_MELODY, bass: 'oct', drums: 'four', harmStyle: 'off', seed: 99, lead: 'sq50' },
  w10: { bpm: 138, root: 45, scale: 'minor', prog: [0, 5, 3, 4], bars: 8, melody: HOLD_MELODY.map(t => typeof t === 'number' ? t - 3 : t), bass: 'pump', drums: 'rock', harmStyle: 'off', seed: 100, lead: 'sq25' },
  boss: { bpm: 156, root: 45, scale: 'minor', prog: [0, 0, 5, 4, 0, 0, 3, 4], bars: 8, bass: 'pump', drums: 'rock', harmStyle: 'off', density: 0.75, seed: 123, lead: 'sq25' },
  final: { bpm: 168, root: 43, scale: 'harm', prog: [0, 0, 5, 4, 0, 0, 1, 4], bars: 8, melody: HOLD_MELODY.map(t => typeof t === 'number' ? t - 5 : t), bass: 'pump', drums: 'march', harmStyle: 'off', seed: 999, lead: 'sq12', leadVol: 0.24 },
  holf: { bpm: 170, root: 48, scale: 'major', prog: [0, 3, 0, 4], bars: 4, bass: 'polka', drums: 'ska', harmStyle: 'ska', density: 0.85, seed: 5, lead: 'sq25' },
  ending: { bpm: 100, root: 48, scale: 'major', prog: [0, 5, 3, 4], bars: 8, melody: TITLE_MELODY, bass: 'walk', drums: 'bossa', harmStyle: 'pad', seed: 3, lead: 'sq12', leadVol: 0.2 },
  hold: { bpm: 100, root: 48, scale: 'major', prog: [0, 3, 4, 0], bars: 8, melody: HOLD_MELODY, bass: 'waltz', drums: 'none', harmStyle: 'pad', seed: 9, lead: 'sq12', leadVol: 0.18 },
};

const AudioSys = {
  ctx: null, ready: false, master: null, musicGain: null, sfxGain: null, noiseBuf: null, waves: {},
  song: null, songName: null, step: 0, nextTime: 0, timer: null, speed: 1, hype: 0, offline: false, muted: false, activeNodes: [],
  init() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.connect(this.master);
      this.lp = this.ctx.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 20000; this.lp.connect(this.musicGain);
      const sr = this.ctx.sampleRate; const buf = this.ctx.createBuffer(1, sr, sr); const d = buf.getChannelData(0);
      for (let i = 0; i < sr; i++) d[i] = Math.random() * 2 - 1; this.noiseBuf = buf;
      const mk = duty => { const n = 32; const re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) { re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty); } return this.ctx.createPeriodicWave(re, im, { disableNormalization: false }); };
      this.waves.sq25 = mk(0.25); this.waves.sq12 = mk(0.125); this.waves.sq50 = null;
      this.applyVolume(); this.ready = true;
    } catch (e) { console.warn('audio init failed', e); }
  },
  applyVolume() { if (!this.ready) return; this.musicGain.gain.value = Save.opt.music * (this.muted ? 0 : 1); this.sfxGain.gain.value = Save.opt.sfx * (this.muted ? 0 : 1); },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  toggleMute() { this.muted = !this.muted; this.applyVolume(); return this.muted; },
  osc(wave, dest) {
    const o = this.ctx.createOscillator();
    if (wave === 'tri') o.type = 'triangle'; else if (wave === 'sine') o.type = 'sine'; else if (wave === 'saw') o.type = 'sawtooth';
    else if (wave === 'sq50') o.type = 'square'; else if (this.waves[wave]) o.setPeriodicWave(this.waves[wave]); else o.type = 'square';
    o.connect(dest); return o;
  },
  // ---- music ----
  play(name, opts = {}) {
    if (!this.ready) { this.songName = name; return; }
    if (this.songName === name && this.song && !opts.restart) return;
    this.stop(); const spec = SONGS[name]; if (!spec) return;
    this.song = generateSong(spec); this.songName = name; this.step = 0; this.speed = opts.speed || 1;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), 40);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.song = null; this.songName = null; },
  setSpeed(s) { this.speed = s; },
  setHype(h) { this.hype = h; },
  setOffline(o) { this.offline = o; if (this.ready) { this.lp.frequency.setTargetAtTime(o ? 350 : 20000, this.ctx.currentTime, 0.1); } },
  duck(t = 0.6) { if (!this.ready) return; const g = this.musicGain.gain; g.cancelScheduledValues(this.ctx.currentTime); g.setValueAtTime(Save.opt.music * 0.25, this.ctx.currentTime); g.linearRampToValueAtTime(Save.opt.music * (this.muted ? 0 : 1), this.ctx.currentTime + t); },
  schedule() {
    if (!this.song) return;
    const stepDur = (60 / this.song.bpm / 4) / this.speed;
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      this.playStep(this.step, this.nextTime, stepDur);
      this.step = (this.step + 1) % this.song.total; this.nextTime += stepDur;
    }
  },
  playStep(step, t, dur) {
    const song = this.song;
    for (let ci = 0; ci < song.ch.length; ci++) {
      const ch = song.ch[ci]; if (this.hype < ch.hype) continue;
      if (this.offline && ci !== 2) continue; // offline: only bass
      const tok = ch.pat[step]; if (tok === '.' || tok === '-' || tok == null) continue;
      if (ch.wave === 'noise') { this.drum(tok, t); continue; }
      // find note length (count following '.')
      let len = 1; while (ch.pat[(step + len) % song.total] === '.' && len < 32) len++;
      const f = noteFreq(tok); if (!f) continue;
      const g = this.ctx.createGain(); g.connect(this.lp);
      const o = this.osc(ch.wave, g); o.frequency.value = f;
      const v = ch.vol * (ci === 0 && this.hype >= 3 ? 1.15 : 1);
      const end = t + dur * len;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.008);
      g.gain.setValueAtTime(v, Math.max(t + 0.008, end - 0.03)); g.gain.linearRampToValueAtTime(0.0001, end);
      if (ch.wave === 'sq12' && ci === 0) { o.frequency.setValueAtTime(f * 1.01, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05); }
      o.start(t); o.stop(end + 0.01);
    }
  },
  drum(kind, t) {
    const ctx = this.ctx;
    if (kind === 'k') { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.1); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.connect(g); g.connect(this.lp); o.start(t); o.stop(t + 0.13); }
    else {
      const s = ctx.createBufferSource(); s.buffer = this.noiseBuf; const g = ctx.createGain(); const f = ctx.createBiquadFilter();
      if (kind === 's') { f.type = 'bandpass'; f.frequency.value = 1800; g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1); }
      else { f.type = 'highpass'; f.frequency.value = 6000; g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03); }
      s.connect(f); f.connect(g); g.connect(this.lp); s.start(t, Math.random() * 0.5); s.stop(t + 0.12);
    }
  },
  // ---- sfx ----
  tone(o) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + (o.delay || 0);
    const g = ctx.createGain(); g.connect(this.sfxGain);
    const osc = this.osc(o.w || 'sq50', g);
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency[o.exp === false ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'](Math.max(1, o.f2), t + o.t);
    const v = (o.v || 0.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.005);
    if (o.sus) g.gain.setValueAtTime(v, t + o.t - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.t);
    osc.start(t); osc.stop(t + o.t + 0.02);
  },
  noise(o) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + (o.delay || 0);
    const s = ctx.createBufferSource(); s.buffer = this.noiseBuf; const g = ctx.createGain(); const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1000, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.t);
    g.gain.setValueAtTime(o.v || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + o.t);
    s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t, Math.random()); s.stop(t + o.t + 0.02);
  },
  arp(notes, dt, o = {}) { notes.forEach((n, i) => this.tone(Object.assign({ f: noteFreq(n), t: o.t || dt * 1.5, w: o.w || 'sq25', v: o.v || 0.25, delay: i * dt }, o.extra || {}))); },
  sfx(name) {
    if (!this.ready) return;
    switch (name) {
      case 'jump': this.tone({ f: 300, f2: 700, t: 0.12, w: 'sq25', v: 0.22 }); break;
      case 'jump2': this.tone({ f: 400, f2: 900, t: 0.12, w: 'sq25', v: 0.22 }); break;
      case 'jump3': this.tone({ f: 500, f2: 1200, t: 0.14, w: 'sq25', v: 0.22 }); break;
      case 'stomp': this.tone({ f: 500, f2: 120, t: 0.1, w: 'sq50', v: 0.3 }); this.noise({ f: 800, t: 0.06, v: 0.2 }); break;
      case 'bit': this.tone({ f: 1046, t: 0.06, w: 'sq50', v: 0.18 }); this.tone({ f: 1568, t: 0.16, w: 'sq50', v: 0.18, delay: 0.05 }); break;
      case 'bit100': this.arp(['c6', 'e6', 'g6', 'c7'], 0.05); break;
      case 'sub': this.arp(['e5', 'g#5', 'b5', 'e6', 'g#6'], 0.07, { w: 'sq50' }); this.noise({ f: 3000, t: 0.3, v: 0.08, delay: 0.3 }); break;
      case 'holf': this.arp(['c5', 'e5', 'g5', 'c6', 'e6', 'g6', 'c7', 'c7'], 0.06, { w: 'sq25', v: 0.3 }); break;
      case 'power': this.arp(['c5', 'd5', 'e5', 'g5', 'c6'], 0.045, { w: 'sq50' }); break;
      case 'brb': this.arp(['e5', 'g5', 'e6', 'c6', 'd6', 'g6'], 0.07, { w: 'sq25', v: 0.28 }); break;
      case 'hurt': this.tone({ f: 400, f2: 100, t: 0.25, w: 'saw', v: 0.25 }); break;
      case 'die': this.arp(['b4', 'f4', 'd4', 'b3', 'g3', 'e3'], 0.1, { w: 'sq50', v: 0.3, t: 0.25 }); break;
      case 'pipe': this.tone({ f: 600, f2: 90, t: 0.35, w: 'sq25', v: 0.25 }); this.noise({ f: 400, f2: 100, t: 0.35, v: 0.15 }); break;
      case 'bump': this.tone({ f: 180, f2: 90, t: 0.08, w: 'sq50', v: 0.3 }); break;
      case 'break': this.noise({ f: 2500, f2: 300, t: 0.2, v: 0.35 }); this.tone({ f: 250, f2: 60, t: 0.15, w: 'sq50', v: 0.2 }); break;
      case 'throw': this.noise({ f: 1500, f2: 4000, t: 0.1, v: 0.15, type: 'highpass' }); break;
      case 'kick': this.tone({ f: 180, f2: 60, t: 0.1, w: 'sq50', v: 0.3 }); break;
      case 'drill': for (let i = 0; i < 6; i++) this.noise({ f: 1200 + Math.random() * 800, t: 0.06, v: 0.15, delay: i * 0.05 }); break;
      case 'meddl': this.tone({ f: 200, f2: 90, t: 0.3, w: 'saw', v: 0.3 }); this.tone({ f: 140, f2: 60, t: 0.5, w: 'tri', v: 0.4, delay: 0.1 }); break;
      case 'roll': this.noise({ f: 200, f2: 120, t: 0.4, v: 0.25, type: 'lowpass' }); break;
      case 'honey': this.tone({ f: 200, f2: 80, t: 0.4, w: 'sine', v: 0.3 }); break;
      case 'stamp': this.noise({ f: 600, t: 0.05, v: 0.4 }); this.tone({ f: 120, f2: 60, t: 0.12, w: 'sq50', v: 0.3, delay: 0.02 }); break;
      case 'phone': this.tone({ f: 880, t: 0.15, w: 'sq50', v: 0.15 }); this.tone({ f: 880, t: 0.15, w: 'sq50', v: 0.15, delay: 0.2 }); break;
      case 'dtmf': this.tone({ f: 697, t: 0.12, w: 'sine', v: 0.2 }); this.tone({ f: 1209, t: 0.12, w: 'sine', v: 0.2 }); break;
      case 'chat': this.tone({ f: 1800, t: 0.03, w: 'sine', v: 0.05 }); break;
      case 'text': this.tone({ f: 900 + Math.random() * 200, t: 0.02, w: 'sq25', v: 0.06 }); break;
      case 'select': this.tone({ f: 800, f2: 1200, t: 0.06, w: 'sq25', v: 0.2 }); break;
      case 'move': this.tone({ f: 600, t: 0.04, w: 'sq25', v: 0.15 }); break;
      case 'back': this.tone({ f: 500, f2: 250, t: 0.1, w: 'sq25', v: 0.2 }); break;
      case 'pause': this.tone({ f: 660, t: 0.06, w: 'sq50', v: 0.2 }); this.tone({ f: 990, t: 0.1, w: 'sq50', v: 0.2, delay: 0.07 }); break;
      case 'laugh': for (let i = 0; i < 5; i++) this.tone({ f: 500 - i * 40, f2: 400 - i * 40, t: 0.08, w: 'sq25', v: 0.2, delay: i * 0.09 }); break;
      case 'slowmo': this.tone({ f: 800, f2: 100, t: 0.6, w: 'tri', v: 0.3 }); break;
      case 'tofu': this.arp(['g5', 'c6', 'e6'], 0.05, { w: 'sq12' }); break;
      case 'offline': this.tone({ f: 500, f2: 120, t: 0.4, w: 'sq50', v: 0.25 }); break;
      case 'online': this.arp(['c5', 'g5', 'c6', 'e6'], 0.06, { w: 'sq50' }); break;
      case 'bosshit': this.tone({ f: 300, f2: 80, t: 0.3, w: 'saw', v: 0.35 }); this.noise({ f: 1000, f2: 200, t: 0.3, v: 0.3 }); break;
      case 'bossdie': for (let i = 0; i < 8; i++) { this.noise({ f: 1500 - i * 150, f2: 100, t: 0.3, v: 0.3, delay: i * 0.12 }); this.tone({ f: 200 - i * 15, f2: 40, t: 0.3, w: 'saw', v: 0.2, delay: i * 0.12 }); } break;
      case 'explode': this.noise({ f: 900, f2: 80, t: 0.5, v: 0.4, type: 'lowpass' }); break;
      case 'whoosh': this.noise({ f: 300, f2: 3000, t: 0.2, v: 0.15, type: 'bandpass' }); break;
      case 'bounce': this.tone({ f: 200, f2: 800, t: 0.15, w: 'sq50', v: 0.25 }); break;
      case 'splash': this.noise({ f: 1200, f2: 300, t: 0.25, v: 0.25 }); break;
      case 'sneeze': this.tone({ f: 900, f2: 300, t: 0.15, w: 'saw', v: 0.25 }); this.noise({ f: 2000, t: 0.15, v: 0.2 }); break;
      case 'bee': this.tone({ f: 220, f2: 260, t: 0.2, w: 'saw', v: 0.12 }); break;
      case 'ping': this.tone({ f: 1400, f2: 1000, t: 0.12, w: 'sine', v: 0.2 }); break;
      case 'poll': this.arp(['c5', 'e5', 'g5'], 0.06, { w: 'sq50' }); break;
      case 'pollend': this.arp(['g5', 'c6'], 0.08, { w: 'sq50' }); break;
      case 'hype': this.arp(['c5', 'e5', 'g5', 'c6', 'e6'], 0.05, { w: 'sq25', v: 0.3 }); break;
      case 'train': this.noise({ f: 500, f2: 200, t: 0.4, v: 0.3 }); this.tone({ f: 440, t: 0.3, w: 'sq50', v: 0.2 }); this.tone({ f: 554, t: 0.3, w: 'sq50', v: 0.2 }); break;
      case 'joke': this.arp(['c5', 'c5', 'g4'], 0.1, { w: 'sq50', v: 0.25 }); this.noise({ f: 800, t: 0.2, v: 0.15, delay: 0.35 }); break;
      case 'ban': this.tone({ f: 100, f2: 40, t: 0.4, w: 'saw', v: 0.4 }); this.noise({ f: 300, f2: 60, t: 0.5, v: 0.4, type: 'lowpass' }); break;
      case 'steal': this.tone({ f: 800, f2: 1600, t: 0.15, w: 'sq25', v: 0.2 }); this.tone({ f: 1600, f2: 800, t: 0.15, w: 'sq25', v: 0.2, delay: 0.15 }); break;
      case 'kennste': this.tone({ f: 700, t: 0.08, w: 'sq50', v: 0.2 }); this.tone({ f: 900, t: 0.12, w: 'sq50', v: 0.2, delay: 0.1 }); break;
      case 'paper': this.noise({ f: 4000, f2: 2000, t: 0.15, v: 0.15, type: 'highpass' }); break;
      case 'bell': this.tone({ f: 1760, t: 0.5, w: 'sine', v: 0.25 }); this.tone({ f: 2637, t: 0.4, w: 'sine', v: 0.12 }); break;
      case 'clock': this.tone({ f: 1000, t: 0.03, w: 'sq50', v: 0.15 }); break;
      case 'warp': this.arp(['c4', 'e4', 'g4', 'c5', 'e5', 'g5', 'c6'], 0.04, { w: 'sq12', v: 0.25 }); break;
      case 'checkpoint': this.arp(['g5', 'c6', 'e6'], 0.07, { w: 'sq50' }); break;
      case 'clear': this.arp(['c5', 'e5', 'g5', 'c6', 'g5', 'c6', 'e6', 'g6', 'c7'], 0.08, { w: 'sq25', v: 0.3, t: 0.25 }); break;
      case 'plug': this.tone({ f: 200, f2: 100, t: 0.1, w: 'sq50', v: 0.3 }); this.arp(['c5', 'g5', 'c6', 'e6', 'g6', 'c7'], 0.05, { w: 'sq50', v: 0.3, extra: { delay: 0.3 } }); break;
      case 'cookie': this.tone({ f: 300, f2: 500, t: 0.1, w: 'sq50', v: 0.2 }); break;
      case 'type': this.noise({ f: 3000, t: 0.02, v: 0.1, type: 'highpass' }); break;
      case 'tick': this.tone({ f: 2000, t: 0.02, w: 'sq50', v: 0.1 }); break;
      case 'gema': this.tone({ f: 600, f2: 50, t: 0.5, w: 'tri', v: 0.4 }); break;
      case 'unmute': this.arp(['c6', 'e6', 'g6'], 0.05, { w: 'sq50' }); break;
    }
  }
};
