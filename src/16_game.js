/* =====================================================================
   16 game: Level-Aufbau (Räume + Röhren-Verknüpfung), Game-Objekt,
   Hauptschleife mit festem Zeitschritt, Rendering, Bootstrap
   ===================================================================== */
class Level {
  constructor(def) {
    Object.assign(this, def); this.rooms = {}; this.player = null; this.room = null;
    // main room
    this.addRoom('main', Object.assign({}, def.main, { pipeTags: null, fallDeath: true, lockCamStart: true }));
    // bonus rooms: k-th bonus pipe → BONUS[bonuses[k]]
    (def.bonuses || []).forEach((name, k) => { const b = BONUS[name]; this.addRoom('bonus' + k, Object.assign({}, b, { kind: name, theme: name === 'warp' ? 'w5' : def.theme })); });
    if (def.sec2) this.addRoom('sec2', Object.assign({}, def.sec2, { fallDeath: true }));
    if (def.maze) this.addRoom('maze', def.maze);
    if (def.tower) this.addRoom('tower', Object.assign({}, def.tower, { theme: def.theme }));
    if (def.boss) this.addRoom('boss', Object.assign({}, def.boss, { theme: def.boss.theme || def.theme }));
    this.linkPipes();
  }
  addRoom(id, rdef) { const r = new Room(this, id, rdef); this.rooms[id] = r; return r; }
  // tag pipes in a room: rdef.pipeTags (handmade) or pipePlan (assembled)
  tagPipes(room) {
    const d = room.def; const pipes = room.pipes; const byTag = {};
    if (d.pipePlan && d.pipePlan.length) {
      for (const plan of d.pipePlan) { const ps = pipes.filter(p => p.tx >= plan.x0 && p.tx < plan.x1 && p.linked).sort((a, b) => a.x - b.x); plan.tags.forEach((t, i) => { if (ps[i]) { ps[i].tag = t; byTag[t] = byTag[t] || []; byTag[t].push(ps[i]); } }); }
    }
    if (d.pipeTags) { const linked = pipes.filter(p => p.linked).sort((a, b) => a.x - b.x || a.y - b.y); d.pipeTags.forEach((t, i) => { if (linked[i]) { linked[i].tag = t; byTag[t] = byTag[t] || []; byTag[t].push(linked[i]); } }); }
    room.byTag = byTag; return byTag;
  }
  linkPipes() {
    for (const id in this.rooms) this.tagPipes(this.rooms[id]);
    const link = (a, b) => { if (!a || !b) return; a.to = { room: b.roomId, pipe: b }; };
    for (const id in this.rooms) { const r = this.rooms[id]; for (const p of r.pipes) p.roomId = id; }
    const first = (room, tag) => room && room.byTag[tag] && room.byTag[tag][0];
    const nth = (room, tag, k) => room && room.byTag[tag] && room.byTag[tag][k];
    // bonus rooms (main + sec2 both may have bIn pipes; enumerate globally)
    let k = 0; const seq = ['main', 'sec2'];
    for (const rid of seq) { const r = this.rooms[rid]; if (!r) continue; const ins = r.byTag.bIn || [], outs = r.byTag.bOut || []; ins.forEach((pin, i) => { const b = this.rooms['bonus' + k]; if (b) { link(pin, first(b, 'in')); link(first(b, 'out'), outs[i] || pin); if (b.def.kind === 'warp') { ['w5', 'w6', 'w8'].forEach(w => { const wp = first(b, w); if (wp) wp.to = { warp: +w.slice(1) }; }); } } k++; }); }
    // boss pipe
    for (const rid of ['main', 'sec2', 'tower']) { const r = this.rooms[rid]; if (!r) continue; const tb = first(r, 'toBoss'); if (tb && this.rooms.boss) { link(tb, first(this.rooms.boss, 'in')); } const tn = first(r, 'toNext'); if (tn) { const nx = this.rooms.tower || this.rooms.sec2; if (nx) { const target = first(nx, 'secIn') || first(nx, 'in'); if (target) link(tn, target); else tn.to = { room: nx.id, spawn: true }; } } }
    // L2 boss return pipe → back to main boss pipe
    if (this.rooms.boss && this.rooms.boss.byTag.ret) link(first(this.rooms.boss, 'ret'), first(this.rooms.main, 'toBoss'));
    // L5 maze links: 4 pipes mzA..mzD: third from left (mzC) → sec2 secIn; others → maze 'in' (dead end), maze 'out' → back to main mzA
    if (this.mazeLinks) { const m = this.rooms.main; const maze = this.rooms.maze, sec = this.rooms.sec2; ['mzA', 'mzB', 'mzD'].forEach(t => link(first(m, t), first(maze, 'in'))); link(first(m, 'mzC'), first(sec, 'secIn')); link(first(maze, 'out'), first(m, 'mzA')); }
    // tower: kill 'in' if unused
  }
  get spawnRoom() { return this.rooms.main; }
}
/* ======================= GAME ======================= */
const Game = {
  state: 'boot', frame: 0, level: null, levelNo: 0, bits: 0, brb: 5, viewerCount: 0, peak: 0, time: 0, timeMax: 0, hype: 0, slowmo: 0, shake: 0, cut: false, pollActive: false, ticket: null, demonT: 0, plugged: false,
  levelSubs: [], perksActive: [], checkpoint: null, marxUsed: false, primeUsed: false, levelDeaths: 0, levelStart: 0, levelBits: 0, transition: null, gemaCount: 0, difficulty: 'normal', warpFlashSkip: false, hubRoom: null, pendingWarp: null, elapsedMs: 0, flash: 0, darkT: 0, timeWarned: false, bossActive: false, endingPlayed: false,
  get bitsDisplay() { return this.bits; },
  // ---------- boot ----------
  init() { Save.load(); Input.init(); AudioSys.init(); Tiles.set('w1'); this.state = 'title'; UI.open(TitleScreen, true); },
  // ---------- flow ----------
  newGame() { UI.closeAll(); this.state = 'scene'; Chat.reset(); ScenePlayer.play('prologue', () => { Save.slot.prologueSeen = true; Save.store(); this.enterHub(); }); },
  enterHub(fromLoad) {
    UI.closeAll(); MarxOracle.open = false; this.transition = null; this.level = null; this.state = 'hub'; this.cut = false; this.pollActive = false; Banner.clear(); Poll.active = false; HypeTrain.reset(); this.slowmo = 0; AudioSys.setSpeed(1); AudioSys.setOffline(false);
    const s = Save.slot; this.bits = s.bits; this.brb = s.brb; this.difficulty = s.difficulty; this.perksActive = s.equipped.slice();
    const lvl = { no: 0, theme: 'hub', music: 'hub', sponsor: SPONSORS[1], hints: MARX_HINTS[Math.min(10, s.unlocked)], powerItem: 'hafer', title: 'Streaming-Zimmer', holfKind: 'gold', rooms: {} };
    const room = new Room(lvl, 'hub', HUB_DEF); lvl.rooms.hub = room; lvl.room = room; this.level = lvl; this.levelNo = 0; this.levelSubs = [];
    const p = new Player(room.spawnPt.x, room.spawnPt.y); lvl.player = p; room.spawnAll(); room.add(p, true); p.active = true; room.camX = 0; Tiles.set('hub'); AudioSys.play('hub'); Chat.react('levelstart');
    if (s.finished && !s.postEnding) { s.postEnding = true; Save.store(); Game.speech(p, 'Kanal gerettet. Und jetzt: Bestzeiten jagen!', 150); }
    if (fromLoad) Chat.sys('Kanal geladen. Willkommen zurück.');
    if (this.pendingWarp) { const w = this.pendingWarp; this.pendingWarp = null; this.startLevel(w); }
  },
  startLevel(no, opts = {}) {
    UI.closeAll(); MarxOracle.open = false; this.transition = null; const s = Save.slot; this.difficulty = s.difficulty; this.perksActive = s.equipped.slice();
    const def = LEVELS[no](); def.no = no; this.level = new Level(def); this.levelNo = no; this.level.player = null;
    this.levelSubs = []; this.checkpoint = null; this.marxUsed = false; this.primeUsed = false; this.levelDeaths = 0; this.levelBits = 0; this.ticket = null; this.demonT = 0; this.plugged = false; this.gemaCount = 0; this.timeWarned = false; this.bossActive = false; this.viewerCount = 50 + s.sponsors.length * 20; this.peak = this.viewerCount; this.levelStart = performance.now(); this.elapsedMs = 0; this.slowmo = 0; AudioSys.setSpeed(1); AudioSys.setOffline(false); HypeTrain.reset(); Poll.active = false; this.pollActive = false; this.cut = false; Banner.clear();
    const base = this.difficulty === 'chill' ? 12 : this.difficulty === 'hard' ? 6 : 8; this.timeMax = base * 60 * 60; this.time = this.timeMax;
    this.bits = s.bits; this.brb = s.brb;
    const room = this.level.rooms.main; this.enterRoom('main', null, true);
    const p = this.level.player; if (s.fridge) { p.powerUp(s.fridge); s.fridge = null; Save.store(); }
    this.state = 'play'; Tiles.set(this.level.theme); Chat.reset(); Chat.react('levelstart');
    const intro = () => { UI.open(IntroCard, true); };
    if (def.scenes && def.scenes.intro && !opts.skipScene) { this.state = 'scene'; ScenePlayer.play(def.scenes.intro, intro); } else intro();
  },
  afterIntroCard() { this.state = 'play'; AudioSys.play(this.level.room.music); this.levelStart = performance.now(); this.level.player.controlLock = 10; },
  enterRoom(id, viaPipe, initial) {
    const L = this.level; const room = L.rooms[id]; if (!room) return; const prev = L.room; L.room = room;
    let p = L.player; if (!p) { p = new Player(room.spawnPt ? room.spawnPt.x : 40, room.spawnPt ? room.spawnPt.y : 100); L.player = p; }
    if (!room.entered) { room.entered = true; room.spawnAll(); if (room.def.haider) { for (const h of room.def.haider) { const e = new Haider(h[0] * TILE, h[1] * TILE); e.alwaysActive = true; e.noContact = false; room.add(e, true); } } }
    if (prev && prev !== room) { prev.ents = prev.ents.filter(e => e !== p); }
    if (!room.ents.includes(p)) room.add(p, true); p.active = true;
    if (viaPipe && viaPipe.pipe) { p.exitFromPipe(viaPipe.pipe); } else if (viaPipe && viaPipe.spawn && room.spawnPt) { p.x = room.spawnPt.x; p.y = room.spawnPt.y; p.pipeT = 0; } else if (room.spawnPt) { p.x = room.spawnPt.x; p.y = room.spawnPt.y; }
    p.vx = 0; p.vy = 0; p.dropCarry(); p.riding = null;
    room.camX = clamp(p.cx - VW / 2, room.camMinX, room.camMaxX); room.camY = room.autoScroll ? Math.max(0, p.y - VH + 60) : clamp(p.cy - VH * 0.55, 0, room.camMaxY);
    if (room.autoScroll) room.camY = clamp(p.y + p.h - VH + 40, 0, room.camMaxY);
    Tiles.set(room.theme); if (!initial) { if (room.music !== (prev && prev.music) || !AudioSys.songName) AudioSys.play(room.music); AudioSys.setOffline(room.playerOffline(p.cx)); }
    if (room.def.shop && !initial) Chat.react('shop'); if (room.def.warp) { Chat.react('warp'); if (!Save.slot.warps.includes(-L.no)) { Save.slot.warps.push(-L.no); } }
    if (id === 'boss' && !this.bossActive) { this.bossActive = true; const sc = L.scenes && L.scenes.boss; const start = () => { AudioSys.play(room.music); Chat.react('boss'); }; if (sc && !Save.slot.seen[sc]) { this.state = 'scene'; ScenePlayer.play(sc, () => { this.state = 'play'; this.cut = false; start(); }); } else start(); }
    if (id === 'tower') { Game.banner('Der Tower steigt. Bleib im Bild!', '#e03a3a'); }
    if (id === 'sec2' && L.no === 5) Game.banner('Richtige Röhre! Marx hatte recht.', '#7bd23a');
    if (room.def.kind === 'shop') Game.banner('Späti24: ↓ vor dem Regal drücken', '#7bd23a');
  },
  pipeTravel(pipe) {
    const p = this.level.player; const to = pipe.to; if (!to) { p.pipeT = 0; return; }
    if (to.warp) { this.doWarp(to.warp); return; }
    if (!to.room || !this.level.rooms[to.room]) { p.pipeT = 0; return; }
    this.transition = { t: 0, fn: () => { this.enterRoom(to.room, { pipe: to.pipe, spawn: to.spawn }); Chat.react('pipe'); } }; this.cut = true;
  },
  doWarp(no) { const s = Save.slot; if (!s.warps.includes(no)) s.warps.push(no); Save.store(); this.banner('WARP ZONE: Level ' + no + '!', '#e03a3a'); AudioSys.sfx('warp'); this.transition = { t: 0, fn: () => { this.saveProgress(); this.startLevel(no); } }; this.cut = true; },
  // ---------- shop (in-level) ----------
  tryShop() { const r = this.level.room; if (r.def.shop && !UI.top && Input.was('down') && this.level.player.onGround) { UI.open(SpaetiShop); return true; } return false; },
  // ---------- economy ----------
  addBits(n, silent) { if (n > 0) { n = Math.round(n * HypeTrain.bitMul); this.levelBits += n; Save.slot.totalBits += n; } this.bits = Math.max(0, this.bits + n); if (n >= 100) Chat.react('bits100'); if (this.bits >= 100 && !silent && n > 0 && Math.floor((this.bits - n) / 100) < Math.floor(this.bits / 100) && this.difficulty !== 'hard') { /* every 100 bits: viewer boost */ this.viewers(20); } },
  addBRB(n) { this.brb += n; if (n > 0) { AudioSys.sfx('brb'); Chat.react('brb'); } },
  viewers(n) { const mul = HypeTrain.level >= 3 ? 2 : 1; this.viewerCount = Math.max(0, this.viewerCount + Math.round(n * mul)); if (this.viewerCount > this.peak) this.peak = this.viewerCount; },
  hypeAdd(n) { HypeTrain.add(n); this.hype = HypeTrain.level; },
  hypeHit() { HypeTrain.hit(); this.hype = HypeTrain.level; },
  banner(txt, col) { Banner.show(txt, col); },
  speech(ent, txt, dur, small) { if (!this.level || !this.level.room) return; const r = this.level.room; r.ents = r.ents.filter(e => !(e instanceof Speech && e.target === ent)); r.add(new Speech(ent, txt, dur || 120, small)); },
  collectSub(tier, ent) { if (!this.levelSubs.includes(tier)) this.levelSubs.push(tier); AudioSys.sfx('sub'); this.viewers(60 * tier); this.hypeAdd(20); burst(ent.cx, ent.cy, ['#9146ff', '#ff5ad1', '#fff'], 14, 2.5); popup(ent.cx, ent.y - 10, 'NEW SUB! Tier ' + tier, '#ff5ad1'); Chat.react('sub', true); Chat.sys(pick(CHAT_NAMES)[0] + ' hat Tier ' + tier + ' abonniert!'); },
  stolenSub(tier, lost) { if (lost) { this.banner('Abo Tier ' + tier + ' ist weg! (Level neu für alle 3)', '#e03a3a'); } else this.banner('Der Dieb hat dein Tier-' + tier + '-Abo! Hol ihn ein!', '#e03a3a'); },
  setCheckpoint(cp) { this.checkpoint = { room: this.level.room.id, x: cp.x, y: cp.bottom - 22 }; this.saveProgress(); },
  askMarx(hint, free) { if (MarxOracle.open) return; MarxOracle.ask(hint, free); },
  modRuf() { const r = this.level.room; const p = this.level.player; let n = 0; for (const e of r.ents) if ((e.isEnemy || e.type === 'proj') && !e.dead && !e.boss && e.active) { e.kill ? e.kill('ban') : (e.dead = true); n++; } AudioSys.sfx('ban'); shake(6); this.banner('LUIGI: BANNHAMMER! ' + n + ' gebannt.', '#7bd23a'); Chat.react('modruf', true); spawnFx(p.x - 10, p.y - 30, { spr: 'luigi_hammer', life: 60, gravity: 0, vy: -0.2 }); this.viewers(n * 5); },
  gemaMute(e) { this.gemaCount++; AudioSys.sfx('gema'); AudioSys.setOffline(true); Chat.react('gema'); this.banner('GEMA-Gnom: Musik stummgeschaltet!', '#e03a3a'); },
  gemaUnmute(e) { this.gemaCount = Math.max(0, this.gemaCount - 1); if (this.gemaCount === 0) { AudioSys.setOffline(this.level.room.playerOffline(this.level.player.cx)); AudioSys.sfx('unmute'); } },
  hotlineCombo() { this.hotlineN = (this.hotlineN || 0) + 1; if (this.hotlineN % 3 === 0) { this.addBits(5); popup(this.level.player.cx, this.level.player.y - 20, 'Hotline-Combo +5', '#7bd23a'); } },
  updateOfflineState() { const r = this.level.room; AudioSys.setOffline(this.gemaCount > 0 || r.playerOffline(this.level.player.cx)); },
  pluggedIn() { this.plugged = true; AudioSys.sfx('plug'); shake(10); this.banner('STECKER DRIN! Verbindung wird hergestellt...', '#7bd23a'); Chat.react('plug', true); const b = this.level.room.boss; if (b && !b.defeated) { b.hp = 1; b.damage(1, 'plug'); } },
  startPoll(def, trig) { if (this.difficulty === 'x') return; Poll.start(def, trig); },
  playScene(id) { this.state = 'scene'; ScenePlayer.play(id, () => { this.state = 'play'; this.cut = false; }); },
  // ---------- death ----------
  onPlayerDeath() { this.levelDeaths++; Save.slot.stats.deaths++; Chat.react('death', true); HypeTrain.hit(); this.slowmo = 0; AudioSys.setSpeed(1); this.ticket = null; },
  afterDeath() {
    this.brb--; const p = this.level.player;
    if (this.brb < 0) { Save.slot.brb = this.difficulty === 'hard' ? 3 : this.difficulty === 'chill' ? 7 : 5; Save.slot.bits = Math.floor(this.bits / 2); Save.store(); this.state = 'gameover'; UI.open(GameOverScreen, true); return; }
    const useClip = p.hasPerk('clip') && !p.clipUsed && p.lastSafe; if (useClip) p.clipUsed = true;
    const cp = useClip ? { room: this.level.room.id, x: p.lastSafe.x, y: p.lastSafe.y } : this.checkpoint;
    const L = this.level; this.transition = { t: 0, fn: () => {
      p.dying = 0; p.inv = 90; p.form = 'imp'; p.h = 22; p.gp = false; p.spin = 0; p.stun = 0; p.formular = 0; p.carry = null; p.won = false; p.pipeT = 0; p.balls = []; p.airJumps = 0;
      const rid = cp ? cp.room : 'main'; const room = L.rooms[rid];
      if (cp && rid === L.room.id && rid !== 'boss') { p.x = cp.x; p.y = cp.y; room.respawnEnemies(p.x + VW); }
      else if (cp && rid !== 'boss') { this.enterRoom(rid, null); p.x = cp.x; p.y = cp.y; }
      else if (rid === 'boss' || L.room.id === 'boss') { /* restart boss room */ const fresh = new Room(L, 'boss', L.room.id === 'boss' ? L.room.def : L.rooms.boss.def); L.rooms.boss = fresh; for (const pp of fresh.pipes) pp.roomId = 'boss'; this.tagPipesRelink(L); this.bossActive = false; this.enterRoom('boss', null); if (this.checkpoint && this.checkpoint.room === 'boss') { this.checkpoint = null; } }
      else { const main = L.rooms.main; if (L.room !== main) this.enterRoom('main', null); else { p.x = main.spawnPt.x; p.y = main.spawnPt.y; main.respawnEnemies(0); } }
      if (L.room.autoScroll) { L.room.camY = clamp(p.y + p.h - VH + 40, 0, L.room.camMaxY); }
      L.room.camX = clamp(p.cx - VW / 2, L.room.camMinX, L.room.camMaxX); if (!L.room.autoScroll) L.room.camY = clamp(p.cy - VH * 0.55, 0, L.room.camMaxY);
      // remove stray speeches/projectiles
      L.room.ents = L.room.ents.filter(e => !(e.type === 'proj' || e instanceof Speech || e.type === 'fx'));
      this.time = Math.max(this.time, 60 * 60); AudioSys.play(L.room.music); this.updateOfflineState(); Save.slot.brb = this.brb; Save.store(); if (useClip) this.banner('Clip it! Weiter an der Clip-Stelle.', '#9146ff'); else if (this.brb <= 1) Chat.sys('Letztes BRB!');
    } };
  },
  tagPipesRelink(L) { L.tagPipes(L.rooms.boss); const bossIn = L.rooms.boss.byTag.in && L.rooms.boss.byTag.in[0]; for (const rid in L.rooms) for (const p of L.rooms[rid].pipes) if (p.to && p.to.room === 'boss') p.to.pipe = bossIn; if (L.rooms.boss.byTag.ret) { const tb = L.rooms.main.byTag.toBoss && L.rooms.main.byTag.toBoss[0]; L.rooms.boss.byTag.ret[0].to = { room: 'main', pipe: tb }; } },
  // ---------- completion ----------
  bossDefeated(boss) { const L = this.level; const room = L.room; const e = room.def.endAfterBoss; if (e) { const end = new LevelEnd(e.x * TILE, (e.y) * TILE, L.sponsor); end.alwaysActive = true; room.add(end, true); popup(end.cx, end.y - 20, 'Verteilerkasten!', '#ffd700'); } AudioSys.play(L.no === 10 ? 'ending' : L.music); this.banner(L.no === 10 ? 'DIE WARTESCHLEIFE IST TOT' : 'BOSS BESIEGT!', '#ffd700'); this.addBits(50); this.saveProgress(); },
  levelComplete(endEnt) {
    const L = this.level; const p = L.player; p.win('kasten'); this.cut = true; AudioSys.stop(); AudioSys.sfx('clear'); Chat.react('levelclear', true);
    const ms = this.elapsedMs; const s = Save.slot; const no = L.no;
    if (!s.levelsDone.includes(no)) s.levelsDone.push(no); if (no + 1 > s.unlocked && no < 10) s.unlocked = no + 1; if (no === 10) s.unlocked = 10;
    if (!s.sponsors.includes(L.sponsor.name)) s.sponsors.push(L.sponsor.name);
    s.subs[no] = Array.from(new Set((s.subs[no] || []).concat(this.levelSubs))).sort(); const best = !s.bestTimes[no] || ms < s.bestTimes[no]; if (best) s.bestTimes[no] = ms; s.peakViewers[no] = Math.max(s.peakViewers[no] || 0, this.peak);
    const timeBonus = Math.floor(this.time / 60 / 10); this.addBits(timeBonus, true); s.bits = this.bits; s.brb = this.brb; Save.store();
    ResultsCard.data = { no, viewers: this.peak, bits: this.levelBits, subs: s.subs[no].length, holfs: (s.holfs[no] || []).length ? s.holfs[no].join(', ') : '', ms, best, brb: this.brb, deaths: this.levelDeaths, sponsor: L.sponsor };
    setTimeout(() => { }, 0); this.transition = { t: 0, hold: 60, fn: () => { const outro = L.scenes && L.scenes.outro; const showResults = () => { this.state = 'results'; UI.open(ResultsCard, true); }; if (outro) { this.state = 'scene'; ScenePlayer.play(outro, showResults); } else if (no === 10) { this.state = 'scene'; ScenePlayer.play('ending', () => { s.finished = true; Save.store(); showResults(); }); } else showResults(); } };
  },
  afterResults() { const no = this.level.no; this.saveProgress(); if (no === 10 && Save.slot.finished) { UI.open(CreditsScreen); this.state = 'hub'; setTimeout(() => { }, 0); this.enterHub(); UI.open(CreditsScreen, true); } else this.enterHub(); },
  afterGameOver() { this.enterHub(); },
  saveProgress() { const s = Save.slot; if (!s) return; s.bits = this.bits; s.brb = Math.max(this.brb, 1); Save.store(); },
  // ---------- time ----------
  tickTime() { const p = this.level.player; if (this.cut || p.won || p.dying) return; const slow = p.hasPerk('unpuenktlich') ? 0.7 : 1; this.time -= slow; if (this.time <= 60 * 60 && !this.timeWarned) { this.timeWarned = true; this.banner('Noch 1 Minute bis Stream-Start!', '#e03a3a'); AudioSys.sfx('clock'); } if (this.time <= 0) { this.time = 0; if (!p.dying) { this.banner('STREAM STARTET OHNE DICH!', '#e03a3a'); Chat.react('timeout', true); p.die(); } } },
  // ---------- main update ----------
  update() {
    this.frame++; Input.pollGamepad();
    if (Input.was('mute')) { const m = AudioSys.toggleMute(); this.banner(m ? 'Ton aus' : 'Ton an', '#8a8a96'); }
    Chat.update(); Banner.update(); HypeTrain.update();
    if (this.transition) { const tr = this.transition; tr.t++; const hold = tr.hold || 0; if (tr.t === 20 + hold && tr.fn) { tr.fn(); tr.fn = null; } if (tr.t > 40 + hold) { this.transition = null; if (this.state === 'play' || this.state === 'scene' || this.state === 'hub') this.cut = false; } return; }
    if (MarxOracle.open) { MarxOracle.update(); return; }
    if (UI.top) { UI.update(); return; }
    if (this.state === 'play' || this.state === 'hub') {
      if (UI.top) { return; }
      const L = this.level; if (!L || !L.room) return;
      if (Input.was('pause') && !this.cut) { UI.open(PauseMenu, true); return; }
      if (Input.was('marx') && !this.cut && !L.player.dying) { this.askMarx(null, false); return; }
      if (this.state === 'play' && this.tryShop()) return;
      Poll.update();
      if (this.slowmo > 0) { this.slowmo--; if (this.slowmo === 0) AudioSys.setSpeed(1); }
      L.room.update();
      if (this.state === 'play') { this.tickTime(); this.elapsedMs = performance.now() - this.levelStart; if (this.ticket) { this.ticket.ttl--; if (this.ticket.ttl <= 0) { this.ticket = null; this.banner('Ticket abgelaufen. Bitte neu ziehen.', '#e03a3a'); } } if (this.frame % 30 === 0) { Save.slot.stats.playtime += 0.5; } if (this.frame % 60 === 0 && this.viewerCount > 30) this.viewers(-1); }
      if (this.shake > 0) this.shake = Math.max(0, this.shake - 0.5);
      if (this.frame % 20 === 0) this.updateOfflineState();
    }
  },
  // ---------- render ----------
  draw(g) {
    g.fillStyle = '#0e0e10'; g.fillRect(0, 0, TW, VH);
    g.save(); g.beginPath(); g.rect(0, 0, VW, VH); g.clip();
    if (this.shake > 0 && Save.opt.shake) g.translate(Math.round(rnd(-this.shake, this.shake)), Math.round(rnd(-this.shake, this.shake)));
    const L = this.level;
    if (L && L.room && (this.state === 'play' || this.state === 'hub' || this.state === 'scene' || this.state === 'results' || this.state === 'gameover')) {
      L.room.draw(g);
      if (L.dark && L.room.id === 'main') this.drawDark(g, L);
      if (this.state === 'hub') { HUD.drawHub(g); } else if (this.state === 'play' || this.state === 'results') HUD.draw(g);
      if (this.slowmo > 0) { g.fillStyle = 'rgba(80,120,255,0.12)'; g.fillRect(0, 0, VW, VH); }
      if (L.player && L.player.mate > 0) { g.fillStyle = 'rgba(123,210,58,0.08)'; g.fillRect(0, 0, VW, VH); }
    }
    UI.draw(g);
    if (MarxOracle.open) MarxOracle.draw(g);
    if (this.transition) { const tr = this.transition; const hold = tr.hold || 0; const a = tr.t < 20 + hold ? clamp((tr.t - hold) / 20, 0, 1) : clamp(1 - (tr.t - 20 - hold) / 20, 0, 1); g.fillStyle = 'rgba(14,14,16,' + a + ')'; g.fillRect(0, 0, VW, VH); if (a > 0.9) { Font.draw(g, 'SZENENWECHSEL', VW / 2, VH / 2 - 4, '#9146ff', { align: 'center' }); } }
    g.restore();
    Chat.draw(g, VW);
  },
  drawDark(g, L) {
    const p = L.player, r = L.room; const cx = p.cx - Math.round(r.camX), cy = p.cy - Math.round(r.camY); const rad = 58 + Math.sin(this.frame * 0.1) * 3 + (p.holf === 'gold' ? 60 : 0);
    const grd = g.createRadialGradient(cx, cy, rad * 0.5, cx, cy, rad); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,10,0.92)'); g.fillStyle = grd; g.fillRect(0, 0, VW, VH);
    // laternen holes
    for (const e of r.ents) if (e.type === 'laterne' && !e.dead) { const lx = e.cx - Math.round(r.camX), ly = e.y - Math.round(r.camY); const gg = g.createRadialGradient(lx, ly, 0, lx, ly, 40); gg.addColorStop(0, 'rgba(255,220,120,0.35)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(lx - 40, ly - 40, 80, 80); }
  }
};
HUD.drawHub = function (g) { const s = Save.slot; g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(2, 2, VW - 4, 12); Font.draw(g, 'imps STREAMING-ZIMMER', 6, 4, '#bf94ff'); Font.draw(g, 'Bits ' + s.bits + ' · BRB x' + s.brb, VW - 6, 4, '#c9a4ff', { align: 'right' });
  // Kanal-Gesundheit
  const n = s.sponsors.length; g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(2, 16, 150, 11); Font.draw(g, 'KANAL', 6, 18, '#8a8a96'); g.fillStyle = '#26262e'; g.fillRect(44, 18, 100, 7); g.fillStyle = n >= 10 ? '#ffd700' : n >= 5 ? '#7bd23a' : '#e03a3a'; g.fillRect(44, 18, n * 10, 7); Font.draw(g, n + '/10', 148, 18, '#fff', { align: 'right' });
  if (Game.frame % 200 < 100 && !UI.top) Font.draw(g, '↑ an einer Station · H Marx · ESC Optionen', VW / 2, VH - 10, '#8a8a96', { align: 'center', shadow: true }); };
PauseMenu.openHub = function () { };
/* ---------- hub pause (options only) ---------- */
const HubPause = { menu: null, open() { this.menu = new Menu([{ label: 'Weiter', action: () => UI.close() }, { label: 'Optionen', action: () => UI.open(OptionsScreen) }, { label: 'Steuerung', action: () => UI.open(ControlsScreen) }, { label: 'Zum Titel (speichert)', action: () => { Game.saveProgress(); UI.closeAll(); Game.level = null; Game.state = 'title'; UI.open(TitleScreen, true); } }], { onBack: () => UI.close() }); }, update() { this.menu.update(); if (Input.was('pause') && this.menu.t > 4) UI.close(); }, draw(g) { dim(g, 0.6); box(g, VW / 2 - 70, 60, 140, 80, '#1a1a22', '#9146ff'); Font.draw(g, 'PAUSE', VW / 2, 66, '#bf94ff', { align: 'center' }); this.menu.draw(g, VW / 2 - 50, 80, 100, 12); } };
const _origUpdate = Game.update.bind(Game);
Game.update = function () { if (this.state === 'hub' && !UI.top && !this.transition && !MarxOracle.open && Input.was('pause')) { UI.open(HubPause, true); Input.endFrame(); return; } _origUpdate(); };
/* ======================= BOOTSTRAP / LOOP ======================= */
(function boot() {
  const canvas = document.getElementById('game'); canvas.width = TW; canvas.height = VH; const g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
  const fit = () => { const sx = Math.floor(window.innerWidth / TW), sy = Math.floor((window.innerHeight - 22) / VH); let s = Math.max(1, Math.min(sx, sy)); if (Save.opt && Save.opt.scale) s = Save.opt.scale; canvas.style.width = TW * s + 'px'; canvas.style.height = VH * s + 'px'; };
  window.addEventListener('resize', fit);
  Game.init(); fit();
  let last = performance.now(), acc = 0; const STEP = 1000 / 60;
  function loop(now) {
    let dt = now - last; last = now; if (dt > 100) dt = 100; acc += dt;
    let steps = 0; while (acc >= STEP && steps < 4) { try { Game.update(); } catch (e) { console.error(e); Game.lastError = e; } Input.endFrame(); acc -= STEP; steps++; }
    try { Game.draw(g); } catch (e) { console.error(e); Game.lastError = e; }
    if (Game.lastError) { g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, VH - 20, TW, 20); Font.draw(g, 'Fehler: ' + String(Game.lastError.message).slice(0, 60), 4, VH - 14, '#e03a3a'); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.Game = Game; window.UI = UI; window.UI_NAMES = { TitleScreen, SlotScreen, OptionsScreen, ControlsScreen, CreditsScreen, ScenePlayer, IntroCard, ResultsCard, GameOverScreen, PauseMenu, SpaetiShop, WorldMap, PerkShop, FridgeMenu, VodScreen, HubPause };
})();
