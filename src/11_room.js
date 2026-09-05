/* =====================================================================
   11 room: Tilemap-Raum, Parsing der ASCII-Karten, Kamera, Blöcke, Röhren
   ===================================================================== */
const ENT_GLYPHS = 'PbG12345*+"`LEMSkratTvUAFsHiwRxgeZnDlCqmjNKJ<>h§_/:9876I0oYy';
const ROSTERS = {
  w1: { k: 'kartoni', r: 'grill', a: 'sepp', t: 'troll' }, w2: { k: 'kartoni', r: 'troll', a: 'torben', t: 'troll' }, w3: { k: 'sach', r: 'formular', a: 'sach', t: 'formular' },
  w4: { k: 'kartoni', r: 'grill', a: 'sepp', t: 'haider' }, w5: { k: 'ratte', r: 'troll', a: 'sepp', t: 'troll' }, w6: { k: 'kartoni', r: 'grill', a: 'sepp', t: 'biene' },
  w7: { k: 'wiener', r: 'wiener', a: 'sepp', t: 'sisi' }, w8: { k: 'cookie', r: 'troll', a: 'gnom', t: 'troll' }, w9: { k: 'hotline', r: 'kevin', a: 'torben', t: 'router' },
  w10: { k: 'hotline', r: 'troll', a: 'torben', t: 'router' }, hub: { k: 'kartoni', r: 'grill', a: 'sepp', t: 'troll' }
};
function makeEnemy(kind, x, y) {
  switch (kind) {
    case 'kartoni': return new Kartoni(x, y); case 'grill': return new Grillmeister(x, y, false); case 'sepp': return new Grillmeister(x, y, true);
    case 'troll': return new ChatTroll(x, y); case 'torben': return new Techniker(x, y, 'torben'); case 'kevin': return new Techniker(x, y, 'kevin');
    case 'router': return new RouterTurm(x, y); case 'sach': return new Sachbearbeiter(x, y); case 'formular': return new Formular(x, y);
    case 'haider': return new Haider(x, y); case 'wiener': return new Wiener(x, y); case 'sisi': return new Sisi(x, y); case 'holdghost': return new HoldGhost(x, y);
    case 'biene': return new Biene(x, y); case 'hive': return new Bienenstock(x, y); case 'gnom': return new Gnom(x, y); case 'dieb': return new AboDieb(x, y);
    case 'hotline': return new HotlineBot(x, y); case 'cookie': return new Cookie(x, y); case 'ratte': return new Ratte(x, y); case 'barth': return new MarioBarth(x, y);
    case 'jet': return new MerzJet(x, y); case 'wolke': return new WurstWolke(x, y); case 'ordner': return new Aktenordner(x, y);
  }
  return new Kartoni(x, y);
}
class Room {
  constructor(level, id, def) {
    this.level = level; this.id = id; this.def = def; this.theme = def.theme || level.theme; this.music = def.music || level.music;
    this.ents = []; this.solids = []; this.pipes = []; this.pending = []; this.specials = {}; this.doors = {}; this.blockState = {}; this.onlineZones = {}; this.spawnPt = null; this.holes = {};
    this.camX = 0; this.camY = 0; this.camMinX = 0; this.autoScroll = def.autoScroll || null; this.fallDeath = def.fallDeath !== false; this.entered = false; this.marxIdx = 0; this.linkIdx = 0; this.subIdx = 0; this.checkIdx = 0;
    this.parse(def.map); this.offline = def.offline || []; this.offlineActive = {}; for (const z of this.offline) this.offlineActive[z.id] = true; this.bossLayouts = def.bossLayouts || null;
    this.camMaxX = Math.max(0, this.w * TILE - VW); this.camMaxY = Math.max(0, this.h * TILE - VH); this.timeUsed = 0;
  }
  parse(mapRows) {
    const rows = mapRows.map(r => r.split('')); this.h = rows.length; this.w = Math.max(...rows.map(r => r.length));
    for (const r of rows) while (r.length < this.w) r.push('.');
    this.tiles = rows; this.spawns = [];
    // pipes first (need tile info)
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const ch = rows[y][x];
      if ((ch === 'p' || ch === 'u' || ch === 'o') && (x === 0 || (rows[y][x - 1] !== ch))) { // up pipe top-left
        let hgt = 1; while (y + hgt < this.h && rows[y + hgt][x] === '|') hgt++;
        this.pipes.push({ x: x * TILE, y: y * TILE, h: hgt * TILE, dir: 'up', color: ch === 'u' ? 'blue' : ch === 'o' ? 'orange' : 'green', linked: ch !== 'p', tx: x, ty: y, th: hgt });
        rows[y][x] = 'X'; rows[y][x + 1] = 'X'; for (let k = 1; k < hgt; k++) { rows[y + k][x] = 'X'; rows[y + k][x + 1] = 'X'; }
        for (let k = 0; k < hgt; k++) { this.holes[(x) + ',' + (y + k)] = 'pipe'; this.holes[(x + 1) + ',' + (y + k)] = 'pipe'; }
      }
      if (ch === 'd' && (x === 0 || rows[y][x - 1] !== 'd')) { // down pipe (hanging): top row contains '|' above, opening at this row
        let hgt = 1; while (y - hgt >= 0 && rows[y - hgt][x] === '|') hgt++;
        this.pipes.push({ x: x * TILE, y: (y - hgt + 1) * TILE, h: hgt * TILE, dir: 'down', color: 'blue', linked: true, tx: x, ty: y - hgt + 1, th: hgt });
        for (let k = 0; k < hgt; k++) { rows[y - k][x] = 'X'; rows[y - k][x + 1] = 'X'; this.holes[x + ',' + (y - k)] = 'pipe'; this.holes[(x + 1) + ',' + (y - k)] = 'pipe'; }
      }
    }
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const ch = rows[y][x]; if (ch === '|') rows[y][x] = 'X'; if (ENT_GLYPHS.includes(ch) && ch !== 'I' && ch !== 'Y' && ch !== 'o') { if (ch === 'P') this.spawnPt = { x: x * TILE + 3, y: (y + 1) * TILE - 22 }; this.spawns.push({ ch, x, y }); rows[y][x] = '.'; } }
    this.pipes.sort((a, b) => a.x - b.x || a.y - b.y);
  }
  spawnOne(s, solettiCols) {
    const L = this.level, roster = ROSTERS[L.theme] || ROSTERS.w1;
    {
      const px = s.x * TILE, py = s.y * TILE, bottom = py + TILE; let e = null;
      switch (s.ch) {
        case 'P': this.spawnPt = { x: px + 3, y: bottom - 22 }; break;
        case 'b': e = new Bit(px + 5, py + 4, 1); break; case '5': e = new Bit(px + 3, py + 3, 100); break; case 'G': e = new Gift(px + 2, py + 2); break;
        case '1': case '2': case '3': { const tier = +s.ch; if (!(Save.slot.subs[L.no] || []).includes(tier) && !(Game.levelSubs || []).includes(tier)) e = new Sub(px + 2, py + 3, tier); break; }
        case '4': e = new Coin(px + 4, py + 8); break;
        case '*': e = new Holf(px + 3, py + 2, L.holfKind || 'gold'); break; case 'y': e = new Kabelsalat(px + 2, py + 4, true); break; case '+': e = new Holf(px + 3, py + 2, 'silver'); break; case '"': e = new Holf(px + 3, py + 2, 'bronze'); break; case '`': e = new Holf(px + 3, py + 2, 'green'); break;
        case 'L': e = new Checkpoint(px + 2, bottom, this.checkIdx++); break; case 'E': e = new LevelEnd(px, bottom, L.sponsor); break;
        case 'M': e = new MarxBust(px, bottom, this.marxIdx++); break; case 'S': e = new SinanNPC(px + 1, bottom); break;
        case 'k': e = makeEnemy(roster.k, px + 1, bottom - 20); break; case 'r': e = makeEnemy(roster.r, px + 2, bottom - 20); break; case 'a': e = makeEnemy(roster.a, px + 2, bottom - 20); break; case 't': e = makeEnemy(roster.t, px + 2, bottom - 16); break;
        case 'T': e = new Techniker(px + 2, bottom - 20, 'torben'); break; case 'v': e = new Techniker(px + 2, bottom - 20, 'kevin'); break; case 'U': e = new RouterTurm(px, bottom - 16); break;
        case 'A': e = new Aktenordner(px, py); break; case 'F': e = new Formular(px + 2, py + 2); break; case 's': e = new Sachbearbeiter(px + 2, bottom - 20); break;
        case 'H': e = new Haider(px + 3, bottom - 12); break; case 'i': e = new Wiener(px + 2, bottom - 16); break; case 'w': e = new WurstWolke(px, py); break; case 'R': e = new Grillmeister(px + 2, bottom - 20, true); break;
        case 'x': e = new Sisi(px + 2, py); break; case 'g': e = new HoldGhost(px + 1, py); break; case 'e': e = new Biene(px + 4, py + 4); break; case 'Z': e = new Bienenstock(px, py); break;
        case 'n': e = new Gnom(px + 2, bottom - 16); break; case 'D': e = new AboDieb(px + 2, bottom - 20); break; case 'l': e = new HotlineBot(px + 1, bottom - 14); break; case 'C': e = new Cookie(px + 2, bottom - 12); break;
        case 'q': e = new Ratte(px + 1, bottom - 6); break; case 'm': e = new MarioBarth(px + 2, bottom - 20); break; case 'j': e = new MerzJet(px, py); e.alwaysActive = true; break; case 'N': e = new Zollschranke(px, bottom - 32); break;
        case 'K': e = new FiakerSpawner(px, bottom - 16); break; case 'J': e = new HeuSpawner(px, bottom - 16, -1, 220); break; case '<': e = new GrillKessel(px, bottom, -1); break; case '>': e = new GrillKessel(px, bottom, 1); break;
        case 'h': { const z = (this.offline || this.def.offline || []).find(z => s.x >= z.x0 && s.x <= z.x1); e = new Hotspot(px, bottom, z ? z.id : null, z ? z.range : 150); break; }
        case '§': { const td = (this.def.ents || []).filter(d => d.t === 'tdoor' && d.x > s.x).sort((a, b) => a.x - b.x)[0]; e = new Ticket(px + 2, py + 4, td ? td.id : 't0', 900); break; }
        case '_': e = new MovingPlatform(px, py + 4, 48, 40, 0, 240); break; case '/': e = new MovingPlatform(px, py + 4, 32, 0, 40, 220); break;
        case '9': e = new MovingPlatform(px, py + 4, 32, 40, 0, 200, { lag: true }); break; case '8': e = new MovingPlatform(px, py + 4, 32, 0, 0, 1, { clickbait: true }); break;
        case '7': e = new BufferRing(px + 8, py + 8, 4, 0.03); break; case '6': e = new GondelRad(px + 8, py + 8); break;
        case ':': solettiCols[s.y] = solettiCols[s.y] || []; solettiCols[s.y].push(s.x); break;
        case '0': e = new PowerItem(px + 2, py + 2, 'brb'); break;
      }
      return e;
    }
  }
  respawnEnemies(minX) { const kinds = 'kratTvUAFsHiwRxgeZnDlCqm'; for (const s of this.spawns) { if (!kinds.includes(s.ch)) continue; const px = s.x * TILE; if (px < minX) continue; if (this.ents.some(e => e.isEnemy && !e.dead && Math.abs(e.x - px) < 24 && Math.abs(e.y - s.y * TILE) < 40)) continue; const e = this.spawnOne(s, {}); if (e) { e.active = false; this.add(e, true); } } }
  spawnAll() {
    const solettiCols = {};
    for (const s of this.spawns) { const e = this.spawnOne(s, solettiCols); if (e) this.add(e, true); }
    for (const y in solettiCols) { const xs = solettiCols[y].sort((a, b) => a - b); let start = xs[0], prev = xs[0]; for (let i = 1; i <= xs.length; i++) { if (xs[i] === prev + 1) { prev = xs[i]; continue; } this.add(new Soletti(start * TILE, y * TILE + 6, (prev - start + 1) * TILE), true); start = xs[i]; prev = xs[i]; } }
    // explicit entities
    for (const d of (this.def.ents || [])) this.addDef(d);
    if (this.def.boss) this.addBoss(this.def.boss);
    this.flush();
  }
  addDef(d) {
    const px = d.x * TILE, py = d.y * TILE; let e = null;
    switch (d.t) {
      case 'door': e = new Door(px, py, d.id, d.h); e.hint = d.hint; this.doors[d.id] = e; break;
      case 'tdoor': e = new TicketDoor(px, py, d.id, d.h); this.doors[d.id] = e; break;
      case 'captcha': e = new Captcha(px, py, d.door, d.cells); for (let i = 0; i < 9; i++) { const c = e.cellRect(i); this.specials[Math.floor(c.x / TILE) + ',' + Math.floor(c.y / TILE)] = { cb: (tx, ty) => e.onHit(tx, ty) }; } break;
      case 'warte': { const sys = new WartenummerSystem(d.nums, d.door); d.cells.forEach((c, i) => { this.specials[c[0] + ',' + c[1]] = { cb: () => sys.hit(d.nums[i], this), label: String(d.nums[i]), sys }; }); break; }
      case 'tisch': e = new Tisch(px, py + TILE); this.tisch = e; break;
      case 'buchse': e = new Buchse(px, py + TILE); break;
      case 'plat': e = new MovingPlatform(px, py, d.w || 48, d.dx || 0, d.dy || 0, d.period || 240, d); break;
      case 'poll': e = new PollTrigger(px, py, d); break;
      case 'sign': e = new Sign(px, py, d.text); break;
      case 'npc': e = new NPC(px, py + TILE, d.who, d.lines); break;
      case 'item': e = new PowerItem(px + 2, py, d.kind); break;
      case 'enemy': e = makeEnemy(d.kind, px, py); break;
      case 'kabel': e = new Kabelsalat(px + 2, py, true); break;
      case 'trigger': e = new Trigger(px, py, d); break;
      case 'stecker': e = new Stecker(px, py); e.startX = px; e.startY = py; break;
      case 'cookiebanner': e = new CookieBanner(px, py); break;
      case 'station': e = new HubStation(px, py + TILE, d); break;
    }
    if (e) this.add(e, true); return e;
  }
  addBoss(b) {
    const px = b.x * TILE, py = b.y * TILE; let e;
    switch (b.t) {
      case 'techniker': e = new BossTechniker(px, py, 'torben'); this.add(e, true); const k = new BossTechniker(px + 60, py, 'kevin'); k.introT = 90; this.add(k, true); return;
      case 'drachenlord': e = new Drachenlord(px, py); break; case 'kabelkoenig': e = new KabelKoenig(px, py); break; case 'baba': e = new Baba(px, py); break;
      case 'ober': e = new Ober(px, py, this.tisch); break; case 'algo': e = new Algorithmus(px, py); break; case 'volker': e = new Volker(px, py); break; case 'nixi': e = new Nixi(px, py); break;
    }
    if (e) { e.alwaysActive = true; this.add(e, true); this.boss = e; }
  }
  add(e, immediate) { if (immediate) { this.ents.push(e); if (e.solid) this.solids.push(e); } else this.pending.push(e); return e; }
  flush() { for (const e of this.pending) { this.ents.push(e); if (e.solid) this.solids.push(e); } this.pending = []; }
  // ---- tiles ----
  tileAt(tx, ty) { if (!(tx >= 0) || tx >= this.w) return '%'; if (!(ty >= 0)) return (tx === 0 || tx === this.w - 1) && this.tiles[0][tx] === '%' ? '%' : '.'; if (ty >= this.h) return '.'; return this.tiles[ty][tx]; }
  tileAtPx(px, py) { return this.tileAt(Math.floor(px / TILE), Math.floor(py / TILE)); }
  setTile(tx, ty, ch) { if (ty >= 0 && ty < this.h && tx >= 0 && tx < this.w) this.tiles[ty][tx] = ch; }
  solidAt(tx, ty, ent) {
    const ch = this.tileAt(tx, ty);
    if (ch === '-') return 2; if (ch === ':') return 2;
    if (ch === 'O') return this.isOnline(tx, ty) ? 1 : 0;
    if (ch === 'I') return this.blockState[tx + ',' + ty] === 'shown' ? 1 : 0;
    if (ch === '=' && ent && ent.type === 'player' && false) return 1;
    return SOLID_TILES.has(ch) ? 1 : 0;
  }
  solidAtPx(px, py) { return this.solidAt(Math.floor(px / TILE), Math.floor(py / TILE)) === 1; }
  solidRect(x, y, w, h) { const x0 = Math.floor(x / TILE), x1 = Math.floor((x + w - 1) / TILE), y0 = Math.floor(y / TILE), y1 = Math.floor((y + h - 1) / TILE); for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.solidAt(tx, ty) === 1) return true; return false; }
  isOnline(tx, ty) { const z = this.offline.find(z => tx >= z.x0 && tx <= z.x1); if (!z) return true; if (this.offlineActive[z.id]) return false; const hs = this.onlineZones[z.id]; if (!hs) return true; const d = Math.hypot(tx * TILE + 8 - hs.cx, ty * TILE + 8 - hs.cy); if (d > hs.range) return false; if (d > hs.range * 0.7) return (Math.floor(Game.frame / 20) + tx) % 3 !== 0; return true; }
  signalAt(px) { const tx = Math.floor(px / TILE); const z = this.offline.find(z => tx >= z.x0 && tx <= z.x1); if (!z) return -1; if (this.offlineActive[z.id]) return 0; const hs = this.onlineZones[z.id]; const d = Math.abs(px - hs.cx); return d > hs.range ? 0 : d > hs.range * 0.7 ? 1 : d > hs.range * 0.4 ? 2 : 3; }
  setOnline(zoneId, hs) { this.offlineActive[zoneId] = false; this.onlineZones[zoneId] = hs; Game.updateOfflineState(); }
  playerOffline(px) { const tx = Math.floor(px / TILE); const z = this.offline.find(z => tx >= z.x0 && tx <= z.x1); return z ? this.offlineActive[z.id] : false; }
  // ---- block bumping ----
  bumpBlock(tx, ty, player, side) {
    const ch = this.tileAt(tx, ty); const key = tx + ',' + ty;
    const bump = () => { this.bumpAnim = { tx, ty, t: 10 }; AudioSys.sfx('bump'); for (const e of this.ents) if ((e.isEnemy || e.type === 'bit' || e.type === 'item') && !e.dead && Math.abs(e.bottom - ty * TILE) < 3 && e.right > tx * TILE && e.x < tx * TILE + TILE) { if (e.isEnemy) { if (e.bumpedFromBelow) e.bumpedFromBelow(); else if (!e.noBall || e.boss) e.kill('thrown'); } else { e.vy = -3; e.fly = true; } } };
    if (ch === '?') { this.setTile(tx, ty, 'X'); bump(); const b = new Bit(tx * TILE + 5, ty * TILE - 10, 1); b.vy = -3.5; b.fly = true; this.add(b); Game.addBits(0); return; }
    if (ch === 'Y') { this.setTile(tx, ty, 'X'); bump(); const kind = player.form === 'imp' ? 'hafer' : (this.level.powerItem || 'hafer'); this.add(new PowerItem(tx * TILE + 2, ty * TILE - 2, kind, true)); AudioSys.sfx('power'); return; }
    if (ch === 'Q') { const st = this.blockState[key] || { n: 0, t: Game.frame }; st.n++; if (Game.frame - st.t > 300) st.n = 99; this.blockState[key] = st; bump(); const b = new Bit(tx * TILE + 5, ty * TILE - 10, 1); b.vy = -3.5; b.fly = true; this.add(b); if (st.n >= 10) this.setTile(tx, ty, 'X'); return; }
    if (ch === 'B') { if (player.big || player.holf === 'gold' || side) { this.setTile(tx, ty, '.'); AudioSys.sfx('break'); Game.viewers(2); for (let i = 0; i < 4; i++) spawnFx(tx * TILE + (i % 2) * 8, ty * TILE + Math.floor(i / 2) * 8, { vx: (i % 2 ? 1 : -1) * rnd(0.5, 1.5), vy: rnd(-4, -2), col: Tiles.theme.brick, size: 4, gravity: 0.25, life: 50 }); if (player.holf === 'gold' && side) player.vx = player.dir * 2; } else bump(); return; }
    if (ch === 'I') { if (this.blockState[key] !== 'shown') { this.blockState[key] = 'shown'; bump(); this.add(new PowerItem(tx * TILE + 2, ty * TILE - 2, 'brb', true)); AudioSys.sfx('power'); popup(tx * TILE + 8, ty * TILE - 12, 'Versteckt!', '#7bd23a'); } return; }
    if (ch === 'c') { const sp = this.specials[key]; if (sp) { sp.cb(tx, ty); this.bumpAnim = { tx, ty, t: 10 }; } return; }
    if (ch === 'X' || ch === '#' || ch === '%' || ch === '=') { if (side) return; AudioSys.sfx('bump'); }
  }
  groundPound(player) { const ty = Math.floor((player.bottom + 2) / TILE); for (let tx = Math.floor((player.x + 1) / TILE); tx <= Math.floor((player.right - 1) / TILE); tx++) { if (this.tileAt(tx, ty) === 'B') { this.setTile(tx, ty, '.'); AudioSys.sfx('break'); burst(tx * TILE + 8, ty * TILE + 8, Tiles.theme.brick, 6, 2); } const sp = this.specials[tx + ',' + ty]; if (sp && sp.pound) sp.cb(tx, ty); } for (const e of this.ents) if (e.isEnemy && !e.dead && !e.boss && Math.abs(e.cx - player.cx) < 40 && Math.abs(e.bottom - player.bottom) < 8 && e.stompable) e.kill('pound'); }
  drillTile(tx, ty, permanent) { const ch = this.tileAt(tx, ty); if (ch === '#' || ch === 'X' || ch === 'B' || ch === '=') { if (this.tileAt(tx, ty + 1) === '.' && ty + 1 < this.h - 1 && !permanent) return; this.setTile(tx, ty, '.'); burst(tx * TILE + 8, ty * TILE + 8, [Tiles.theme.ground, '#aaa'], 8, 2); AudioSys.sfx('break'); shake(2); this.holes[tx + ',' + ty] = 'drilled'; } }
  openDoor(id) { const d = this.doors[id]; if (d) { d.open = true; AudioSys.sfx('clear'); } }
  onEnemyKilled(e, how) { Game.hypeAdd(2); if (this.def.onKill) this.def.onKill(e, how); }
  setBossLayout(i) { if (!this.bossLayouts) return; const lay = this.bossLayouts[i]; for (let y = 0; y < lay.length; y++) for (let x = 0; x < lay[y].length; x++) { const ch = lay[y][x]; if (ch === ' ') continue; this.setTile(x + (this.def.layoutX || 0), y + (this.def.layoutY || 0), ch === '.' ? '.' : ch); } const p = this.level.player; if (this.solidRect(p.x, p.y, p.w, p.h)) { p.y -= 16; if (this.solidRect(p.x, p.y, p.w, p.h)) p.y -= 16; } }
  spawnBuchse() { if (this.def.buchse) this.add(new Buchse(this.def.buchse.x * TILE, this.def.buchse.y * TILE + TILE)); }
  // ---- update ----
  update() {
    const p = this.level.player; const camL = this.camX - 96, camR = this.camX + VW + 96;
    for (const e of this.ents) {
      if (e.dead) continue;
      if (!e.active) { if (e.alwaysActive || (e.x + e.w > camL && e.x < camR && e.y > this.camY - 200 && e.y < this.camY + VH + 200)) e.active = true; else continue; }
      else if (!e.alwaysActive && e.type !== 'fx' && (e.right < camL - 200 || e.x > camR + 200)) { e.active = false; continue; }
      if (Game.slowmo && (e.isEnemy || e.type === 'proj' || e.boss) && Game.frame % 5 >= 2) continue;
      e.update();
    }
    this.flush();
    if (this.ents.length > 60 || Game.frame % 30 === 0) { this.ents = this.ents.filter(e => !e.dead); this.solids = this.solids.filter(e => !e.dead); }
    if (this.bumpAnim) { this.bumpAnim.t--; if (this.bumpAnim.t <= 0) this.bumpAnim = null; }
    this.updateCamera();
  }
  updateCamera() {
    const p = this.level.player;
    if (this.autoScroll) { this.camY += this.autoScroll.vy; if (this.camY < 0) this.camY = 0; if (p.bottom > this.camY + VH + 8 && !p.dying) p.die(); if (p.y < this.camY - 40) this.camY = Math.max(0, p.y - 40); }
    const lookahead = p.dir * 24; let tx = p.cx - VW / 2 + lookahead;
    if (this.def.lockCam) tx = this.def.lockCam.x * TILE;
    this.camX = lerp(this.camX, clamp(tx, this.camMinX, this.camMaxX), 0.12);
    if (!this.autoScroll) { let ty = p.cy - VH * 0.55; if (this.h * TILE > VH) this.camY = lerp(this.camY, clamp(ty, 0, this.camMaxY), p.onGround ? 0.12 : 0.06); else this.camY = 0; }
    if (Math.abs(this.camX - tx) < 0.5) this.camX = clamp(tx, this.camMinX, this.camMaxX);
  }
  // ---- draw ----
  draw(g) {
    const camX = Math.round(this.camX), camY = Math.round(this.camY);
    const p = this.level.player; const off = this.playerOffline(p.cx);
    Backgrounds.draw(g, this.theme, camX, camY, VW, VH, off);
    g.save(); g.translate(-camX, -camY);
    // tiles
    const x0 = Math.max(0, Math.floor(camX / TILE)), x1 = Math.min(this.w - 1, Math.floor((camX + VW) / TILE)), y0 = Math.max(0, Math.floor(camY / TILE)), y1 = Math.min(this.h - 1, Math.floor((camY + VH) / TILE));
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = this.tiles[ty][tx]; if (ch === '.') continue;
      let img;
      if (ch === '#') img = Tiles.img('#', this.tileAt(tx, ty - 1) === '#' || this.tileAt(tx, ty - 1) === '%' ? '' : 'top');
      else if (ch === 'O') { const on = this.isOnline(tx, ty); if (!on) { g.globalAlpha = 0.25; g.drawImage(Tiles.img('O'), tx * TILE, ty * TILE); g.globalAlpha = 1; continue; } img = Tiles.img('O'); }
      else if (ch === 'I') { if (this.blockState[tx + ',' + ty] !== 'shown') continue; img = Tiles.img('I', 'shown'); }
      else if (ch === 'c') { const sp = this.specials[tx + ',' + ty]; if (sp && sp.label) { g.fillStyle = '#c9ccd2'; g.fillRect(tx * TILE, ty * TILE, 16, 16); g.fillStyle = '#4c4c56'; g.fillRect(tx * TILE, ty * TILE, 16, 1); g.fillRect(tx * TILE, ty * TILE, 1, 16); Font.draw(g, sp.label, tx * TILE + 8, ty * TILE + 4, sp.sys && sp.sys.nums[sp.sys.next] === +sp.label && Game.frame % 30 < 15 ? '#e03a3a' : '#101014', { align: 'center' }); continue; } else continue; }
      else if (ch === 'p' || ch === 'u' || ch === 'o' || ch === 'd' || ch === '|') continue;
      else img = Tiles.img(ch, ch === '?' || ch === 'Q' || ch === 'Y' ? (Game.frame % 40 < 20 ? 'lit' : '') : '');
      if (ch === 'Y') img = Tiles.img('?', Game.frame % 40 < 20 ? 'lit' : '');
      let oy = 0; if (this.bumpAnim && this.bumpAnim.tx === tx && this.bumpAnim.ty === ty) oy = -Math.sin(this.bumpAnim.t / 10 * Math.PI) * 5;
      if (ch === '~' || ch === '!') { g.globalAlpha = ch === '~' ? 0.75 : 1; g.drawImage(img, tx * TILE, ty * TILE + (ch === '!' ? Math.sin(Game.frame * 0.1 + tx) * 1.5 : 0)); g.globalAlpha = 1; }
      else g.drawImage(img, tx * TILE, ty * TILE + oy);
    }
    // pipes
    for (const pp of this.pipes) { if (pp.x + 32 < camX || pp.x > camX + VW) continue; Tiles.drawPipe(g, pp.x, pp.y, pp.h, pp.color, pp.dir); }
    // entities by layer
    const vis = this.ents.filter(e => !e.dead && e.active && e.x + e.w >= camX - 64 && e.x <= camX + VW + 64 && e.y + e.h >= camY - 64 && e.y <= camY + VH + 64);
    const layers = [[], [], [], [], []]; for (const e of vis) layers[e.type === 'player' ? 2 : e.layer === undefined ? 1 : Math.min(4, e.layer)].push(e);
    // background-ish entities first
    const order = ['checkpoint', 'end', 'marx', 'door', 'plat', 'hotspot', 'tisch', 'buchse', 'zoll', 'sign', 'npc', 'kessel', 'numbtn'];
    layers[1].sort((a, b) => (order.indexOf(a.type) >= 0 ? 0 : 1) - (order.indexOf(b.type) >= 0 ? 0 : 1));
    for (let l = 0; l < 5; l++) for (const e of layers[l]) { if (l === 2 && e.pipeT > 0) { e.draw(g); const pp = e.pipe; if (pp) Tiles.drawPipe(g, pp.x, pp.y, pp.h, pp.color, pp.dir); } else e.draw(g); }
    for (const e of vis) if (e.draw2) e.draw2(g);
    if (this.boss && !this.boss.dead) this.boss.drawHp(g);
    g.restore();
    if (off) { g.fillStyle = 'rgba(80,80,90,0.35)'; g.fillRect(0, 0, VW, VH); }
  }
}
/* ---- misc room entities ---- */
class FiakerSpawner extends Entity { constructor(x, y) { super(x, y, 4, 4); this.type = 'spawner'; this.t = 100; } update() { this.t--; if (this.t <= 0 && this.distToPlayer() < 300) { this.t = irnd(220, 320); const dir = this.player.cx < this.cx ? -1 : 1; const f = new Fiaker(this.x, this.y, dir); this.room.add(f); AudioSys.sfx('whoosh'); popup(this.player.cx, this.player.y - 24, dir < 0 ? '← FIAKER!' : 'FIAKER! →', '#fff'); } } draw(g) { } }
class GondelRad extends Entity {
  constructor(x, y) { super(x, y, 4, 4); this.type = 'wheel'; this.r = 56; this.gondeln = []; }
  update() { if (!this.spawned) { this.spawned = true; for (let i = 0; i < 4; i++) { const m = new MovingPlatform(this.x, this.y, 24, 0, 0, 480, { wheel: true, cx: this.x, cy: this.y, r: this.r }); m.phase0 = i * Math.PI / 2; this.room.add(m); } } }
  draw(g) { g.strokeStyle = '#8a8a96'; g.lineWidth = 2; g.beginPath(); g.arc(this.x, this.y, this.r, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#4c4c56'; g.fillRect(this.x - 4, this.y - 4, 8, 8); g.fillRect(this.x - 3, this.y, 6, this.room.h * TILE - this.y); }
}
class Sign extends Entity { constructor(x, y, text) { super(x, y, 16, 16); this.text = text; this.type = 'sign'; } update() { this.anim++; } draw(g) { g.fillStyle = '#5c3a1a'; g.fillRect(this.x + 7, this.y + 8, 2, 8); g.fillStyle = '#c9803a'; g.fillRect(this.x - 4, this.y, 24, 9); g.fillStyle = '#f3e7c8'; g.fillRect(this.x - 3, this.y + 1, 22, 7); if (this.player && Math.abs(this.player.cx - this.cx) < 40) { const lines = Font.wrap(this.text, 26); const w = Math.max(...lines.map(l => Font.width(l))) + 6; const bx = clamp(this.cx - w / 2, this.room.camX + 2, this.room.camX + VW - w - 2), by = this.y - lines.length * 9 - 6; g.fillStyle = '#fff'; g.fillRect(bx, by, w, lines.length * 9 + 4); g.fillStyle = '#000'; g.fillRect(bx + 1, by + 1, w - 2, lines.length * 9 + 2); lines.forEach((l, i) => Font.draw(g, l, bx + 3, by + 3 + i * 9, '#fff')); } } }
class NPC extends Entity { constructor(x, y, who, lines) { super(x, y - 24, 14, 24); this.who = who; this.lines = lines; this.type = 'npc'; this.idx = 0; this.cd = 0; } update() { this.anim++; if (this.cd > 0) this.cd--; const p = this.player; if (p && rectHit({ x: this.x - 12, y: this.y, w: 38, h: 24 }, p) && Input.was('up') && this.cd <= 0) { this.cd = 30; Game.speech(this, this.lines[this.idx % this.lines.length], 150); this.idx++; } } draw(g) { const spr = { ludwig: 'ludwig_idle', sinan: 'sinan_idle', marx: 'marx_idle', baba: 'baba_small', imp: 'imp_idle' }[this.who] || 'ludwig_idle'; Sprites.draw(g, spr, this.x - 1, this.who === 'baba' ? this.y + 8 : this.y, this.player && this.player.cx < this.cx); if (this.player && Math.abs(this.player.cx - this.cx) < 30 && this.anim % 40 < 20) Font.draw(g, '↑ reden', this.cx, this.y - 10, '#fff', { align: 'center', shadow: true }); } }
class Trigger extends Entity { constructor(x, y, d) { super(x, y, (d.w || 1) * TILE, (d.h || 15) * TILE); this.d = d; this.type = 'trigger'; this.fired = false; this.alwaysActive = true; } update() { const p = this.player; if (!this.fired && p && rectHit(this, p)) { this.fired = true; if (this.d.scene) Game.playScene(this.d.scene); if (this.d.music) AudioSys.play(this.d.music); if (this.d.banner) Game.banner(this.d.banner, this.d.color || '#fff'); if (this.d.camLock) { this.room.camMinX = this.d.camLock.x0 * TILE; this.room.camMaxX = Math.max(this.room.camMinX, this.d.camLock.x1 * TILE - VW); } if (this.d.fn) this.d.fn(this); if (this.d.chat) Chat.say(this.d.chat); if (this.d.speech) Game.speech(p, this.d.speech, 120); } } draw(g) { } }
class PollTrigger extends Entity { constructor(x, y, d) { super(x, y, TILE * 3, 15 * TILE); this.d = d; this.type = 'poll'; this.fired = false; } update() { const p = this.player; if (!this.fired && p && rectHit(this, p) && !Game.cut) { this.fired = true; Game.startPoll(this.d, this); } } draw(g) { if (!this.fired && this.anim++ % 40 < 20) Font.draw(g, 'CHAT-POLL', this.x + 8, this.player ? this.player.y - 30 : this.y, '#9146ff', { align: 'center', shadow: true }); } }
