/* =====================================================================
   15 ui: Overlays (Titel, Slots, Cutscenes, Hub-Stationen, Weltkarte, Shops,
   VODs/Trophäen, Optionen, Pause, Intro-/Ergebniskarte, Game Over, Credits)
   ===================================================================== */
const UI = {
  stack: [],
  get top() { return this.stack[this.stack.length - 1] || null; },
  open(o, silent) { this.stack.push(o); if (o.open) o.open(); if (!silent) AudioSys.sfx('select'); return o; },
  close(silent) { const o = this.stack.pop(); if (o && o.onClose) o.onClose(); if (!silent) AudioSys.sfx('back'); return o; },
  closeAll() { this.stack = []; },
  update() { const t = this.top; if (t) t.update(); },
  draw(g) { for (const o of this.stack) o.draw(g); }
};
/* ---------- drawing helpers ---------- */
function box(g, x, y, w, h, col = '#1a1a22', border = '#d4d4dc') { g.fillStyle = border; g.fillRect(x, y, w, h); g.fillStyle = col; g.fillRect(x + 1, y + 1, w - 2, h - 2); g.fillStyle = border; g.fillRect(x + 2, y + 2, w - 4, 1); }
function dim(g, a = 0.6, full) { g.fillStyle = 'rgba(0,0,0,' + a + ')'; g.fillRect(0, 0, full ? TW : VW, VH); }
function twitchHeader(g, txt, y = 6) { g.fillStyle = '#9146ff'; g.fillRect(0, y - 2, VW, 12); Font.draw(g, txt, VW / 2, y, '#fff', { align: 'center' }); }
function pressEnter(g, txt = 'ENTER', y = VH - 12) { if (Game.frame % 40 < 24) Font.draw(g, txt, VW / 2, y, '#efeff1', { align: 'center', shadow: true }); }
/* ---------- generic menu ---------- */
class Menu {
  constructor(items, opts = {}) { this.items = items; this.i = opts.start || 0; this.opts = opts; this.t = 0; }
  get cur() { return this.items[this.i]; }
  update() {
    this.t++; const n = this.items.length; if (!n) return;
    if (Input.was('up')) { this.i = (this.i + n - 1) % n; AudioSys.sfx('move'); } if (Input.was('down')) { this.i = (this.i + 1) % n; AudioSys.sfx('move'); }
    const it = this.cur; if (it.adjust && (Input.was('left') || Input.was('right'))) { it.adjust(Input.was('left') ? -1 : 1, it); AudioSys.sfx('tick'); }
    if (Input.was('ok') && this.t > 4) { if (it.disabled) AudioSys.sfx('back'); else { AudioSys.sfx('select'); it.action(it, this); } }
    if (Input.was('back') && this.opts.onBack && this.t > 4) this.opts.onBack();
  }
  draw(g, x, y, w, lineH = 11) {
    this.items.forEach((it, i) => {
      const sel = i === this.i; const yy = y + i * lineH; if (sel) { g.fillStyle = 'rgba(145,70,255,0.35)'; g.fillRect(x - 2, yy - 2, w + 4, lineH); Font.draw(g, '>', x - 8, yy, '#ffd700'); }
      const col = it.disabled ? '#5a5a66' : it.color || (sel ? '#fff' : '#c8c8d0'); Font.draw(g, typeof it.label === 'function' ? it.label() : it.label, x, yy, col);
      const r = typeof it.right === 'function' ? it.right() : it.right; if (r != null) Font.draw(g, String(r), x + w, yy, it.rightColor || (sel ? '#ffd700' : '#8a8a96'), { align: 'right' });
    });
    const it = this.cur; if (it && it.hint && this.opts.hintY != null) Font.drawWrapped(g, typeof it.hint === 'function' ? it.hint() : it.hint, x, this.opts.hintY, this.opts.hintW || 48, '#8a8a96');
  }
}
/* ====================== TITLE ====================== */
const TitleScreen = {
  t: 0, menu: null,
  open() { this.t = 0; AudioSys.play('title'); this.menu = new Menu([
    { label: 'Stream starten', action: () => UI.open(SlotScreen) },
    { label: 'Optionen', action: () => UI.open(OptionsScreen) },
    { label: 'Steuerung', action: () => UI.open(ControlsScreen) },
    { label: 'Credits', action: () => UI.open(CreditsScreen) },
  ]); if (!Chat.msgs.length) { Chat.sys('Willkommen im Chat von imp'); Chat.say('hafi!', ['hafermilchHans', '#ff7f50']); Chat.say('wann geht der stream los', ['sub_sabine', '#ff5ad1']); Chat.say('er ist zu spät. wie immer.', ['luigi_fan_01', '#7bd23a']); } },
  update() { this.t++; this.menu.update(); },
  draw(g) {
    Backgrounds.draw(g, 'w2', this.t * 0.6, 0, VW, VH, false);
    // ground strip
    Tiles.set('w2'); for (let x = 0; x < VW; x += 16) { g.drawImage(Tiles.img('#', 'top'), x, VH - 32); g.drawImage(Tiles.img('#'), x, VH - 16); }
    Tiles.drawPipe(g, 40, VH - 32 - 32, 32, 'green', 'up'); Tiles.drawPipe(g, 250, VH - 32 - 48, 48, 'blue', 'up');
    // walking imp & luigi
    const wx = 90 + Math.sin(this.t * 0.02) * 30; Sprites.draw(g, ['imp_walk1', 'imp_idle', 'imp_walk3', 'imp_idle'][Math.floor(this.t / 8) % 4], wx, VH - 32 - 24, Math.cos(this.t * 0.02) < 0);
    Sprites.draw(g, Math.floor(this.t / 12) % 2 ? 'luigi_walk' : 'luigi_idle', wx - 22, VH - 32 - 28, Math.cos(this.t * 0.02) < 0);
    Sprites.draw(g, this.t % 120 < 40 ? 'sinan_flex' : 'sinan_idle', 210, VH - 32 - 24, true); Sprites.draw(g, 'marx_bust', 150, VH - 48);
    if (Math.floor(this.t / 60) % 5 === 0) Sprites.draw(g, 'kabel_1', 52, VH - 32 - 32 - 20);
    // logo
    const ly = 26 + Math.sin(this.t * 0.05) * 2; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(VW / 2 - 120, ly - 8, 240, 62);
    Font.drawBig(g, 'imps', VW / 2, ly, '#9146ff', 3, { align: 'center', shadow: true }); Font.drawBig(g, 'ADVENTURE', VW / 2, ly + 26, '#ffd700', 2, { align: 'center', shadow: true });
    Font.draw(g, 'Kein Netz. Kein Stream. Kein Plan.', VW / 2, ly + 46, '#efeff1', { align: 'center', shadow: true });
    // menu
    box(g, VW / 2 - 60, 104, 120, 58); this.menu.draw(g, VW / 2 - 44, 111, 90);
    Font.draw(g, 'v1.0 · ein Fan-Jump\'n\'Run · Parodie', VW / 2, 170, '#8a8a96', { align: 'center', shadow: true });
    Font.draw(g, '↑↓ wählen · ENTER ok · M = Ton', VW / 2, VH - 8, '#8a8a96', { align: 'center', shadow: true });
  }
};
/* ====================== SLOTS ====================== */
const SlotScreen = {
  menu: null, sub: null,
  open() { this.buildMenu(); },
  slotLabel(i) { const s = Save.data.slots[i]; if (!s) return 'Slot ' + (i + 1) + ': Neuer Kanal'; return 'Slot ' + (i + 1) + ': ' + (s.finished ? 'GERETTET' : 'Level ' + Math.min(10, s.unlocked)) + ' · ' + s.sponsors.length + '/10 Sponsoren'; },
  buildMenu() { this.sub = null; this.menu = new Menu([0, 1, 2].map(i => ({ label: () => this.slotLabel(i), right: () => Save.data.slots[i] ? Save.data.slots[i].bits + ' Bits' : '', action: () => this.pick(i) })).concat([{ label: 'Zurück', action: () => UI.close() }]), { onBack: () => UI.close() }); },
  pick(i) { const s = Save.data.slots[i]; if (!s) { this.sub = new Menu([
    { label: 'Chill', hint: '7 BRB, 12 Min. Countdown, Marx immer gratis. Zum Erkunden.', action: () => this.create(i, 'chill') },
    { label: 'Normal', hint: '5 BRB, 8 Min. Countdown. So ist es gedacht.', action: () => this.create(i, 'normal') },
    { label: 'Dauersatiresendung', hint: '3 BRB, 6 Min. Countdown, jeder Treffer wirft dich auf klein zurück.', action: () => this.create(i, 'hard') },
    { label: 'Zurück', action: () => { this.sub = null; } }], { onBack: () => { this.sub = null; }, hintY: 150, hintW: 40 }); }
  else { this.sub = new Menu([
    { label: 'Weiterspielen', action: () => { Save.data.current = i; Save.store(); Game.enterHub(true); } },
    { label: 'Kanal löschen', action: () => { this.sub = new Menu([{ label: 'Wirklich löschen?', disabled: true }, { label: 'Ja, löschen', action: () => { Save.data.slots[i] = null; Save.store(); this.buildMenu(); } }, { label: 'Nein', action: () => { this.sub = null; } }], { onBack: () => { this.sub = null; }, start: 2 }); } },
    { label: 'Zurück', action: () => { this.sub = null; } }], { onBack: () => { this.sub = null; } }); } },
  create(i, diff) { Save.data.slots[i] = Save.newSlot(diff); if (diff === 'chill') Save.data.slots[i].brb = 7; Save.data.current = i; Save.store(); Game.newGame(); },
  update() { (this.sub || this.menu).update(); },
  draw(g) { dim(g, 0.7); twitchHeader(g, 'KANAL WÄHLEN'); box(g, 20, 30, VW - 40, 150); Font.draw(g, 'Speicherstände (Browser)', 30, 38, '#8a8a96'); this.menu.draw(g, 40, 52, VW - 90, 13);
    if (this.sub) { box(g, 60, 100, VW - 120, 78, '#22222c', '#9146ff'); Font.draw(g, Save.data.slots[this.menu.i] ? 'Slot ' + (this.menu.i + 1) : 'Schwierigkeit', 70, 106, '#bf94ff'); this.sub.draw(g, 80, 118, VW - 170, 11); }
    const s = Save.data.slots[this.menu.i]; if (s && !this.sub) { Font.draw(g, 'Schwierigkeit: ' + { chill: 'Chill', normal: 'Normal', hard: 'Dauersatiresendung' }[s.difficulty] + ' · Tode: ' + s.stats.deaths + ' · HOLF: ' + Object.values(s.holfs).reduce((a, b) => a + b.length, 0), 30, 150, '#c8c8d0'); Font.draw(g, 'Abos: ' + Object.values(s.subs).reduce((a, b) => a + b.length, 0) + '/30 · Perks: ' + s.perks.length + '/15 · Spielzeit: ' + fmtTime(Math.floor(s.stats.playtime / 60)), 30, 160, '#c8c8d0'); }
    Font.draw(g, 'ESC zurück', VW / 2, VH - 10, '#8a8a96', { align: 'center' }); }
};
/* ====================== OPTIONS / CONTROLS / CREDITS ====================== */
const OptionsScreen = {
  menu: null,
  open() { const o = Save.opt; const pct = v => Math.round(v * 100) + '%'; const items = [
    { label: 'Musik', right: () => pct(o.music), adjust: d => { o.music = clamp(Math.round((o.music + d * 0.1) * 10) / 10, 0, 1); AudioSys.applyVolume(); Save.store(); }, action: () => { } },
    { label: 'Sound', right: () => pct(o.sfx), adjust: d => { o.sfx = clamp(Math.round((o.sfx + d * 0.1) * 10) / 10, 0, 1); AudioSys.applyVolume(); Save.store(); }, action: () => { } },
    { label: 'Chat-Overlay', right: () => o.chat ? 'an' : 'aus', adjust: () => { o.chat = !o.chat; Save.store(); }, action: it => it.adjust() },
    { label: 'Screenshake', right: () => o.shake ? 'an' : 'aus', adjust: () => { o.shake = !o.shake; Save.store(); }, action: it => it.adjust() },
    { label: 'Bei Polls mitstimmen', right: () => o.vote ? 'an' : 'aus', adjust: () => { o.vote = !o.vote; Save.store(); }, action: it => it.adjust(), hint: 'Wenn an: ←/→ während eines Chat-Polls zählt 30%.' },
  ]; if (Save.slot) items.push({ label: 'Schwierigkeit', right: () => ({ chill: 'Chill', normal: 'Normal', hard: 'Dauersatire' }[Save.slot.difficulty]), adjust: d => { const a = ['chill', 'normal', 'hard']; Save.slot.difficulty = a[(a.indexOf(Save.slot.difficulty) + d + 3) % 3]; Save.store(); }, action: it => it.adjust(1), hint: 'Gilt ab dem nächsten Level.' });
    items.push({ label: 'Zurück', action: () => UI.close() }); this.menu = new Menu(items, { onBack: () => UI.close(), hintY: 150, hintW: 44 }); },
  update() { this.menu.update(); },
  draw(g) { dim(g, 0.7); twitchHeader(g, 'OPTIONEN'); box(g, 30, 30, VW - 60, 140); this.menu.draw(g, 46, 40, VW - 106, 13); Font.draw(g, '←/→ ändern · ESC zurück', VW / 2, VH - 10, '#8a8a96', { align: 'center' }); }
};
const ControlsScreen = {
  update() { if (Input.was('ok') || Input.was('back')) UI.close(); },
  draw(g) { dim(g, 0.75); twitchHeader(g, 'STEUERUNG'); box(g, 16, 24, VW - 32, 192);
    const rows = [['← → / A D', 'Laufen'], ['SPACE / W / ↑', 'Springen (halten = höher)'], ['SHIFT / K', 'Rennen · Tragen/Werfen · Ball · Wirbel'], ['↓ / S', 'Ducken · Röhre rein · Fallen lassen'], ['↑', 'Reden · Hotspot · Marx-Büste · Röhre hoch'], ['E / J', 'Aktiver Perk (Witz, Pappe, Bannhammer)'], ['H', 'Frag Marx (1x gratis, dann 20 Bits)'], ['ESC / P', 'Pause'], ['ENTER', 'Weiter / Bestätigen'], ['M', 'Ton an/aus'], ['1-6', 'Nummern-Buttons beim Endboss'], ['Gamepad', 'Stick/Kreuz, A Sprung, X Rennen, Y Perk']];
    rows.forEach((r, i) => { Font.draw(g, r[0], 24, 32 + i * 13, '#ffd700'); Font.draw(g, r[1], 110, 32 + i * 13, '#efeff1'); });
    Font.draw(g, 'Tipp: Auf Gegner springen. Helmträger von unten anstoßen.', 24, 194, '#8a8a96'); pressEnter(g, 'ENTER', VH - 14); }
};
const CreditsScreen = {
  t: 0, lines: ['imps ADVENTURE', '', 'Ein Fan-Jump\'n\'Run in Pixeln', 'Kein Netz. Kein Stream. Kein Plan.', '', '--- BESETZUNG ---', 'imp ........... imp', 'Luigi der Mod ... Luigi', 'Karl Marx ...... eine Büste', 'Sinan mit scharfem ẞ .. Sinan', 'Baba der Bär ... Baba', 'Torben & Kevin . NIXNET AG', 'NIXI 3000 ...... die Warteschleife', '', '--- TECHNIK ---', 'Grafik: handgemalte Pixelstrings', 'Musik: WebAudio-Chiptune, prozedural', 'Physik: 60 Hz, fester Zeitschritt', 'Speicher: localStorage, 3 Slots', '', '--- DANKE ---', 'an den Chat', 'an alle Hafermilch-Trinker', 'an Techniker, die kommen', '', 'Alle Figuren sind Parodien.', 'Keine Nintendo-Assets. Ehrlich.', '', 'Der Stream startet um 20 Uhr.', 'Also gegen 20:17.', '', 'impimpimp'],
  open() { this.t = 0; },
  update() { this.t += Input.is('ok') ? 4 : 1; if (Input.was('back') || this.t > this.lines.length * 12 + 260) UI.close(); },
  draw(g) { dim(g, 0.85); const y0 = VH - this.t * 0.5; this.lines.forEach((l, i) => { const y = y0 + i * 12; if (y > -10 && y < VH + 10) Font.draw(g, l, VW / 2, y, l.startsWith('---') ? '#9146ff' : i === 0 ? '#ffd700' : '#efeff1', { align: 'center' }); }); Font.draw(g, 'ENTER schneller · ESC', VW / 2, VH - 8, '#5a5a66', { align: 'center' }); }
};
/* ====================== SCENE PLAYER ====================== */
const SPEAKERS = { imp: ['imp', 'face_imp', '#9146ff'], luigi: ['Luigi', 'face_luigi', '#7bd23a'], marx: ['Karl Marx', 'face_marx', '#d4d4dc'], sinan: ['Sinan mit scharfem ẞ', 'face_sinan', '#ff5ad1'], baba: ['Baba', 'face_baba', '#ffb347'], dl: ['Drachenlord', 'face_dl', '#c8a04a'], nixi: ['NIXI 3000', 'face_nixi', '#e03a3a'], ober: ['Der Herr Ober', 'face_ober', '#ffd700'], algo: ['Der Algorithmus', 'face_algo', '#ff3b3b'], volker: ['Vertriebler Volker', 'face_volker', '#f28c28'], torben: ['Torben (NIXNET)', 'face_torben', '#f28c28'], kevin: ['Kevin (NIXNET)', 'face_torben', '#f28c28'], barth: ['Mario Barth', 'face_barth', '#ffd700'], sponsor: ['Werbepartner', null, '#ffd700'] };
const SceneNames = { prologue: 'Prolog: Der Umzug', ending: 'Finale: Die grüne LED' };
const ScenePlayer = {
  steps: null, idx: 0, shown: 0, t: 0, onDone: null, id: null, bg: null,
  play(id, onDone) { const steps = SCENES[id]; if (!steps) { if (onDone) onDone(); return; } this.id = id; this.steps = steps; this.idx = 0; this.shown = 0; this.t = 0; this.onDone = onDone; this.bg = steps[0].bg || null; if (Save.slot) { Save.slot.seen[id] = true; } UI.open(this, true); AudioSys.duck(1.5); if (this.bg === 'room') AudioSys.play(id === 'ending' ? 'ending' : 'hub'); },
  get step() { return this.steps[this.idx]; },
  next() { this.idx++; this.shown = 0; this.t = 0; if (this.idx >= this.steps.length) this.finish(); else { const s = this.step; if (s.bg) this.bg = s.bg; if (s.chat) { s.chat.forEach((c, i) => Chat.pending.push({ txt: c, delay: 5 + i * 14 })); } } },
  finish() { UI.close(true); const cb = this.onDone; this.onDone = null; if (cb) cb(); },
  update() { this.t++; const s = this.step; if (!s) { this.finish(); return; }
    if (Input.was('back') && this.t > 5) { this.finish(); return; }
    if (s.chat) { if (this.t > 150 || (Input.was('ok') && this.t > 10)) this.next(); return; }
    if (s.title) { if (Input.was('ok') && this.t > 30) this.next(); return; }
    if (this.shown < s.text.length) { this.shown += Input.is('ok') ? 3 : 1; if (this.shown % 2 === 0) AudioSys.sfx('text'); }
    if (Input.was('ok') && this.t > 4) { if (this.shown < s.text.length) this.shown = s.text.length; else this.next(); } },
  draw(g) {
    const s = this.step; if (!s) return;
    if (this.bg === 'room' || !Game.level) { Backgrounds.draw(g, 'hub', 40, 0, VW, VH, false); Tiles.set('hub'); for (let x = 0; x < VW; x += 16) { g.drawImage(Tiles.img('#', 'top'), x, VH - 16); } Sprites.draw(g, 'kasten', 250, VH - 48); Sprites.draw(g, 'marx_bust', 200, VH - 32); Sprites.draw(g, 'box', 20, VH - 48); Sprites.draw(g, 'box', 46, VH - 48); Sprites.draw(g, 'imp_idle', 120, VH - 40); Sprites.draw(g, 'luigi_idle', 150, VH - 44, true); }
    else dim(g, 0.35);
    if (s.title) { dim(g, 0.5); Font.drawBig(g, s.title, VW / 2, VH / 2 - 16, '#ffd700', 3, { align: 'center', shadow: true }); pressEnter(g); return; }
    if (s.chat) { box(g, VW / 2 - 70, VH / 2 - 14, 140, 28, '#1a1a22', '#9146ff'); Font.draw(g, 'Der Chat explodiert...', VW / 2, VH / 2 - 8, '#bf94ff', { align: 'center' }); Font.draw(g, '→ rechts lesen', VW / 2, VH / 2 + 2, '#8a8a96', { align: 'center' }); return; }
    const sp = SPEAKERS[s.who] || SPEAKERS.imp; const bx = 4, by = VH - 78, bw = VW - 8, bh = 74;
    box(g, bx, by, bw, bh, '#101018', sp[2]);
    g.fillStyle = '#22222c'; g.fillRect(bx + 4, by + 4, 32, 32); if (sp[1]) Sprites.draw(g, sp[1], bx + 8, by + 8); else Sprites.draw(g, 'sponsor', bx + 12, by + 6);
    Font.draw(g, sp[0], bx + 40, by + 5, sp[2]);
    Font.drawWrapped(g, s.text.slice(0, this.shown), bx + 40, by + 16, 44, '#efeff1');
    if (this.shown >= s.text.length && this.t % 40 < 24) Font.draw(g, 'ENTER ▶', bx + bw - 6, by + bh - 10, '#8a8a96', { align: 'right' });
    Font.draw(g, 'ESC überspringen', bx + 6, by + bh - 10, '#5a5a66'); Font.draw(g, (this.idx + 1) + '/' + this.steps.length, bx + 6, by + 40, '#5a5a66');
  }
};
/* ====================== LEVEL INTRO CARD ====================== */
const IntroCard = {
  t: 0, L: null,
  open() { this.t = 0; this.L = Game.level; },
  update() { this.t++; if ((Input.was('ok') || Input.was('jump')) && this.t > 20) { UI.close(true); Game.afterIntroCard(); } if (this.t > 420) { UI.close(true); Game.afterIntroCard(); } },
  draw(g) { const L = this.L; g.fillStyle = '#0e0e10'; g.fillRect(0, 0, VW, VH); Backgrounds.draw(g, L.theme, this.t * 0.4, 0, VW, VH, false); dim(g, 0.55);
    Font.draw(g, 'STARTING SOON', VW / 2, 24, '#bf94ff', { align: 'center' }); g.fillStyle = '#9146ff'; g.fillRect(VW / 2 - 60, 34, 120, 1);
    Font.drawBig(g, 'LEVEL ' + L.no, VW / 2, 44, '#fff', 2, { align: 'center', shadow: true }); Font.drawBig(g, L.title, VW / 2, 66, '#ffd700', 2, { align: 'center', shadow: true }); Font.draw(g, L.subtitle, VW / 2, 88, '#efeff1', { align: 'center' });
    box(g, 30, 104, VW - 60, 30, '#1a1a22', '#5a5a66'); Font.draw(g, 'Stream-Start: 20:00 Uhr · Jetzt: ' + L.introTime, VW / 2, 110, '#e03a3a', { align: 'center' }); Font.draw(g, 'Countdown: ' + fmtTime(Math.ceil(Game.time / 60)) + ' · BRB x' + Game.brb + ' · Bits ' + Game.bits, VW / 2, 121, '#c8c8d0', { align: 'center' });
    Sprites.draw(g, 'face_luigi', 30, 144); Font.draw(g, 'Luigis Tipp:', 60, 144, '#7bd23a'); Font.drawWrapped(g, L.hints[0], 60, 154, 40, '#efeff1');
    Font.draw(g, 'Werbepartner heute: ' + L.sponsor.name, VW / 2, 206, '#ffd700', { align: 'center' }); pressEnter(g, 'ENTER', VH - 12); }
};
/* ====================== RESULTS CARD ====================== */
const ResultsCard = {
  t: 0, data: null,
  open() { this.t = 0; },
  update() { this.t++; if ((Input.was('ok') || Input.was('jump')) && this.t > 40) { UI.close(true); Game.afterResults(); } },
  draw(g) { const d = this.data; dim(g, 0.8); twitchHeader(g, 'STREAM-ZUSAMMENFASSUNG · LEVEL ' + d.no);
    const rows = [['Peak-Zuschauer', d.viewers], ['Bits gesammelt', d.bits], ['Abos', d.subs + '/3'], ['HOLF-Awards', d.holfs || '-'], ['Zeit', fmtMs(d.ms) + (d.best ? ' NEUE BESTZEIT!' : '')], ['BRB übrig', 'x' + d.brb], ['Tode im Level', d.deaths]];
    const n = Math.min(rows.length, Math.floor(this.t / 18)); box(g, 24, 26, VW - 48, 120);
    for (let i = 0; i < n; i++) { Font.draw(g, rows[i][0], 34, 34 + i * 14, '#c8c8d0'); Font.draw(g, String(rows[i][1]), VW - 34, 34 + i * 14, i === 4 && d.best ? '#ffd700' : '#fff', { align: 'right' }); if (i === n - 1 && this.t % 18 === 0) AudioSys.sfx('tick'); }
    if (this.t > rows.length * 18 + 10) { box(g, 24, 152, VW - 48, 40, '#2a1a4a', '#ffd700'); Sprites.draw(g, 'sponsor', 32, 160); Font.draw(g, 'WERBEPARTNER UNTERSCHRIEBEN:', 56, 158, '#ffd700'); Font.draw(g, d.sponsor.name + ' - "' + d.sponsor.slogan + '"', 56, 168, '#efeff1'); Font.draw(g, 'Kanal-Gesundheit: ' + Save.slot.sponsors.length + '/10', 56, 180, '#7bd23a'); pressEnter(g); } }
};
/* ====================== GAME OVER ====================== */
const GameOverScreen = {
  t: 0, open() { this.t = 0; AudioSys.stop(); AudioSys.sfx('ban'); },
  update() { this.t++; if (Input.was('ok') && this.t > 60) { UI.close(true); Game.afterGameOver(); } },
  draw(g) { dim(g, 0.85); Font.drawBig(g, 'STREAM', VW / 2, 50, '#e03a3a', 3, { align: 'center', shadow: true }); Font.drawBig(g, 'ABGEBROCHEN', VW / 2, 78, '#e03a3a', 2, { align: 'center', shadow: true });
    Font.draw(g, 'Keine BRBs mehr. Der Chat schreibt "F".', VW / 2, 110, '#efeff1', { align: 'center' }); Font.draw(g, 'Luigi: "Wir versuchen es morgen. Also heute. Später."', VW / 2, 122, '#7bd23a', { align: 'center' });
    Sprites.draw(g, 'imp_hurt', VW / 2 - 8, 140); Font.draw(g, 'Fortschritt bleibt. BRBs werden aufgefüllt.', VW / 2, 176, '#8a8a96', { align: 'center' }); if (this.t > 60) pressEnter(g); if (this.t < 60 && this.t % 10 === 0) Chat.say('F', pick(CHAT_NAMES)); }
};
/* ====================== PAUSE ====================== */
const PauseMenu = {
  menu: null,
  open() { AudioSys.sfx('pause'); this.menu = new Menu([
    { label: 'Weiter', action: () => UI.close() },
    { label: 'Frag Marx (H)', action: () => { UI.close(true); Game.askMarx(null, false); } },
    { label: 'Optionen', action: () => UI.open(OptionsScreen) }, { label: 'Steuerung', action: () => UI.open(ControlsScreen) },
    { label: 'Level neu starten', action: () => { UI.closeAll(); Game.startLevel(Game.level.no); } },
    { label: 'Zurück zum Hub', action: () => { UI.closeAll(); Game.enterHub(); } },
  ], { onBack: () => UI.close() }); },
  update() { this.menu.update(); if (Input.was('pause') && this.menu.t > 4) UI.close(); },
  draw(g) { dim(g, 0.6); box(g, VW / 2 - 70, 50, 140, 110, '#1a1a22', '#9146ff'); Font.draw(g, 'PAUSE', VW / 2, 56, '#bf94ff', { align: 'center' }); Font.draw(g, 'Level ' + Game.level.no + ': ' + Game.level.title, VW / 2, 66, '#8a8a96', { align: 'center' }); this.menu.draw(g, VW / 2 - 50, 82, 100, 12); Font.draw(g, 'Zuschauer ' + Game.viewerCount + ' · Tode ' + Game.levelDeaths, VW / 2, VH - 40, '#8a8a96', { align: 'center' }); }
};
/* ====================== SPÄTI SHOP (in level) ====================== */
const SHOP_ITEMS = [{ kind: 'hafer', name: 'Hafermilch', cost: 30, desc: 'Groß werden. Ein Treffer mehr.' }, { kind: 'mate', name: 'Späti-Mate', cost: 40, desc: '15 Sekunden Turbo.' }, { kind: 'ball', name: 'Sinans Basketball', cost: 60, desc: 'Bälle werfen (Shift).' }, { kind: 'banana', name: 'Bananenhemd', cost: 60, desc: 'Gleiten (Sprung halten) & Wirbel.' }, { kind: 'marx', name: 'Karl-Marx-Ausweis', cost: 50, desc: '20s Marx: Beamte ignorieren dich.' }, { kind: 'agave', name: 'Agavendicksaft', cost: 40, desc: 'Groß + 50 Bits zurück. Rechnet sich fast.' }, { kind: 'brb', name: '1-BRB', cost: 100, desc: 'Ein Leben. Ein Klo-Gang. Ein BRB.' }];
const SpaetiShop = {
  menu: null,
  open() { const p = Game.level.player; const items = SHOP_ITEMS.map(it => ({ label: it.name, right: () => this.price(it) === 0 ? 'GRATIS' : this.price(it) + ' Bits', hint: it.desc, action: () => this.buy(it, p) })); items.push({ label: 'Raus hier', action: () => UI.close() }); this.menu = new Menu(items, { onBack: () => UI.close(), hintY: 150, hintW: 40 }); Chat.react('shop'); },
  price(it) { return Game.level.player.hasPerk('prime') && !Game.primeUsed ? 0 : it.cost; },
  buy(it, p) { const c = this.price(it); if (Game.bits < c) { AudioSys.sfx('back'); Game.banner('Zu wenig Bits. Späti nimmt keine Karte.', '#e03a3a'); return; } if (c === 0) Game.primeUsed = true; else Game.addBits(-c, true); p.powerUp(it.kind); Game.speech(p, pick(['Danke, Späti.', 'Bar oder Bits?', 'Kassenbon? Nein.']), 60); },
  update() { this.menu.update(); },
  draw(g) { dim(g, 0.6); box(g, 30, 30, VW - 60, 150, '#1a1a22', '#7bd23a'); Font.draw(g, 'SPÄTI24 - seit 3 Uhr nachts', VW / 2, 36, '#7bd23a', { align: 'center' }); Font.draw(g, 'Bits: ' + Game.bits + (Game.level.player.hasPerk('prime') && !Game.primeUsed ? ' · Prime: 1 Gratis-Item' : ''), VW / 2, 46, '#c9a4ff', { align: 'center' }); this.menu.draw(g, 50, 60, VW - 110, 11); Sprites.draw(g, 'luigi_idle', VW - 60, 100); }
};
/* ====================== HUB STATIONS ====================== */
const STATION_INFO = { map: ['Twitch-Monitor', 'Weltkarte & Level starten'], vods: ['YouTube-Monitor', 'VODs, Statistik, Trophäen'], luigi: ['Luigi', 'Perk-Shop & Verträge'], sinan: ['Sinan', 'Trainingsraum'], marx: ['Marx-Büste', 'Hinweis zum nächsten Level'], fridge: ['Kühlschrank', 'Start-Item einpacken'] };
class HubStation extends Entity {
  constructor(x, y, d) { super(x, y - 24, 16, 24); this.kind = d.kind; this.type = 'npc'; this.cd = 0; this.d = d; this.alwaysActive = true; }
  update() { this.anim++; if (this.cd > 0) this.cd--; const p = this.player; if (this.kind === 'deco') return; if (p && rectHit({ x: this.x - 10, y: this.y - 8, w: 36, h: 40 }, p) && Input.was('up') && this.cd <= 0 && !Game.cut) { this.cd = 20; this.activate(); } if (this.kind === 'sinan' && p && p.vy > 0 && rectHit(this, p) && p.bottom - this.y < 12) { p.y = this.y - p.h; p.vy = -8; p.airJumps = 0; AudioSys.sfx('bounce'); this.flex = 30; } if (this.flex > 0) this.flex--; }
  activate() {
    switch (this.kind) {
      case 'map': UI.open(WorldMap); break; case 'vods': UI.open(VodScreen); break; case 'luigi': UI.open(PerkShop); break; case 'fridge': UI.open(FridgeMenu); break;
      case 'marx': { const next = Math.min(10, Save.slot.unlocked); MarxOracle.ask(MARX_HINTS[next][0], true); break; }
      case 'sinan': { this.talk = (this.talk || 0) + 1; const lines = ['Bruder! Spring auf mich drauf, das ist Training.', 'Trainingsraum? Klar. Ich hol die Dummies.', 'Schau, wie definiert! Das ist alles Hafermilch.', 'Du bist zu spät für den Stream. Wie immer. Respekt.']; Game.speech(this, lines[(this.talk - 1) % lines.length], 120); if (this.talk % 2 === 0) { for (let i = 0; i < 3; i++) { const k = new Kartoni(this.x + 40 + i * 40, this.y); this.room.add(k); } Game.banner('Trainingsraum: 3 Kartonis. Stampfen üben!', '#ff5ad1'); } break; }
    }
  }
  draw(g) {
    const p = this.player; const near = p && Math.abs(p.cx - this.cx) < 30;
    switch (this.kind) {
      case 'map': g.fillStyle = '#26262e'; g.fillRect(this.x - 6, this.y - 4, 28, 22); g.fillStyle = '#9146ff'; g.fillRect(this.x - 4, this.y - 2, 24, 16); g.fillStyle = '#ffd700'; for (let i = 0; i < 5; i++) g.fillRect(this.x - 2 + i * 5, this.y + 4 + (i % 2) * 5, 3, 3); g.fillStyle = '#4c4c56'; g.fillRect(this.x + 6, this.y + 18, 4, 6); g.fillRect(this.x, this.y + 23, 16, 1); break;
      case 'vods': g.fillStyle = '#26262e'; g.fillRect(this.x - 6, this.y - 4, 28, 22); g.fillStyle = '#e03a3a'; g.fillRect(this.x - 4, this.y - 2, 24, 16); g.fillStyle = '#fff'; g.fillRect(this.x + 6, this.y + 3, 2, 6); g.fillRect(this.x + 8, this.y + 4, 2, 4); g.fillRect(this.x + 10, this.y + 5, 1, 2); g.fillStyle = '#4c4c56'; g.fillRect(this.x + 6, this.y + 18, 4, 6); g.fillRect(this.x, this.y + 23, 16, 1); break;
      case 'luigi': Sprites.draw(g, this.anim % 60 < 30 ? 'luigi_idle' : 'luigi_walk', this.x, this.y - 4, p && p.cx < this.cx); if (Save.slot && Save.slot.bits >= 150 && this.anim % 50 < 25) Font.draw(g, '!', this.cx, this.y - 14, '#ffd700', { align: 'center', shadow: true }); break;
      case 'sinan': Sprites.draw(g, this.flex > 0 || this.anim % 120 < 40 ? 'sinan_flex' : 'sinan_idle', this.x, this.y, p && p.cx < this.cx); break;
      case 'marx': Sprites.draw(g, 'marx_bust', this.x, this.y + 8); g.fillStyle = '#5b4636'; g.fillRect(this.x - 2, this.y + 24, 20, 2); break;
      case 'fridge': g.fillStyle = '#d4d4dc'; g.fillRect(this.x - 2, this.y - 8, 20, 32); g.fillStyle = '#eaeaf5'; g.fillRect(this.x, this.y - 6, 16, 12); g.fillRect(this.x, this.y + 8, 16, 14); g.fillStyle = '#8a8a96'; g.fillRect(this.x + 12, this.y - 2, 2, 5); g.fillRect(this.x + 12, this.y + 11, 2, 6); if (Save.slot && Save.slot.fridge) Sprites.draw(g, { hafer: 'hafer', mate: 'mate', ball: 'sinan_ball' }[Save.slot.fridge], this.x + 2, this.y - 4); g.fillStyle = '#7bd23a'; g.fillRect(this.x + 2, this.y - 12, 12, 3); break;
      case 'deco': this.drawDeco(g); return;
    }
    const info = STATION_INFO[this.kind]; if (info) { Font.draw(g, info[0], this.cx, this.y - 24, near ? '#fff' : '#8a8a96', { align: 'center', shadow: true }); if (near) { Font.draw(g, info[1], this.cx, this.y - 34, '#ffd700', { align: 'center', shadow: true }); if (this.anim % 40 < 20) Font.draw(g, '↑', this.cx, this.y - 44, '#fff', { align: 'center', shadow: true }); } }
  }
  drawDeco(g) {
    const v = this.d.variant;
    if (v === 'painting') { const cols = [['#e03a3a', '#ffd700', '#7bd23a'], ['#9146ff', '#ff5ad1', '#2fb8c9'], ['#f28c28', '#3a7bd5', '#fff']][this.d.n % 3]; g.fillStyle = '#5b4636'; g.fillRect(this.x - 2, this.y - 2, 28, 24); g.fillStyle = cols[0]; g.fillRect(this.x, this.y, 24, 20); g.fillStyle = cols[1]; g.fillRect(this.x + 4, this.y + 3, 16, 12); g.fillStyle = cols[2]; g.fillRect(this.x + 7, this.y + 6, 3, 3); g.fillRect(this.x + 14, this.y + 6, 3, 3); g.fillStyle = '#000'; g.fillRect(this.x + 8, this.y + 12, 8, 2); }
    else if (v === 'plant') { g.fillStyle = '#c47a0f'; g.fillRect(this.x + 3, this.y + 14, 10, 10); g.fillStyle = '#3fa34d'; g.fillRect(this.x + 1, this.y + 2, 4, 12); g.fillRect(this.x + 6, this.y - 2, 4, 16); g.fillRect(this.x + 11, this.y + 4, 4, 10); g.fillStyle = '#7bd23a'; g.fillRect(this.x + 7, this.y, 2, 4); }
    else if (v === 'sign') { g.fillStyle = '#101014'; g.fillRect(this.x - 4, this.y, 60, 12); Font.draw(g, 'LEGALISIER', this.x - 1, this.y + 3, this.anim % 60 < 30 ? '#7bd23a' : '#a4e04a'); }
    else if (v === 'mic') { g.fillStyle = '#4c4c56'; g.fillRect(this.x + 6, this.y + 4, 3, 20); g.fillStyle = '#26262e'; g.fillRect(this.x + 3, this.y, 9, 7); g.fillStyle = '#8a8a96'; g.fillRect(this.x + 4, this.y + 1, 7, 5); g.fillStyle = '#e03a3a'; g.fillRect(this.x + 7, this.y + 8, 1, 1); }
    else if (v === 'shelf') { g.fillStyle = '#8b5a2b'; g.fillRect(this.x - 8, this.y + 10, 40, 3); g.fillRect(this.x - 8, this.y - 6, 40, 3); Sprites.draw(g, 'kartoni_1', this.x - 6, this.y - 22); g.fillStyle = '#e03a3a'; g.fillRect(this.x + 12, this.y - 2, 6, 12); g.fillStyle = '#3a5b8c'; g.fillRect(this.x + 12, this.y + 4, 6, 6); g.fillStyle = '#f2c9a0'; g.fillRect(this.x + 13, this.y - 6, 4, 4); g.fillStyle = '#8b5a2b'; g.fillRect(this.x + 22, this.y, 8, 10); g.fillStyle = '#f2c9a0'; g.fillRect(this.x + 24, this.y + 2, 4, 3); }
    else if (v === 'kabel') { g.fillStyle = '#f4d03f'; g.fillRect(this.x, this.y + 20, 60, 2); g.fillRect(this.x + 58, this.y + 8, 2, 14); g.fillStyle = '#4c4c56'; g.fillRect(this.x - 4, this.y + 16, 8, 8); }
  }
}
HUB_DEF.ents = [
  { t: 'station', x: 5, y: 12, kind: 'map' }, { t: 'station', x: 11, y: 12, kind: 'vods' }, { t: 'station', x: 17, y: 12, kind: 'luigi' }, { t: 'station', x: 24, y: 12, kind: 'sinan' }, { t: 'station', x: 30, y: 12, kind: 'marx' }, { t: 'station', x: 36, y: 12, kind: 'fridge' },
  { t: 'station', x: 3, y: 5, kind: 'deco', variant: 'painting', n: 0 }, { t: 'station', x: 9, y: 4, kind: 'deco', variant: 'painting', n: 1 }, { t: 'station', x: 15, y: 5, kind: 'deco', variant: 'painting', n: 2 }, { t: 'station', x: 21, y: 6, kind: 'deco', variant: 'sign' },
  { t: 'station', x: 27, y: 11, kind: 'deco', variant: 'plant' }, { t: 'station', x: 33, y: 11, kind: 'deco', variant: 'plant' }, { t: 'station', x: 8, y: 11, kind: 'deco', variant: 'mic' }, { t: 'station', x: 28, y: 6, kind: 'deco', variant: 'shelf' }, { t: 'station', x: 38, y: 11, kind: 'deco', variant: 'kabel' },
];
/* ====================== WORLD MAP ====================== */
const MAP_NODES = [[28, 58, 'Berlin'], [64, 40, 'Kiez'], [104, 62, 'Amt'], [146, 42, 'Franken'], [186, 70, 'Unterwelt'], [226, 46, 'Wald'], [268, 74, 'Wien'], [252, 118, 'Tower'], [186, 134, 'NIXNET'], [110, 146, 'Glasfaser']];
const WorldMap = {
  sel: 0, t: 0,
  open() { this.t = 0; const s = Save.slot; this.sel = Math.min(10, s.unlocked) - 1; },
  unlocked(no) { const s = Save.slot; return no <= s.unlocked || s.warps.includes(no); },
  update() { this.t++; if (Input.was('left')) { let n = this.sel; do { n = (n + 9) % 10; } while (!this.unlocked(n + 1)); this.sel = n; AudioSys.sfx('move'); } if (Input.was('right')) { let n = this.sel; do { n = (n + 1) % 10; } while (!this.unlocked(n + 1)); this.sel = n; AudioSys.sfx('move'); }
    if (Input.was('ok') && this.t > 5) { UI.closeAll(); Game.startLevel(this.sel + 1); } if (Input.was('back')) UI.close(); },
  draw(g) { const s = Save.slot; g.fillStyle = '#0e0e10'; g.fillRect(0, 0, VW, VH); g.fillStyle = '#141428'; for (let y = 0; y < 170; y += 8) for (let x = (y / 8) % 2 * 8; x < VW; x += 16) g.fillRect(x, y, 8, 8);
    twitchHeader(g, 'TWITCH-MONITOR · WELTKARTE', 4);
    // cable
    g.strokeStyle = '#f4d03f'; g.lineWidth = 2; g.beginPath(); MAP_NODES.forEach((n, i) => { if (i === 0) g.moveTo(n[0], n[1]); else g.lineTo(n[0], n[1]); }); g.stroke();
    g.strokeStyle = '#7a6a1a'; g.lineWidth = 1; g.setLineDash([3, 3]); g.lineDashOffset = -this.t / 4; g.beginPath(); MAP_NODES.forEach((n, i) => { if (i === 0) g.moveTo(n[0], n[1]); else g.lineTo(n[0], n[1]); }); g.stroke(); g.setLineDash([]);
    MAP_NODES.forEach((n, i) => { const no = i + 1, un = this.unlocked(no), done = s.levelsDone.includes(no); const sel = i === this.sel; g.fillStyle = '#000'; g.fillRect(n[0] - 7, n[1] - 7, 14, 14); g.fillStyle = done ? '#7bd23a' : un ? '#9146ff' : '#3a3a44'; g.fillRect(n[0] - 6, n[1] - 6, 12, 12); Font.draw(g, String(no), n[0], n[1] - 3, un ? '#fff' : '#6a6a76', { align: 'center' }); if (!un) Sprites.draw(g, 'lock', n[0] + 2, n[1] - 12); if (s.warps.includes(no) && no > s.unlocked) Font.draw(g, 'W', n[0] + 6, n[1] - 12, '#e03a3a'); Font.draw(g, n[2], n[0], n[1] + 9, sel ? '#ffd700' : '#8a8a96', { align: 'center' }); if (sel) { Sprites.draw(g, 'imp_idle', n[0] - 8, n[1] - 30 + Math.sin(this.t * 0.15) * 2); } const subs = s.subs[no] || []; for (let k = 1; k <= 3; k++) Font.draw(g, '♥', n[0] - 9 + (k - 1) * 7, n[1] + 17, subs.includes(k) ? '#ff5ad1' : '#3a3a44'); });
    // info panel
    const no = this.sel + 1; const def = LEVEL_META[no]; box(g, 4, 170, VW - 8, 66, '#1a1a22', '#9146ff');
    Font.draw(g, 'LEVEL ' + no + ': ' + def.title, 10, 175, '#ffd700'); Font.draw(g, def.subtitle, 10, 185, '#c8c8d0');
    const best = s.bestTimes[no]; Font.draw(g, 'Bestzeit: ' + (best ? fmtMs(best) : '--:--') + ' · Peak: ' + (s.peakViewers[no] || 0) + ' · HOLF: ' + ((s.holfs[no] || []).map(h => ({ gold: 'G', silver: 'S', bronze: 'B', green: 'Gr' }[h])).join(',') || '-'), 10, 196, '#8a8a96');
    Font.draw(g, 'Werbepartner: ' + SPONSORS[no].name + (s.sponsors.includes(SPONSORS[no].name) ? ' ✓' : ''), 10, 206, s.sponsors.includes(SPONSORS[no].name) ? '#7bd23a' : '#efeff1');
    Font.draw(g, '←/→ Level · ENTER Stream starten · ESC', 10, 222, '#8a8a96'); }
};
const LEVEL_META = { 1: { title: 'Umzugskartons', subtitle: 'Die neue Wohnung' }, 2: { title: 'WLAN-Jagd im Kiez', subtitle: 'Nacht, Neon, NIXNET' }, 3: { title: 'Das Amt', subtitle: 'Bürgeramt für Anschlussangelegenheiten' }, 4: { title: 'Schanzenhof', subtitle: 'Fränkische Provinz · Boss: Drachenlord' }, 5: { title: 'Röhren-Labyrinth', subtitle: 'Berliner Unterwelt · Kabelsalat-König' }, 6: { title: 'Honigwald', subtitle: 'Bitte nicht füttern · Boss: Baba' }, 7: { title: 'Wien bei Nacht', subtitle: 'Oida. · Der Herr Ober' }, 8: { title: 'YouTube-Tower', subtitle: 'Nach oben · Boss: Der Algorithmus' }, 9: { title: 'NIXNET-Zentrale', subtitle: 'Ihr Anschluss ist uns wichtig · Volker' }, 10: { title: 'Glasfaser-Unterwelt', subtitle: 'Endboss: NIXI 3000' } };
/* ====================== PERK SHOP (Luigi) ====================== */
const PerkShop = {
  menu: null, tab: 0,
  open() { this.tab = 0; this.build(); },
  slots() { const s = Save.slot; return 1 + (s.levelsDone.includes(3) ? 1 : 0) + (s.levelsDone.includes(6) ? 1 : 0); },
  build() { const s = Save.slot; const items = Object.keys(PERKS).map(id => { const p = PERKS[id]; return { id, label: () => (s.equipped.includes(id) ? '[x] ' : s.perks.includes(id) ? '[ ] ' : '    ') + p.name, right: () => s.perks.includes(id) ? (s.equipped.includes(id) ? 'aktiv' : 'gekauft') : p.cost + ' Bits', hint: p.desc, action: it => this.act(it) }; }); items.push({ label: 'Fertig', action: () => UI.close() }); this.menu = new Menu(items, { onBack: () => UI.close(), start: this.menu ? this.menu.i : 0 }); },
  act(it) { const s = Save.slot; const id = it.id; if (!s.perks.includes(id)) { const cost = PERKS[id].cost; if (s.bits < cost) { AudioSys.sfx('back'); Game.banner('Zu wenig Bits. Luigi: "Ich kann dir nichts vorstrecken."', '#e03a3a'); return; } s.bits -= cost; s.perks.push(id); AudioSys.sfx('power'); Game.banner('Perk gekauft: ' + PERKS[id].name, '#7bd23a'); }
    if (s.equipped.includes(id)) { s.equipped = s.equipped.filter(x => x !== id); AudioSys.sfx('back'); } else if (s.equipped.length < this.slots()) { s.equipped.push(id); AudioSys.sfx('select'); } else { Game.banner('Alle Slots belegt. Erst einen Perk abwählen.', '#e03a3a'); AudioSys.sfx('back'); } Save.store(); },
  update() { if (Input.was('left') || Input.was('right')) { this.tab = 1 - this.tab; AudioSys.sfx('move'); } if (this.tab === 0) this.menu.update(); else if (Input.was('back') || Input.was('ok')) UI.close(); },
  draw(g) { const s = Save.slot; dim(g, 0.75); twitchHeader(g, 'LUIGI · ' + (this.tab === 0 ? 'PERK-SHOP' : 'VERTRAGSORDNER') + '   (←/→ wechseln)', 4);
    if (this.tab === 0) { box(g, 4, 16, VW - 8, 220); Font.draw(g, 'Bits: ' + s.bits + '   Slots: ' + s.equipped.length + '/' + this.slots() + (this.slots() < 3 ? '  (mehr nach Level 3 & 6)' : ''), 10, 22, '#c9a4ff'); this.menu.draw(g, 18, 34, VW - 36, 10); const cur = this.menu.cur; if (cur && cur.hint) { g.fillStyle = '#26262e'; g.fillRect(8, 196, VW - 16, 34); Font.drawWrapped(g, cur.hint, 12, 200, 50, '#efeff1'); } }
    else { box(g, 4, 16, VW - 8, 220); Font.draw(g, 'Unterschriebene Werbepartner: ' + s.sponsors.length + '/10', 10, 22, '#ffd700'); for (let i = 1; i <= 10; i++) { const sp = SPONSORS[i]; const has = s.sponsors.includes(sp.name); Font.draw(g, (has ? '✓ ' : '· ') + sp.name, 12, 34 + (i - 1) * 16, has ? '#7bd23a' : '#5a5a66'); Font.draw(g, has ? '"' + sp.slogan + '"' : '???', 22, 42 + (i - 1) * 16, has ? '#c8c8d0' : '#3a3a44'); } Sprites.draw(g, 'luigi_idle', VW - 40, 200); Font.draw(g, 'Luigi: "Alles rechtssicher. Glaub ich."', VW - 14, 224, '#7bd23a', { align: 'right' }); } }
};
/* ====================== FRIDGE ====================== */
const FridgeMenu = {
  menu: null,
  open() { const s = Save.slot; const opts = [{ kind: 'hafer', name: 'Hafermilch', cost: 30 }, { kind: 'mate', name: 'Späti-Mate', cost: 40 }, { kind: 'ball', name: 'Sinans Basketball', cost: 60 }]; this.menu = new Menu(opts.map(o => ({ label: o.name, right: () => s.fridge === o.kind ? 'eingepackt' : o.cost + ' Bits', action: () => { if (s.fridge === o.kind) return; if (s.bits < o.cost) { AudioSys.sfx('back'); Game.banner('Zu wenig Bits.', '#e03a3a'); return; } s.bits -= o.cost; s.fridge = o.kind; Save.store(); AudioSys.sfx('power'); Game.banner(o.name + ' eingepackt. Startet mit dir ins nächste Level.', '#7bd23a'); } })).concat([{ label: 'Kühlschrank leeren', action: () => { s.fridge = null; Save.store(); } }, { label: 'Zu', action: () => UI.close() }]), { onBack: () => UI.close() }); },
  update() { this.menu.update(); },
  draw(g) { dim(g, 0.6); box(g, 60, 60, VW - 120, 100, '#1a1a22', '#7fd6ff'); Font.draw(g, 'KÜHLSCHRANK', VW / 2, 66, '#7fd6ff', { align: 'center' }); Font.draw(g, 'Start-Item fürs nächste Level', VW / 2, 76, '#8a8a96', { align: 'center' }); this.menu.draw(g, 80, 90, VW - 170, 12); }
};
/* ====================== VODS / STATISTIK / TROPHÄEN ====================== */
const SKINS = [['default', 'Standard', () => true], ['batik', 'Batik-Shirt (5x HOLF Gold)', () => Object.values(Save.slot.holfs).filter(h => h.includes('gold')).length >= 5], ['cap', 'Sinans Cap (Spiel beendet)', () => Save.slot.finished]];
const VodScreen = {
  tab: 0, menu: null, t: 0,
  open() { this.tab = 0; this.t = 0; this.build(); },
  build() { const s = Save.slot; const seen = Object.keys(SCENES).filter(id => s.seen[id]); const items = seen.map(id => ({ label: this.sceneName(id), action: () => { ScenePlayer.play(id, () => { }); } })); if (!items.length) items.push({ label: 'Noch keine VODs', disabled: true }); items.push({ label: 'Zurück', action: () => UI.close() }); this.menu = new Menu(items, { onBack: () => UI.close() }); },
  sceneName(id) { if (SceneNames[id]) return SceneNames[id]; const m = id.match(/l(\d+)_(\w+)/); if (m) return 'Level ' + m[1] + ': ' + { intro: 'Intro', boss: 'Boss-Auftritt', outro: 'Werbepartner' }[m[2]]; return id; },
  update() { this.t++; if (Input.was('left') || Input.was('right')) { this.tab = (this.tab + (Input.was('left') ? 2 : 1)) % 3; AudioSys.sfx('move'); } if (this.tab === 0) this.menu.update(); else if (this.tab === 2) { if (Input.was('ok')) { const s = Save.slot; const av = SKINS.filter(k => k[2]()); const i = av.findIndex(k => k[0] === s.skin); s.skin = av[(i + 1) % av.length][0]; Save.store(); AudioSys.sfx('select'); if (Game.level && Game.level.player) Game.level.player.skin = s.skin; } if (Input.was('back')) UI.close(); } else if (Input.was('back') || Input.was('ok')) UI.close(); },
  draw(g) { const s = Save.slot; dim(g, 0.8); twitchHeader(g, 'YOUTUBE · ' + ['VODs', 'STATISTIK', 'TROPHÄEN'][this.tab] + '   (←/→ wechseln)', 4); box(g, 4, 16, VW - 8, 220, '#1a1a22', '#e03a3a');
    if (this.tab === 0) { Font.draw(g, 'Cutscenes erneut ansehen', 10, 22, '#8a8a96'); this.menu.draw(g, 20, 34, VW - 40, 10); }
    else if (this.tab === 1) { const st = s.stats; const rows = [['Tode', st.deaths], ['Gegner gestampft', st.stomps], ['Witze erzählt', st.jokes], ['Marx gefragt', st.marx], ['Chat-Polls', st.polls], ['Bits insgesamt', s.totalBits], ['Spielzeit', fmtTime(Math.floor(st.playtime / 60))], ['Level geschafft', s.levelsDone.length + '/10'], ['Perks', s.perks.length + '/15'], ['Warp-Zonen', s.warps.length + '/3']]; rows.forEach((r, i) => { Font.draw(g, r[0], 14, 26 + i * 14, '#c8c8d0'); Font.draw(g, String(r[1]), VW - 14, 26 + i * 14, '#fff', { align: 'right' }); }); Font.draw(g, 'Luigi: "Die Zahlen sind echt. Leider."', VW / 2, 190, '#7bd23a', { align: 'center' }); }
    else { Font.draw(g, 'Lv  Abos    HOLF        Bestzeit   Peak', 10, 22, '#8a8a96'); for (let no = 1; no <= 10; no++) { const y = 32 + (no - 1) * 13; const subs = s.subs[no] || [], h = s.holfs[no] || []; Font.draw(g, String(no).padStart(2), 10, y, '#fff'); for (let k = 1; k <= 3; k++) Font.draw(g, '♥', 30 + (k - 1) * 7, y, subs.includes(k) ? '#ff5ad1' : '#3a3a44'); ['gold', 'silver', 'bronze', 'green'].forEach((k, i) => Font.draw(g, '★', 62 + i * 8, y, h.includes(k) ? { gold: '#ffd700', silver: '#d4d4dc', bronze: '#c47a0f', green: '#7bd23a' }[k] : '#3a3a44')); Font.draw(g, s.bestTimes[no] ? fmtMs(s.bestTimes[no]) : '--:--.--', 118, y, '#efeff1'); Font.draw(g, String(s.peakViewers[no] || 0), 190, y, '#c8c8d0'); }
      const sk = SKINS.find(k => k[0] === s.skin); Font.draw(g, 'Skin: ' + (sk ? sk[1] : s.skin) + '  (ENTER wechseln)', 10, 168, '#ffd700'); SKINS.forEach((k, i) => Font.draw(g, (k[2]() ? '✓ ' : '· ') + k[1], 14, 180 + i * 10, k[2]() ? '#7bd23a' : '#5a5a66')); Sprites.draw(g, (s.skin === 'batik' ? 'batik' : s.skin === 'cap' ? 'cap' : 'imp') + '_idle', VW - 40, 176); } }
};
