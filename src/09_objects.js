/* =====================================================================
   09 objects: Sammelobjekte, Blöcke, Plattformen, NPCs, Spezialobjekte
   ===================================================================== */
class Bit extends Entity {
  constructor(x, y, val = 1) { super(x, y, 6, 8); this.val = val; this.type = 'bit'; this.fly = false; this.gravity = 0.15; this.t = irnd(0, 30); this.life = 0; }
  update() {
    this.t++; this.life++;
    if (this.fly) { this.applyPhysics({ noSolids: true }); if (this.onGround) { this.vx *= 0.8; if (this.life > 20) this.fly = false; } if (this.life > 900) this.dead = true; }
    const p = this.player; if (p && !p.dying && rectHit({ x: this.x - 2, y: this.y - 2, w: this.w + 4, h: this.h + 4 }, p)) { this.dead = true; Game.addBits(this.val); if (this.val >= 100) { AudioSys.sfx('bit100'); popup(this.cx, this.y - 6, '+100 Bits!', '#ff5ad1'); burst(this.cx, this.cy, '#ff5ad1', 8, 1.5); } else { AudioSys.sfx('bit'); spawnFx(this.x, this.y - 4, { txt: '+' + this.val, col: '#c9a4ff', vy: -0.6, gravity: 0, life: 25 }); } Game.hypeAdd(p.hasPerk('hype') ? 1.5 : 1); }
  }
  draw(g) { if (this.val >= 100) { Sprites.draw(g, 'bit100', this.x - 2, this.y - 2 + Math.sin(this.t * 0.1) * 1.5); return; } const f = ['bit_1', 'bit_2', 'bit_3', 'bit_2'][Math.floor(this.t / 6) % 4]; Sprites.draw(g, f, this.x, this.y + (this.fly ? 0 : Math.sin(this.t * 0.1)), Math.floor(this.t / 6) % 8 >= 4); }
}
class Sub extends Entity {
  constructor(x, y, tier) { super(x, y, 12, 10); this.tier = tier || 1; this.type = 'sub'; this.t = 0; this.fly = false; this.gravity = 0.15; }
  update() { this.t++; if (this.fly) { this.applyPhysics({ noSolids: true }); if (this.onGround) this.fly = false; } const p = this.player; if (p && !p.dying && rectHit(this, p)) { this.dead = true; Game.collectSub(this.tier, this); } }
  draw(g) { const y = this.y + Math.sin(this.t * 0.08) * 2; Sprites.draw(g, 'sub', this.x, y); g.fillStyle = '#fff'; Font.draw(g, 'T' + this.tier, this.cx, y - 8, '#c9a4ff', { align: 'center' }); if (this.t % 20 === 0) spawnFx(this.x + rnd(0, 12), y + rnd(0, 10), { col: '#c9a4ff', life: 15, gravity: -0.02 }); }
}
class Holf extends Entity {
  constructor(x, y, kind) { super(x, y, 10, 12); this.kind = kind || 'gold'; this.type = 'holf'; this.t = 0; }
  update() { this.t++; const p = this.player; if (p && !p.dying && rectHit(this, p)) { this.dead = true; p.collectHolf(this.kind); burst(this.cx, this.cy, ['#ffd700', '#fff'], 12, 2); } }
  draw(g) { const pal = this.kind === 'gold' ? null : this.kind; const y = this.y + Math.sin(this.t * 0.1) * 2; if (this.kind === 'gold') Sprites.draw(g, 'holf', this.x, y); else { const c = this.kind === 'silver' ? { Z: '#d4d4dc', y: '#fff' } : this.kind === 'bronze' ? { Z: '#c47a0f', y: '#ffb347' } : { Z: '#25702f', y: '#7bd23a' }; Sprites.draw(g, 'holf', this.x, y, false, null); g.globalCompositeOperation = 'source-atop'; g.fillStyle = c.Z; g.globalAlpha = 0.7; g.fillRect(this.x, y, 10, 12); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } if (this.t % 15 === 0) spawnFx(this.x + rnd(0, 10), y + rnd(0, 12), { spr: 'spark', life: 12, gravity: 0 }); Font.draw(g, 'HOLF', this.cx, y - 8, '#ffd700', { align: 'center', shadow: true }); }
}
class PowerItem extends Entity {
  constructor(x, y, kind, emerge) { super(x, y, 12, 14); this.kind = kind; this.type = 'item'; this.emerge = emerge ? 16 : 0; this.startY = y; this.vx = kind === 'hafer' || kind === 'mate' ? 0.8 : 0; this.gravity = 0.2; this.t = 0; }
  update() {
    this.t++;
    if (this.emerge > 0) { this.emerge--; this.y -= 1; return; }
    if (this.kind === 'hafer' || this.kind === 'mate') { this.applyPhysics({ noSolids: true }); if (this.hitWall) this.vx = -this.vx; }
    else this.applyPhysics({ noSolids: true });
    const p = this.player; if (p && !p.dying && rectHit(this, p)) { this.dead = true; p.powerUp(this.kind); }
    if (this.y > this.room.h * TILE) this.dead = true;
  }
  draw(g) {
    if (this.emerge > 0) { g.save(); g.beginPath(); g.rect(this.x - 4, this.startY - 16 + 0, 20, 16); g.clip(); }
    const spr = { hafer: 'hafer', banana: 'bshirt', ball: 'sinan_ball', marx: 'marx_card', mate: 'mate', agave: 'agave', brb: 'brb' }[this.kind] || 'hafer';
    Sprites.draw(g, spr, this.x, this.y + (this.kind === 'ball' ? 4 : 0)); if (this.emerge > 0) g.restore();
  }
}
class Gift extends Entity {
  constructor(x, y) { super(x, y, 12, 12); this.type = 'gift'; }
  update() { const p = this.player; if (p && rectHit(this, p)) { this.dead = true; Game.addBits(10); Game.viewers(30); AudioSys.sfx('sub'); popup(this.cx, this.y - 8, 'Gifted Sub! +10', '#ff5ad1'); Chat.react('gift'); burst(this.cx, this.cy, ['#9146ff', '#ff5ad1'], 10, 2); } }
  draw(g) { Sprites.draw(g, 'gift', this.x, this.y + Math.sin(this.anim++ * 0.1) * 1.5); }
}
/* ---- Luigi checkpoint flag ---- */
class Checkpoint extends Entity {
  constructor(x, y, idx) { super(x, y - 32, 12, 32); this.type = 'checkpoint'; this.idx = idx; this.used = false; }
  update() { this.anim++; const p = this.player; if (!this.used && p && !p.dying && rectHit({ x: this.x - 8, y: this.y - 8, w: 28, h: 48 }, p)) { this.used = true; for (const e of this.room.ents) if (e.type === 'checkpoint' && e !== this) e.used = false; Game.setCheckpoint(this); AudioSys.sfx('checkpoint'); popup(this.cx, this.y - 10, 'Checkpoint! Luigi hält die Stellung', '#7bd23a'); if (p.formular > 0) { p.formular = 0; Game.speech(this, 'Gib her, ich mach das.', 80); } else Game.speech(this, pick(['Weiter geht\'s!', 'Ich hab den Vertrag dabei!', 'Du bist 40 Minuten zu spät.', 'Chat fragt, ob du lebst.']), 80); Chat.react('checkpoint'); } }
  draw(g) { Sprites.draw(g, 'flag_pole', this.x + 5, this.y); Sprites.draw(g, this.used ? 'flag_green' : 'flag_grey', this.x + 7, this.y + (this.used ? 2 : 14)); if (this.used) Sprites.draw(g, 'luigi_idle', this.x - 10, this.bottom - 28, false); }
}
/* ---- Level end: Verteilerkasten + sponsor ---- */
class LevelEnd extends Entity {
  constructor(x, y, sponsor) { super(x, y - 32, 16, 32); this.type = 'end'; this.sponsor = sponsor; this.done = false; }
  update() { this.anim++; const p = this.player; if (!this.done && p && !p.dying && rectHit({ x: this.x - 4, y: this.y - 40, w: 40, h: 120 }, p)) { this.done = true; Game.levelComplete(this); } }
  draw(g) { Sprites.draw(g, 'kasten', this.x, this.y); Sprites.draw(g, 'sponsor', this.x + 22, this.bottom - 24, true); if (this.anim % 40 < 20 && !this.done) Font.draw(g, this.sponsor.name, this.x + 30, this.y - 12, '#ffd700', { align: 'center', shadow: true }); g.fillStyle = '#f4d03f'; g.fillRect(this.x + 8, this.bottom - 2, 1, 1); }
}
/* ---- Marx bust (oracle) ---- */
class MarxBust extends Entity {
  constructor(x, y, hint) { super(x, y - 16, 16, 16); this.type = 'marx'; this.hint = hint; }
  update() { this.anim++; const p = this.player; if (p && rectHit(this, p) && Input.was('up') && !Game.cut) Game.askMarx(this.hint, true); }
  draw(g) { Sprites.draw(g, 'marx_bust', this.x, this.y); if (this.player && Math.abs(this.player.cx - this.cx) < 30 && this.anim % 40 < 20) Font.draw(g, '↑ fragen', this.cx, this.y - 10, '#d4d4dc', { align: 'center', shadow: true }); }
}
/* ---- Sinan trampoline ---- */
class SinanNPC extends Entity {
  constructor(x, y) { super(x, y - 24, 14, 24); this.type = 'sinan'; this.flexT = 0; this.talk = 0; }
  update() { this.anim++; const p = this.player; if (this.flexT > 0) this.flexT--; if (p && !p.dying && p.vy > 0 && rectHit(this, p) && p.bottom - this.y < 12) { p.y = this.y - p.h; p.vy = -8.2; p.airJumps = 0; this.flexT = 30; AudioSys.sfx('bounce'); burst(this.cx, this.y, '#fff', 6, 1.5); Game.speech(this, pick(['Spring auf meinen Bizeps, Bruder!', 'Volle Power!', 'Das ist Training!', 'Cardio ist auch Sport.', 'Schau, wie definiert!']), 60); Chat.react('sinan'); Game.viewers(5); } else if (p && rectHit({ x: this.x - 20, y: this.y, w: 54, h: 24 }, p) && this.talk <= 0) { this.talk = 400; Game.speech(this, pick(['Spring auf mich drauf!', 'Ich pos hier nur so.', 'Ohne Sonnenbrille erkennt mich keiner.']), 90); } if (this.talk > 0) this.talk--; }
  draw(g) { Sprites.draw(g, this.flexT > 0 || this.anim % 120 < 40 ? 'sinan_flex' : 'sinan_idle', this.x - 1, this.y, this.player && this.player.cx < this.cx); Font.draw(g, 'ẞ', this.cx - 2, this.y - 1, '#fff'); }
}
/* ---- Hotspot router for offline zones ---- */
class Hotspot extends Entity {
  constructor(x, y, zoneId, range) { super(x, y - 12, 16, 12); this.type = 'hotspot'; this.zone = zoneId; this.on = false; this.range = range || 150; }
  update() { this.anim++; const p = this.player; if (!this.on && p && rectHit(this, p) && (Input.was('up') || Input.was('run'))) { this.on = true; Game.level.room.setOnline(this.zone, this); AudioSys.sfx('online'); popup(this.cx, this.y - 10, 'Hotspot AN! Signal begrenzt', '#7fd6ff'); Chat.react('online'); } }
  draw(g) { Sprites.draw(g, this.on ? 'hotspot' : 'hotspot_off', this.x, this.y); if (!this.on && this.player && Math.abs(this.player.cx - this.cx) < 30 && this.anim % 40 < 20) Font.draw(g, '↑ einschalten', this.cx, this.y - 10, '#7fd6ff', { align: 'center', shadow: true }); }
}
/* ---- Moving platform ---- */
class MovingPlatform extends Entity {
  constructor(x, y, w, dx, dy, period, opts = {}) { super(x, y, w, 6); this.type = 'plat'; this.ox = x; this.oy = y; this.dx = dx; this.dy = dy; this.period = period || 240; this.t = opts.phase || 0; this.noGravity = true; this.noTileCollision = true; this.solid = true; this.lag = opts.lag; this.click = opts.clickbait; this.clickT = 0; this.visible = true; this.wheel = opts.wheel; this.cx0 = opts.cx; this.cy0 = opts.cy; this.r = opts.r; }
  update() {
    this.anim++; this.t++;
    const px = this.x, py = this.y;
    if (this.wheel) { const a = this.t / this.period * Math.PI * 2 + (this.phase0 || 0); this.x = this.cx0 + Math.cos(a) * this.r - this.w / 2; this.y = this.cy0 + Math.sin(a) * this.r; }
    else if (this.lag) { if (this.t % 90 === 0) { const s = Math.sin(this.t / this.period * Math.PI * 2); this.x = this.ox + this.dx * s; this.y = this.oy + this.dy * s; this.lagJump = 8; popup(this.cx, this.y - 10, '999 ms', '#e03a3a'); AudioSys.sfx('tick'); } }
    else { const s = Math.sin(this.t / this.period * Math.PI * 2); this.x = this.ox + this.dx * s; this.y = this.oy + this.dy * s; }
    this.vx = this.x - px; this.vy = this.y - py;
    if (this.click) { if (this.clickT > 0) { this.clickT--; if (this.clickT === 0) { this.visible = false; this.respawn = 120; } } if (!this.visible) { this.respawn--; if (this.respawn <= 0) this.visible = true; } }
    // carry rider
    const p = this.player; if (p && this.visible && p.riding === this) { p.x += this.vx; if (this.vy > 0) p.y += this.vy; if (this.click && this.clickT === 0 && this.visible) { this.clickT = 30; popup(this.cx, this.y - 10, 'Du wirst nicht glauben...', '#f4d03f'); } }
    for (const e of this.room.ents) if (e !== p && e.riding === this && this.visible) { e.x += this.vx; if (this.vy > 0) e.y += this.vy; }
  }
  onRide(e) { if (!this.visible) { e.onGround = false; e.riding = null; e.y += 1; } }
  draw(g) { if (!this.visible) return; if (this.click) { g.fillStyle = this.clickT > 0 && this.anim % 6 < 3 ? '#fff' : '#f4d03f'; g.fillRect(this.x, this.y, this.w, 6); g.fillStyle = '#c9a227'; g.fillRect(this.x, this.y + 5, this.w, 1); Font.draw(g, 'CLICK!', this.cx, this.y - 1, '#a01c1c', { align: 'center' }); return; } if (this.lag) { g.globalAlpha = this.lagJump > 0 ? 0.4 : 1; if (this.lagJump > 0) this.lagJump--; } for (let x = 0; x < this.w; x += 16) g.drawImage(Tiles.img('-'), Math.round(this.x + x), Math.round(this.y)); if (this.lag) { g.globalAlpha = 1; Font.draw(g, (this.lagJump > 0 ? '999' : irnd(20, 90)) + 'ms', this.cx, this.y - 9, this.lagJump > 0 ? '#e03a3a' : '#7bd23a', { align: 'center' }); } if (this.wheel) { g.strokeStyle = '#8a8a96'; g.beginPath(); g.moveTo(this.cx, this.y); g.lineTo(this.cx0, this.cy0); g.stroke(); Sprites.draw(g, 'gondel', this.cx - 8, this.y - 4); } }
}
/* ---- Falling/crumbling platform (Soletti bridge) ---- */
class Soletti extends Entity {
  constructor(x, y, w) { super(x, y, w || 16, 4); this.type = 'plat'; this.noGravity = true; this.noTileCollision = true; this.solid = true; this.timer = -1; }
  update() { this.anim++; const p = this.player; if (p && p.riding === this && this.timer < 0) { this.timer = 40; } if (this.timer > 0) { this.timer--; if (this.timer % 8 === 0) spawnFx(this.x + rnd(0, this.w), this.bottom, { col: '#8b5a2b', life: 15 }); if (this.timer === 0) { this.dead = true; burst(this.cx, this.cy, '#8b5a2b', 8, 1.5, {}); AudioSys.sfx('break'); if (p.riding === this) { p.riding = null; p.onGround = false; } } } }
  draw(g) { const off = this.timer > 0 && this.timer < 20 ? Math.sin(this.anim) * 1 : 0; for (let x = 0; x < this.w; x += 16) Sprites.draw(g, 'soletti', this.x + x + off, this.y); }
}
/* ---- Cookie banner: covers screen until "nur notwendige" clicked ---- */
class CookieBanner extends Entity {
  constructor(x, y) { super(x, y, 96, 40); this.type = 'cookie'; this.noGravity = true; this.noTileCollision = true; this.solid = true; this.closed = false; this.h = 40; this.spawnCd = 0; }
  update() { this.anim++; if (this.closed) return; const p = this.player; this.spawnCd--;
    // "ALLE AKZEPTIEREN" big button = bottom-left region, being touched from below spawns cookies
    if (p && rectHit({ x: this.x + 8, y: this.y + 20, w: 54, h: 14 }, p) && this.spawnCd <= 0) { this.spawnCd = 60; const c = new Cookie(this.cx + rnd(-20, 20), this.bottom + 2); this.room.add(c); popup(this.cx, this.bottom + 10, 'ALLE AKZEPTIERT! Cookies!', '#e03a3a'); AudioSys.sfx('cookie'); }
    // "nur notwendige" tiny button top-right: needs to be jumped on top
    if (p && p.vy > 0 && rectHit({ x: this.x + 70, y: this.y + 18, w: 20, h: 10 }, p) && p.bottom < this.y + 30) { this.closed = true; p.vy = -3; AudioSys.sfx('select'); popup(this.cx, this.y - 10, 'nur notwendige ✓', '#7bd23a'); Chat.react('cookie'); burst(this.cx, this.cy, '#fff', 12, 2); }
  }
  onRide(e) { if (this.closed) { e.onGround = false; e.riding = null; } }
  draw(g) { if (this.closed) return; Sprites.draw(g, 'cookiebanner', this.x, this.y); Font.draw(g, 'Wir nutzen Cookies', this.x + 6, this.y + 5, '#101014'); Font.draw(g, 'ALLE AKZEPTIEREN', this.x + 12, this.y + 24, '#fff'); Font.draw(g, 'nur', this.x + 72, this.y + 21, '#8a8a96'); Font.draw(g, 'notw.', this.x + 70, this.y + 28, '#8a8a96'); }
}
/* ---- Captcha blocks: 3x3 grid, hit the ones with bikes ---- */
class Captcha extends Entity {
  constructor(x, y, door, cells) { super(x, y, 48, 48); this.type = 'captcha'; this.noGravity = true; this.noTileCollision = true; this.cells = cells || null; this.alwaysActive = true; this.bikes = []; const rng = makeRng(x * 7 + y); while (this.bikes.length < 3) { const i = rng.int(0, 8); if (!this.bikes.includes(i)) this.bikes.push(i); } this.hit = []; this.solved = false; this.door = door; this.fail = 0; }
  cellRect(i) { if (this.cells) return { x: this.cells[i][0] * TILE, y: this.cells[i][1] * TILE, w: 16, h: 16 }; return { x: this.x + (i % 3) * 16, y: this.y + Math.floor(i / 3) * 16, w: 16, h: 16 }; }
  update() { this.anim++; if (this.fail > 0) this.fail--; }
  onHit(tx, ty) { // called from room when block bumped
    for (let i = 0; i < 9; i++) { const c = this.cellRect(i); if (Math.floor(c.x / TILE) === tx && Math.floor(c.y / TILE) === ty) { if (this.solved) return; if (this.bikes.includes(i)) { if (!this.hit.includes(i)) { this.hit.push(i); AudioSys.sfx('select'); } if (this.hit.length === 3) { this.solved = true; Game.level.room.openDoor(this.door); popup(this.cx, this.y - 10, 'Kein Roboter! Tür offen', '#7bd23a'); AudioSys.sfx('clear'); } } else { this.hit = []; this.fail = 60; AudioSys.sfx('back'); popup(this.cx, this.y - 10, 'Sind Sie ein Roboter?', '#e03a3a'); const b = new HotlineBot(this.cx, this.bottom + 2); this.room.add(b); } } } }
  draw(g) { for (let i = 0; i < 9; i++) { const c = this.cellRect(i); g.fillStyle = this.hit.includes(i) ? '#7bd23a' : this.fail > 0 && this.anim % 8 < 4 ? '#e03a3a' : '#c9ccd2'; g.fillRect(c.x, c.y, 16, 16); g.fillStyle = '#8a8a96'; g.fillRect(c.x, c.y, 16, 1); g.fillRect(c.x, c.y, 1, 16); if (this.bikes.includes(i)) Sprites.draw(g, 'bike', c.x + 4, c.y + 4); else { g.fillStyle = ['#3fa34d', '#3a7bd5', '#f28c28'][i % 3]; g.fillRect(c.x + 4, c.y + 6, 8, 6); } } Font.draw(g, this.solved ? 'Kein Roboter ✓' : 'CAPTCHA: Wähle alle Fahrräder (' + this.hit.length + '/3)', this.cells ? this.x + 24 : this.cx, this.y - 9, this.solved ? '#7bd23a' : '#fff', { align: 'center', shadow: true }); }
}
/* ---- Door (opened by captcha/ticket/wartenummer) ---- */
class Door extends Entity {
  constructor(x, y, id, h) { super(x, y, 16, h || 48); this.type = 'door'; this.id = id; this.open = false; this.noGravity = true; this.noTileCollision = true; this.openT = 0; }
  update() { this.anim++; if (this.open && this.openT < this.h) { this.openT += 2; } const p = this.player; if (!this.open && p && rectHit(this, p)) { p.x = p.cx < this.cx ? this.x - p.w : this.right; p.vx = 0; if (this.anim % 60 === 0) popup(this.cx, this.y - 8, this.hint || 'Verschlossen', '#aaa'); } }
  draw2(g) { if (!this.open && this.hint && this.player && Math.abs(this.player.cx - this.cx) < 100) { const y = Math.max(this.y, this.room.camY + 30); const lines = Font.wrap(this.hint, 22); const bw = Math.max(...lines.map(l => Font.width(l))) + 8; const bx = clamp(this.cx - bw / 2, this.room.camX + 2, this.room.camX + VW - bw - 2); g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(bx, y, bw, lines.length * 9 + 5); lines.forEach((l, i) => Font.draw(g, l, bx + 4, y + 3 + i * 9, '#fff')); } }
  draw(g) { g.save(); g.beginPath(); g.rect(this.x, this.y, 16, this.h - this.openT); g.clip(); for (let y = 0; y < this.h; y += 16) { g.fillStyle = '#5a5a66'; g.fillRect(this.x, this.y + y, 16, 16); g.fillStyle = '#8a8a96'; g.fillRect(this.x + 2, this.y + y + 2, 12, 12); g.fillStyle = '#e03a3a'; g.fillRect(this.x + 6, this.y + y + 6, 4, 4); } g.restore(); if (!this.open && this.anim % 40 < 20) Sprites.draw(g, 'lock', this.x + 4, this.y - 10); }
}
/* ---- Wartenummer blocks: hit in order ---- */
class WartenummerSystem { constructor(nums, door) { this.nums = nums; this.next = 0; this.door = door; } hit(n, room) { if (n === this.nums[this.next]) { this.next++; AudioSys.sfx('select'); if (this.next >= this.nums.length) { room.openDoor(this.door); Game.banner('Nummer ' + n + ' - bitte zu Schalter 4B', '#7bd23a'); AudioSys.sfx('clear'); } else Game.banner('Nummer ' + n + ' aufgerufen', '#fff'); return true; } else { this.next = 0; Game.banner('Falsche Nummer! Bitte neu ziehen.', '#e03a3a'); AudioSys.sfx('back'); return false; } } }
/* ---- Ticket for NIXNET doors ---- */
class Ticket extends Entity {
  constructor(x, y, door, ttl) { super(x, y, 12, 8); this.type = 'ticket'; this.door = door; this.ttl = ttl || 600; this.t = 0; }
  update() { this.t++; const p = this.player; if (p && rectHit(this, p)) { this.dead = true; Game.ticket = { door: this.door, ttl: this.ttl, no: irnd(100, 999) }; AudioSys.sfx('select'); popup(this.cx, this.y - 8, 'Ticket #' + Game.ticket.no + ' gezogen!', '#7bd23a'); Chat.react('ticket'); } }
  draw(g) { Sprites.draw(g, 'ticket', this.x, this.y + Math.sin(this.t * 0.1) * 1.5); Font.draw(g, 'TICKET', this.cx, this.y - 8, '#fff', { align: 'center' }); }
}
class TicketDoor extends Door {
  update() { this.anim++; if (this.open && this.openT < this.h) this.openT += 2; const p = this.player; if (!this.open && p && rectHit({ x: this.x - 4, y: this.y, w: 24, h: this.h }, p)) { if (Game.ticket && Game.ticket.door === this.id) { this.open = true; Game.ticket = null; AudioSys.sfx('clear'); popup(this.cx, this.y - 8, 'Ticket akzeptiert', '#7bd23a'); } else { p.x = p.cx < this.cx ? this.x - p.w - 4 : this.right + 4; p.vx = 0; if (this.anim % 50 === 0) popup(this.cx, this.y - 8, Game.ticket ? 'Falsches Ticket!' : 'Bitte Ticket ziehen', '#e03a3a'); } } }
}
/* ---- Heuballen / rolling boulder ---- */
class Heuballen extends Enemy {
  constructor(x, y, dir) { super(x, y, 16, 16); this.dir = dir || -1; this.vx = this.dir * 1.6; this.stompable = false; this.noBall = true; this.spinKillable = false; this.name = 'Heuballen'; this.ignoreOneWay = true; }
  ai() { this.vx = this.dir * 1.6; if (this.anim % 8 === 0) dust(this.cx, this.bottom, 1); if (this.hitWall) { this.dead = true; burst(this.cx, this.cy, '#f4d03f', 12, 2); AudioSys.sfx('break'); } }
  afterPhysics() { if (this.hitWall) { this.dead = true; burst(this.cx, this.cy, '#f4d03f', 12, 2); } }
  hitByThrown() { }
  draw(g) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(this.x * 0.1 * this.dir); Sprites.draw(g, 'heu', -8, -8); g.restore(); }
}
class HeuSpawner extends Entity {
  constructor(x, y, dir, interval) { super(x, y, 4, 4); this.type = 'spawner'; this.dir = dir; this.interval = interval || 200; this.t = irnd(0, interval); }
  update() { this.t++; if (this.t >= this.interval && this.distToPlayer() < 260) { this.t = 0; this.room.add(new Heuballen(this.x, this.y, this.dir)); AudioSys.sfx('roll'); } }
  draw(g) { }
}
/* ---- Grill-Kessel cannon ---- */
class GrillKessel extends Entity {
  constructor(x, y, dir) { super(x, y - 16, 16, 16); this.type = 'kessel'; this.dir = dir || -1; this.t = irnd(0, 100); this.solid = true; this.noGravity = true; this.noTileCollision = true; }
  update() { this.anim++; this.t++; if (this.t > 150 && this.distToPlayer() < 220) { this.t = 0; const w = new Wurst(this.cx + this.dir * 8, this.y + 2, this.dir * 2.4, -1); w.gravity = 0.03; w.life = 200; this.room.add(w); burst(this.cx + this.dir * 8, this.y + 4, '#aaa', 4, 1); AudioSys.sfx('throw'); } }
  draw(g) { g.fillStyle = '#202028'; g.fillRect(this.x, this.y + 4, 16, 12); g.fillStyle = '#4c4c56'; g.fillRect(this.x + 2, this.y + 6, 12, 8); g.fillStyle = '#ff8a5c'; g.fillRect(this.x + 4, this.y + 8, 8, 2); g.fillStyle = '#202028'; g.fillRect(this.x + (this.dir > 0 ? 12 : -4), this.y + 2, 8, 6); if (this.anim % 10 < 5) { g.fillStyle = '#8a8a96'; g.fillRect(this.x + 6, this.y - 2 - (this.anim % 20) / 4, 4, 3); } }
}
/* ---- Buffering ring (rotating hazard) ---- */
class BufferRing extends Entity {
  constructor(x, y, len, speed) { super(x, y, 4, 4); this.type = 'buffer'; this.len = len || 4; this.a = 0; this.spd = speed || 0.03; this.noGravity = true; this.noTileCollision = true; }
  update() { this.a += this.spd * (Game.slowmo ? 0.4 : 1); const p = this.player; if (!p || p.dying || p.invincible) return; for (let i = 1; i <= this.len; i++) { const bx = this.x + Math.cos(this.a) * i * 10, by = this.y + Math.sin(this.a) * i * 10; if (rectHit({ x: bx - 4, y: by - 4, w: 8, h: 8 }, p)) { p.hurt(this); break; } } }
  draw(g) { g.fillStyle = '#4c4c56'; g.fillRect(this.x - 3, this.y - 3, 6, 6); for (let i = 1; i <= this.len; i++) { const bx = this.x + Math.cos(this.a) * i * 10, by = this.y + Math.sin(this.a) * i * 10; Sprites.draw(g, 'buffer', bx - 5, by - 5); } }
}
/* ---- Stecker (final carry) ---- */
class Stecker extends Entity {
  constructor(x, y) { super(x, y, 16, 10); this.throwable = true; this.type = 'stecker'; this.gravity = 0.2; }
  update() { this.anim++; if (this.carried) return; if (this.gentle > 0) this.gentle--; this.applyPhysics(); if (this.thrown > 0) { this.thrown--; } if (this.onGround) this.vx *= 0.7; if (this.y > this.room.h * TILE) { this.y = this.startY || 100; this.x = this.startX || 100; this.vy = 0; popup(this.cx, this.y, 'Stecker zurück!', '#7fd6ff'); } }
  draw(g) { Sprites.draw(g, 'stecker', this.x, this.y); if (!this.carried && this.anim % 40 < 20) Font.draw(g, 'Shift: tragen', this.cx, this.y - 10, '#7fd6ff', { align: 'center', shadow: true }); }
}
class Buchse extends Entity {
  constructor(x, y) { super(x, y - 16, 16, 16); this.type = 'buchse'; }
  update() { this.anim++; const p = this.player; if (p && p.carry && p.carry.type === 'stecker' && rectHit({ x: this.x - 6, y: this.y - 6, w: 28, h: 28 }, p)) { p.carry.dead = true; p.carry = null; Game.pluggedIn(); } }
  draw(g) { g.fillStyle = '#4c4c56'; g.fillRect(this.x, this.y, 16, 16); g.fillStyle = '#101014'; g.fillRect(this.x + 4, this.y + 4, 8, 8); g.fillStyle = Game.plugged ? '#7bd23a' : (this.anim % 30 < 15 ? '#e03a3a' : '#5a1a1a'); g.fillRect(this.x + 6, this.y + 1, 4, 2); if (!Game.plugged) Font.draw(g, 'HIER', this.cx, this.y - 10, '#7fd6ff', { align: 'center', shadow: true }); }
}
/* ---- Trinkgeld-Münze & Tisch (Herr Ober) ---- */
class Coin extends Entity {
  constructor(x, y) { super(x, y, 8, 8); this.throwable = true; this.type = 'coin'; this.gravity = 0.2; this.t = 0; }
  update() { this.t++; if (this.carried) return; if (this.gentle > 0) this.gentle--; this.applyPhysics(); if (this.onGround) this.vx *= 0.7; }
  draw(g) { Sprites.draw(g, 'coin', this.x, this.y + (this.carried ? 0 : Math.sin(this.t * 0.1))); if (!this.carried && this.t % 40 < 20) Font.draw(g, 'Trinkgeld', this.cx, this.y - 9, '#ffd700', { align: 'center', shadow: true }); }
}
class Tisch extends Entity {
  constructor(x, y) { super(x, y - 12, 32, 12); this.type = 'tisch'; this.coins = 0; this.solid = true; this.noGravity = true; this.noTileCollision = true; }
  update() { this.anim++; for (const e of this.room.ents) if (e.type === 'coin' && !e.dead && !e.carried && rectHit({ x: this.x, y: this.y - 12, w: this.w, h: 14 }, e)) { e.dead = true; this.coins++; AudioSys.sfx('bit100'); popup(this.cx, this.y - 12, 'Trinkgeld ' + this.coins + '/5', '#ffd700'); Game.viewers(10); if (this.coins >= 5 && this.onFull) this.onFull(); } const p = this.player; if (p && rectHit({ x: this.x, y: this.y - 4, w: this.w, h: 8 }, p) && Input.was('down') && Game.bits >= 100 && this.coins < 5 && !this.paid) { this.paid = true; Game.addBits(-100, true); this.coins = 5; popup(this.cx, this.y - 12, '100 Bits Trinkgeld. Reichtum kauft alles.', '#ffd700'); Chat.react('richtip'); if (this.onFull) this.onFull(); } }
  draw(g) { g.fillStyle = '#fff'; g.fillRect(this.x, this.y, this.w, 4); g.fillStyle = '#5b4636'; g.fillRect(this.x + 4, this.y + 4, 4, 8); g.fillRect(this.x + this.w - 8, this.y + 4, 4, 8); for (let i = 0; i < this.coins; i++) Sprites.draw(g, 'coin', this.x + 2 + i * 6, this.y - 6); if (this.coins < 5 && this.player && Math.abs(this.player.cx - this.cx) < 40 && this.anim % 40 < 20) Font.draw(g, Game.bits >= 100 ? 'Münzen ablegen (↓+Shift) / ↓ 100 Bits' : 'Münzen hier ablegen', this.cx, this.y - 16, '#fff', { align: 'center', shadow: true }); }
}
/* ---- Speech bubble helper ---- */
class Speech extends Entity {
  constructor(target, text, life, small) { super(target.cx, target.y, 1, 1); this.target = target; this.text = text; this.life = life; this.small = small; this.type = 'fx'; this.layer = 4; this.noTileCollision = true; this.noGravity = true; this.alwaysActive = true; }
  update() { this.life--; if (this.life <= 0 || this.target.dead) this.dead = true; }
  draw(g) { const t = this.target; const lines = Font.wrap(this.text, this.small ? 22 : 30); const w = Math.max(...lines.map(l => Font.width(l))) + 6, h = lines.length * 9 + 3; let x = Math.round(t.cx - w / 2), y = Math.round(t.y - h - 10); x = clamp(x, Game.level.room.camX + 2, Game.level.room.camX + VW - w - 2); y = Math.max(Game.level.room.camY + 2, y); g.fillStyle = '#fff'; g.fillRect(x, y, w, h); g.fillStyle = '#000'; g.fillRect(x + 1, y + 1, w - 2, h - 2); g.fillStyle = '#fff'; g.fillRect(x + 2, y + 2, w - 4, h - 4); g.fillRect(Math.round(t.cx) - 1, y + h, 2, 3); lines.forEach((l, i) => Font.draw(g, l, x + 3, y + 3 + i * 9, '#101014')); }
}
