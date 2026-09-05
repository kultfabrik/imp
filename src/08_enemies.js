/* =====================================================================
   08 enemies: alle Standardgegner, Projektile, Ausweich-Figuren
   ===================================================================== */
class Enemy extends Entity {
  constructor(x, y, w, h) { super(x, y, w, h); this.isEnemy = true; this.type = 'enemy'; this.laugh = 0; this.stompable = true; this.helmet = false; this.hp = 1; this.usesSolids = true; this.turnAtEdge = false; this.speed = 0.5; this.hitT = 0; this.dir = -1; this.freezeT = 0; this.name = 'Gegner'; }
  get stunned() { return this.laugh > 0 || this.freezeT > 0; }
  update() {
    this.anim++; if (this.hitT > 0) this.hitT--;
    if (Game.slowmo && this.anim % 5 !== 0) { /* slow: skip 4/5 of updates → 20%? too slow; use 40% */ }
    if (this.laugh > 0) { this.laugh--; if (this.laugh % 25 === 0) spawnFx(this.cx - 4 + rnd(-6, 6), this.y - 6, { spr: 'laugh', vy: -0.5, gravity: 0, life: 25 }); this.applyPhysics(); this.contact(); return; }
    if (this.freezeT > 0) { this.freezeT--; this.applyPhysics(); this.contact(); return; }
    this.ai(); this.applyPhysics(); this.afterPhysics(); this.contact();
    if (this.y > this.room.h * TILE + 32) this.dead = true;
  }
  ai() { }
  afterPhysics() { if (this.hitWall) this.dir = -this.dir; if (this.turnAtEdge && this.onGround) { const ax = this.dir > 0 ? this.right + 2 : this.x - 2; if (!this.room.solidAtPx(ax, this.bottom + 4) && !this.room.solidAtPx(ax, this.bottom + 12)) { this.dir = -this.dir; } } }
  contact() {
    const p = this.player; if (!p || p.dying || p.pipeT > 0 || p.won || this.dead || this.noContact) return;
    const hb = this.hitbox || this;
    if (!rectHit(hb, p)) return;
    if (p.holf === 'gold' || (p.spin > 0 && this.spinKillable !== false)) { this.kill('holf'); return; }
    if (p.gp && this.stompable) { this.kill('pound'); p.stomped(this); p.vy = -4; return; }
    // stomp check
    const falling = p.vy > 0 || p.bottom - p.vy <= hb.y + 4;
    if (this.stompable && !this.helmet && falling && p.bottom - hb.y < 10 + Math.max(0, p.vy) && p.bottom - hb.y >= -2) { this.onStomp(p); return; }
    if (this.stompable && this.helmet && falling && p.bottom - hb.y < 10 + Math.max(0, p.vy) && p.bottom - hb.y >= -2) { p.vy = -3.5; AudioSys.sfx('bump'); popup(this.cx, this.y - 8, 'Helm!', '#aaa'); p.x += (p.cx < this.cx ? -6 : 6); return; }
    if (this.laugh > 0 && p.holf === 'silver') return;
    if (this.freezeT > 0 && this.throwable) return;
    if (this.stunned && this.harmlessWhenStunned) return;
    if (this.marxImmune && p.form === 'marx') { if (!this.greeted) { this.greeted = true; Game.speech(this, 'Ah, Herr Marx. Sie haben Termin.', 90); } return; }
    this.onTouch(p);
  }
  onTouch(p) { p.hurt(this, { fromEnemy: true }); }
  onStomp(p) { p.stomped(this); this.kill('stomp'); }
  kill(how) {
    if (this.dead) return; this.dead = true; this.room.onEnemyKilled(this, how);
    if (how === 'stomp' || how === 'pound') { this.flatT = 1; spawnFx(this.x, this.bottom - (SPR[this.flatSprite || ''] ? SPR[this.flatSprite].h : 6), { spr: this.flatSprite || null, col: '#000', life: 30, gravity: 0, size: 0, flip: this.dir > 0 }); if (!this.flatSprite) burst(this.cx, this.cy, this.color || '#aaa', 8, 1.5); }
    else { spawnFx(this.x, this.y, { spr: this.deathSprite || this.sprite(), vy: -3.5, vx: how === 'ball' ? 1.5 : (this.player && this.player.cx < this.cx ? 1.5 : -1.5), life: 60, gravity: 0.2, flip: this.dir > 0 }); AudioSys.sfx('kick'); Game.viewers(5); }
    if (Game.level.player.hasPerk('umverteilung') && how !== 'stomp' && how !== 'pound') { const b = new Bit(this.cx - 3, this.y, 1); b.vy = -2; b.fly = true; this.room.add(b); }
  }
  hitByThrown(obj) { this.kill('thrown'); }
  onBall(b) { this.kill('ball'); }
  sprite() { return 'kartoni_1'; }
  draw(g) { const s = this.sprite(); const sz = Sprites.size(s); const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null; Sprites.draw(g, s, this.cx - sz.w / 2, this.bottom - sz.h, this.dir > 0, pal); if (this.laugh > 0 && this.anim % 16 < 8) Font.draw(g, 'HAHA', this.cx, this.y - 10, '#fff', { align: 'center', shadow: true }); }
}
/* --- Kartoni: wandering box --- */
class Kartoni extends Enemy {
  constructor(x, y) { super(x, y, 14, 16); this.speed = 0.45; this.flatSprite = 'kartoni_flat'; this.name = 'Kartoni'; this.color = '#8b5a2b'; this.throwable = true; this.pickupCond = () => this.freezeT > 0; }
  ai() { if (this.carried) return; if (this.thrown > 0) { this.thrown--; return; } this.vx = this.dir * this.speed * (this.distToPlayer() < 60 ? 1.4 : 1); }
  update() { if (this.carried) { this.anim++; return; } if (this.thrown > 0) { this.thrown--; this.applyPhysics(); if (this.hitWall) { this.kill('thrown'); } for (const e of this.room.ents) if (e !== this && e.isEnemy && !e.dead && rectHit(this, e)) { e.hitByThrown(this); this.kill('thrown'); break; } if (this.onGround) { this.thrown = 0; this.freezeT = 0; this.dir = sign(this.vx) || this.dir; } return; } super.update(); }
  onStomp(p) { p.stomped(this); if (this.freezeT > 0) this.kill('stomp'); else { this.freezeT = 240; this.vx = 0; popup(this.cx, this.y - 8, 'Zugeklebt', '#aaa'); } }
  sprite() { return this.freezeT > 0 ? 'kartoni_flat' : this.anim % 24 < 12 ? 'kartoni_1' : 'kartoni_2'; }
  draw(g) { if (this.freezeT > 0) { Sprites.draw(g, 'kartoni_flat', this.x - 1, this.bottom - 6); if (this.anim % 20 < 10) Font.draw(g, 'tragen: Shift', this.cx, this.y - 8, '#fff', { align: 'center', shadow: true }); } else super.draw(g); }
}
/* --- Grillmeister: patrols, throws sausages --- */
class Grillmeister extends Enemy {
  constructor(x, y, helmet) { super(x, y, 12, 20); this.helmet = !!helmet; this.isMeat = true; this.name = helmet ? 'Steak-Sepp' : 'Grillmeister'; this.speed = 0.4; this.turnAtEdge = true; this.throwCd = irnd(60, 150); this.color = '#e03a3a'; this.marxImmune = false; }
  ai() { this.vx = this.dir * this.speed; this.throwCd--; if (this.throwCd <= 0 && this.distToPlayer() < 140 && Math.abs(this.player.cy - this.cy) < 80) { this.throwCd = irnd(110, 190); this.facePlayer(); const w = new Wurst(this.cx, this.y + 4, this.dir * rnd(1.4, 2.2), -3.2); this.room.add(w); Game.speech(this, pick(['Ohne Fleisch is doch kein Essen!', 'Wurst gefällig?', 'Tofu? Igitt!', 'Hier riecht es nach Grill!']), 60, true); } }
  tofuify() { this.dead = true; const t = new Tofu(this.x, this.bottom - 8); this.room.add(t); burst(this.cx, this.cy, ['#fff', '#7bd23a'], 8, 1.5); AudioSys.sfx('tofu'); }
  kill(how) { super.kill(how); if (how === 'stomp' || how === 'pound') { const t = new Tofu(this.x, this.bottom - 8); t.vy = -2; t.fromEnemy = true; this.room.add(t); } }
  sprite() { const w = this.stunned || Math.abs(this.vx) < 0.1 ? 1 : (this.anim % 20 < 10 ? 1 : 2); return (this.helmet ? 'sepp_' : 'grill_') + w; }
}
class Wurst extends Entity {
  constructor(x, y, vx, vy) { super(x - 6, y, 12, 5); this.vx = vx; this.vy = vy; this.isProjectile = true; this.sprName = 'wurst'; this.gravity = 0.15; this.life = 300; this.type = 'proj'; this.hostile = true; this.spiky = false; this.noTileCollision = false; }
  update() { this.anim++; this.life--; if (this.life <= 0) this.dead = true; if (this.spiky) { this.vx = this.dir * 0.6; this.applyPhysics({ noSolids: true }); if (this.hitWall) this.dir = -this.dir; } else { this.applyPhysics({ noSolids: true }); if (this.onGround || this.hitWall) { if (this.becomesSpiky) { this.spiky = true; this.dir = sign(this.vx) || 1; this.life = 900; this.h = 5; } else { this.dead = true; burst(this.cx, this.cy, '#ff8a5c', 4, 1); } } } const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.spin > 0 || p.holf === 'gold' || (this.spiky && p.gp)) { this.dead = true; burst(this.cx, this.cy, '#ff8a5c', 4, 1); } else if (this.spiky && p.vy > 0 && p.bottom - this.y < 8) { p.hurt(this); } else if (!p.hurt(this)) { } else this.dead = true; } if (p && p.holf === 'green' && !this.dead) { this.dead = true; const t = new Tofu(this.x, this.y); t.vy = -2; this.room.add(t); } }
  draw(g) { if (this.spiky) Sprites.draw(g, 'wurst_spiky', this.x, this.y - 1, this.dir > 0); else { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(this.anim * 0.25); Sprites.draw(g, 'wurst', -6, -2); g.restore(); } }
}
class Tofu extends Entity {
  constructor(x, y) { super(x, y, 12, 8); this.throwable = true; this.type = 'tofu'; this.life = 900; this.gravity = 0.2; }
  update() { this.anim++; this.life--; if (this.life <= 0) this.dead = true; if (this.carried) return; if (this.gentle > 0) this.gentle--; this.applyPhysics({ noSolids: true }); if (this.thrown > 0) { this.thrown--; for (const e of this.room.ents) if (e.isEnemy && !e.dead && rectHit(this, e)) { e.hitByThrown(this); this.dead = true; burst(this.cx, this.cy, '#fff', 6, 1.5); break; } if (this.hitWall) { this.dead = true; burst(this.cx, this.cy, '#fff', 6, 1.5); } } else if (this.onGround) { this.vx *= 0.8; } const p = this.player; if (p && !p.carry && this.thrown <= 0 && (this.fromEnemy ? this.life < 880 : true) && rectHit(this, p) && Input.is('down') && p.onGround) { this.dead = true; p.powerUp('tofu'); } }
  draw(g) { Sprites.draw(g, 'tofu', this.x - 1, this.y); if (!this.carried && this.thrown <= 0 && this.player && Math.abs(this.player.cx - this.cx) < 30 && this.anim % 40 < 20) Font.draw(g, '↓ essen / Shift tragen', this.cx, this.y - 9, '#fff', { align: 'center', shadow: true }); }
}
/* --- Wurst-Wolke (Lakitu) --- */
class WurstWolke extends Enemy {
  constructor(x, y) { super(x, y, 24, 12); this.noGravity = true; this.noTileCollision = true; this.baseY = y; this.cd = 90; this.isMeat = true; this.name = 'Wurst-Wolke'; this.stompable = true; this.color = '#aaa'; }
  ai() { const p = this.player; const tx = p.cx + p.vx * 30 - this.w / 2; this.vx = clamp((tx - this.x) * 0.03, -1.6, 1.6); this.x += this.vx; this.y = this.baseY + Math.sin(this.anim * 0.05) * 6; if (this.x < this.room.camMinX + 8) this.x = this.room.camMinX + 8; this.cd--; if (this.cd <= 0 && Math.abs(p.cx - this.cx) < 80) { this.cd = irnd(120, 200); const w = new Wurst(this.cx, this.bottom, rnd(-0.5, 0.5), 1); w.becomesSpiky = true; this.room.add(w); } }
  applyPhysics() { }
  tofuify() { this.dead = true; burst(this.cx, this.cy, ['#fff', '#7bd23a'], 8, 1.5); const t = new Tofu(this.x + 6, this.y); this.room.add(t); }
  sprite() { return 'cloud'; }
}
/* --- Chat-Troll: shoots hate bubbles --- */
class ChatTroll extends Enemy {
  constructor(x, y) { super(x, y, 12, 16); this.cd = 80; this.name = 'Chat-Troll'; this.color = '#7bd23a'; this.flatSprite = null; }
  ai() { this.vx = 0; this.facePlayer(); this.cd--; if (this.cd <= 0 && this.distToPlayer() < 130) { this.cd = irnd(120, 180); const b = new HateBubble(this.cx, this.y - 4, this); this.room.add(b); Game.speech(this, pick(['L', 'cringe', 'ok boomer', 'unfollow', 'wo content?', 'RIP Stream', 'boring']), 50, true); } }
  onStomp(p) { p.stomped(this); popup(this.cx, this.y - 14, 'Nutzer gemeldet', '#7bd23a'); this.kill('stomp'); }
  sprite() { return this.anim % 30 < 15 ? 'troll_1' : 'troll_2'; }
}
class HateBubble extends Entity {
  constructor(x, y, owner) { super(x - 6, y - 4, 12, 7); this.noGravity = true; this.noTileCollision = true; this.life = 220; this.isProjectile = true; this.type = 'proj'; this.sprName = 'bubble_hate'; this.spd = 0.9; }
  update() { this.anim++; this.life--; if (this.life <= 0) { this.dead = true; return; } const p = this.player; const dx = p.cx - this.cx, dy = p.cy - 4 - this.cy; const d = Math.hypot(dx, dy) || 1; this.vx = lerp(this.vx, dx / d * this.spd, 0.05); this.vy = lerp(this.vy, dy / d * this.spd, 0.05); this.x += this.vx; this.y += this.vy; if (this.room.solidAtPx(this.cx, this.cy)) this.dead = true; if (p && !p.dying && rectHit(this, p)) { if (p.spin > 0 || p.holf === 'gold') { this.dead = true; } else if (p.hurt(this)) this.dead = true; } }
  draw(g) { Sprites.draw(g, 'bubble_hate', this.x, this.y - 2); }
}
/* --- Kabelsalat (piranha) --- */
class Kabelsalat extends Enemy {
  constructor(x, y, pipeTop) { super(x, y, 12, 24); this.noGravity = true; this.noTileCollision = true; this.baseY = y; this.t = irnd(0, 200); this.stompable = false; this.name = 'Kabelsalat'; this.color = '#f4d03f'; this.pipeTop = pipeTop; this.harmlessWhenStunned = false; this.spinKillable = true; }
  ai() { this.t++; const cyc = this.t % 240; const p = this.player; const near = Math.abs(p.cx - this.cx) < 24 && p.bottom <= this.baseY + 4; let off; if (cyc < 60) off = 24 - cyc * 0.4; else if (cyc < 140) off = 0; else if (cyc < 200) off = (cyc - 140) * 0.4; else off = 24; if (near && off >= 24 && cyc >= 200) this.t -= 1; this.y = this.baseY + off; this.h = Math.max(1, 24 - off); this.noContact = off >= 22; }
  update() { super.update(); }
  draw(g) { g.save(); g.beginPath(); g.rect(this.x - 8, this.baseY - 8, 32, 32); g.clip(); Sprites.draw(g, this.anim % 30 < 15 ? 'kabel_1' : 'kabel_2', this.x - 2, this.y, this.dir > 0); g.restore(); if (this.laugh > 0 && this.anim % 16 < 8) Font.draw(g, 'HAHA', this.cx, this.baseY - 12, '#fff', { align: 'center', shadow: true }); }
  hitByThrown() { this.kill('thrown'); }
}
/* --- Techniker Torben (drill) & Kevin (cable ties) --- */
class Techniker extends Enemy {
  constructor(x, y, kind) { super(x, y, 12, 20); this.kind = kind || 'torben'; this.helmet = true; this.speed = 0.5; this.turnAtEdge = true; this.cd = irnd(90, 180); this.name = this.kind === 'torben' ? 'Techniker Torben' : 'Techniker Kevin'; this.color = '#f28c28'; this.hp = 1; this.marxImmune = false; }
  ai() {
    this.vx = this.dir * this.speed; this.cd--;
    if (this.kind === 'torben') {
      if (this.cd <= 0 && this.onGround && this.distToPlayer() < 120) { this.drilling = 50; this.cd = irnd(200, 320); this.vx = 0; AudioSys.sfx('drill'); Game.speech(this, pick(['Da muss ich mal kurz bohren.', 'Kunde nicht angetroffen.', 'Das war so, als ich kam.', 'Ist gleich fertig. Ungefähr.']), 60, true); }
      if (this.drilling > 0) { this.drilling--; this.vx = 0; if (this.drilling % 6 === 0) spawnFx(this.cx + this.dir * 8, this.bottom, { col: pick(['#aaa', '#8b5a2b']), vy: -1.5, vx: rnd(-1, 1), life: 20 }); if (this.drilling === 1) { const tx = Math.floor((this.cx + this.dir * 12) / TILE), ty = Math.floor((this.bottom + 4) / TILE); this.room.drillTile(tx, ty); } }
    } else {
      if (this.cd <= 0 && this.distToPlayer() < 140) { this.cd = irnd(120, 200); this.facePlayer(); const k = new Kabelbinder(this.cx, this.y + 6, this.dir * 2.2); this.room.add(k); Game.speech(this, pick(['Kabelbinder!', 'Das halten wir mal fest.', 'Ich hab die Leiter dabei!']), 50, true); }
    }
  }
  sprite() { const w = Math.abs(this.vx) < 0.1 ? 1 : (this.anim % 20 < 10 ? 1 : 2); return this.kind + '_' + w; }
}
class Kabelbinder extends Entity {
  constructor(x, y, vx) { super(x - 4, y, 8, 3); this.vx = vx; this.noGravity = true; this.noTileCollision = true; this.life = 120; this.isProjectile = true; this.type = 'proj'; this.sprName = 'kabelbinder'; }
  update() { this.life--; if (this.life <= 0) this.dead = true; this.x += this.vx; this.y += Math.sin(this.life * 0.2) * 0.3; if (this.room.solidAtPx(this.cx, this.cy)) this.dead = true; const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.holf === 'gold' || p.spin > 0) this.dead = true; else if (p.hurt(this)) this.dead = true; } }
  draw(g) { Sprites.draw(g, 'kabelbinder', this.x, this.y); }
}
/* --- Router-Turm: fires homing pings, invulnerable --- */
class RouterTurm extends Enemy {
  constructor(x, y) { super(x, y, 16, 16); this.stompable = false; this.noGravity = true; this.cd = 60; this.name = 'Router-Turm'; this.noBall = true; this.spinKillable = false; }
  ai() { this.vx = 0; this.cd--; if (this.cd <= 0 && this.distToPlayer() < 150) { this.cd = irnd(110, 170); const p = new Ping(this.cx, this.y + 8); this.room.add(p); AudioSys.sfx('ping'); } }
  onTouch(p) { p.hurt(this); }
  hitByThrown() { }
  sprite() { return 'router'; }
  draw(g) { super.draw(g); if (this.cd < 30 && this.anim % 6 < 3) { g.fillStyle = '#e03a3a'; g.fillRect(this.x + 6, this.y + 6, 2, 2); } }
}
class Ping extends Entity {
  constructor(x, y) { super(x - 4, y - 4, 8, 8); this.noGravity = true; this.noTileCollision = true; this.life = 260; this.isProjectile = true; this.type = 'proj'; this.sprName = 'ping'; this.vx = 0; this.vy = 0; }
  update() { this.anim++; this.life--; if (this.life <= 0) this.dead = true; const p = this.player; const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; this.vx = lerp(this.vx, dx / d * 1.3, 0.03); this.vy = lerp(this.vy, dy / d * 1.3, 0.03); this.x += this.vx; this.y += this.vy; const t = this.room.tileAtPx(this.cx, this.cy); if (t === 'f') { this.dead = true; burst(this.cx, this.cy, '#7fd6ff', 5, 1); popup(this.cx, this.y - 6, 'Firewall!', '#e03a3a'); } else if (this.room.solidAtPx(this.cx, this.cy) && this.anim > 20) this.dead = true; if (p && !p.dying && rectHit(this, p)) { if (p.holf === 'gold' || p.spin > 0) this.dead = true; else if (p.hurt(this)) this.dead = true; } }
  draw(g) { const s = 1 + Math.sin(this.anim * 0.3) * 0.2; g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.scale(s, s); Sprites.draw(g, 'ping', -4, -4); g.restore(); if (this.anim % 10 < 5) Font.draw(g, 'ping', this.cx, this.y - 8, '#7fd6ff', { align: 'center' }); }
}
/* --- Aktenordner (Thwomp) --- */
class Aktenordner extends Enemy {
  constructor(x, y) { super(x, y, 16, 24); this.noGravity = true; this.startY = y; this.state = 'wait'; this.stompable = false; this.name = 'Aktenordner'; this.noBall = true; this.spinKillable = false; this.ignoreOneWay = true; }
  ai() {
    const p = this.player;
    if (this.state === 'wait') { this.vy = 0; if (Math.abs(p.cx - this.cx) < 28 && p.y > this.y) { this.state = 'fall'; this.vy = 0.5; } }
    else if (this.state === 'fall') { this.vy = Math.min(this.vy + 0.5, 7); if (this.onGround || this.solidAt(this.cx, this.bottom + 1)) { this.state = 'rest'; this.restT = 40; this.vy = 0; shake(4); AudioSys.sfx('stamp'); dust(this.cx, this.bottom, 6); popup(this.cx, this.y - 6, 'ABGELEHNT', '#e03a3a'); for (const e of this.room.ents) if (e !== this && e.isEnemy && !e.dead && rectHit({ x: this.x - 4, y: this.bottom - 4, w: this.w + 8, h: 8 }, e)) e.kill('thrown'); } }
    else if (this.state === 'rest') { this.restT--; if (this.restT <= 0) this.state = 'rise'; }
    else if (this.state === 'rise') { this.vy = -0.8; if (this.y <= this.startY) { this.y = this.startY; this.state = 'wait'; this.vy = 0; } }
  }
  applyPhysics() { this.y += this.vy; if (this.vy > 0) { const ty = Math.floor((this.bottom) / TILE); if (this.room.solidAt(Math.floor((this.x + 2) / TILE), ty, this) === 1 || this.room.solidAt(Math.floor((this.right - 2) / TILE), ty, this) === 1) { this.y = ty * TILE - this.h; this.onGround = true; } else this.onGround = false; } }
  onTouch(p) { if (this.state === 'fall') p.hurt(this); else if (p.bottom <= this.y + 4 && p.vy >= 0) { p.y = this.y - p.h; p.vy = 0; p.onGround = true; } else p.hurt(this); }
  hitByThrown() { }
  sprite() { return 'ordner'; }
  draw(g) { Sprites.draw(g, 'ordner', this.x, this.y); if (this.state === 'wait' && Math.abs(this.player.cx - this.cx) < 40) { g.fillStyle = '#e03a3a'; g.fillRect(this.x + 4, this.y + 3, 2, 2); g.fillRect(this.x + 10, this.y + 3, 2, 2); } }
}
/* --- Formular: flying paper, attaches debuff --- */
class Formular extends Enemy {
  constructor(x, y) { super(x, y, 12, 12); this.noGravity = true; this.noTileCollision = true; this.baseY = y; this.stompable = true; this.name = 'Formular'; this.color = '#f3e7c8'; this.speed = 0.6; this.isProjectile = true; }
  ai() { const p = this.player; if (this.distToPlayer() < 120) { this.vx = lerp(this.vx, sign(p.cx - this.cx) * 0.8, 0.03); this.vy = lerp(this.vy, sign(p.cy - this.cy) * 0.5, 0.03); } else { this.vx = Math.sin(this.anim * 0.05) * 0.5; this.vy = Math.cos(this.anim * 0.08) * 0.4; } this.x += this.vx; this.y += this.vy; }
  applyPhysics() { }
  onTouch(p) { if (p.hasPerk('papierkram')) { this.kill('thrown'); p.sneeze = 20; AudioSys.sfx('sneeze'); popup(p.cx, p.y - 10, 'HATSCHI!', '#fff'); for (const e of this.room.ents) if (e.isEnemy && !e.dead && e !== this && Math.abs(e.cx - p.cx) < 40 && sign(e.cx - p.cx) === p.dir) e.kill('thrown'); return; } if (p.formular <= 0 && p.form !== 'marx') { p.formular = 600; p.formularMash = 0; AudioSys.sfx('paper'); popup(p.cx, p.y - 10, 'Formular G-4/Fiber klebt!', '#f3e7c8'); Chat.react('formular'); } this.dead = true; }
  sprite() { return 'formular'; }
  draw(g) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(Math.sin(this.anim * 0.1) * 0.3); Sprites.draw(g, 'formular', -6, -6); g.restore(); }
}
/* --- Sachbearbeiter: slow, relentless, ignores Marx --- */
class Sachbearbeiter extends Enemy {
  constructor(x, y) { super(x, y, 12, 20); this.speed = 0.3; this.name = 'Sachbearbeiter'; this.marxImmune = true; this.color = '#8a8a96'; this.turnAtEdge = true; this.talk = irnd(60, 200); }
  ai() { if (this.distToPlayer() < 100 && this.player.form !== 'marx') this.facePlayer(); this.vx = this.dir * this.speed; this.talk--; if (this.talk <= 0) { this.talk = irnd(200, 400); if (this.distToPlayer() < 100) Game.speech(this, pick(['Nicht zuständig.', 'Zimmer 4B. Dann 7A.', 'Haben Sie einen Termin?', 'Das Formular fehlt.', 'Mittagspause.']), 60, true); } }
  onStomp(p) { p.stomped(this); popup(this.cx, this.y - 14, 'ERLEDIGT', '#7bd23a'); AudioSys.sfx('stamp'); this.kill('stomp'); }
  sprite() { return this.anim % 30 < 15 ? 'sach_1' : 'sach_2'; }
}
/* --- Haider: throws eggs from fence --- */
class Haider extends Enemy {
  constructor(x, y) { super(x, y, 10, 12); this.cd = irnd(60, 150); this.name = 'Haider'; this.color = '#c8a04a'; this.noGravity = false; }
  ai() { this.vx = 0; this.facePlayer(); this.cd--; if (this.cd <= 0 && this.distToPlayer() < 130) { this.cd = irnd(90, 170); const e = new Egg(this.cx, this.y, sign(this.player.cx - this.cx) * rnd(1, 1.8), -3.5); this.room.add(e); Game.speech(this, pick(['Meddl!', 'Hahaha!', 'Buuuh!']), 40, true); } }
  sprite() { return 'haider'; }
}
class Egg extends Wurst { constructor(x, y, vx, vy) { super(x, y, vx, vy); this.w = 6; this.h = 6; this.sprName = 'egg'; } draw(g) { Sprites.draw(g, 'egg', this.x, this.y); } update() { super.update(); if (this.dead && !this.spiky) { } } }
/* --- Wiener Würstchen-Grantler: hops --- */
class Wiener extends Enemy {
  constructor(x, y) { super(x, y, 12, 16); this.isMeat = true; this.name = 'Würstchen-Grantler'; this.color = '#ff8a5c'; this.hopCd = irnd(30, 90); }
  ai() { if (this.onGround) { this.vx = 0; this.hopCd--; if (this.hopCd <= 0) { this.hopCd = irnd(40, 80); this.facePlayer(); this.vy = -3.6; this.vx = this.dir * 1.4; if (Math.random() < 0.3) Game.speech(this, pick(['Oida.', 'Geh bitte.', 'Des is a Wahnsinn.', 'Schleich di!', 'Servas.']), 45, true); } } }
  afterPhysics() { if (this.hitWall) this.dir = -this.dir; }
  tofuify() { this.dead = true; this.room.add(new Tofu(this.x, this.bottom - 8)); burst(this.cx, this.cy, ['#fff', '#7bd23a'], 8, 1.5); }
  sprite() { return this.onGround ? 'wiener_1' : 'wiener_2'; }
}
/* --- Fiaker: horizontal rush --- */
class Fiaker extends Enemy {
  constructor(x, y, dir) { super(x, y, 30, 16); this.noGravity = true; this.noTileCollision = true; this.dir = dir || -1; this.vx = this.dir * 2.6; this.name = 'Fiaker'; this.hitbox = null; this.color = '#5b4636'; }
  ai() { this.x += this.vx; if (this.anim % 4 === 0) dust(this.cx - this.dir * 12, this.bottom, 1); if (this.x < this.room.camMinX - 80 || this.x > this.room.w * TILE + 80) this.dead = true; }
  applyPhysics() { }
  onStomp(p) { p.stomped(this); this.kill('stomp'); popup(this.cx, this.y - 10, 'Kutscher weg!', '#fff'); }
  sprite() { return 'fiaker'; }
  draw(g) { Sprites.draw(g, 'fiaker', this.x - 1, this.y, this.dir > 0); }
}
/* --- Sisi-Geist: sinus float, only visible in light --- */
class Sisi extends Enemy {
  constructor(x, y) { super(x, y, 12, 14); this.noGravity = true; this.noTileCollision = true; this.baseY = y; this.name = 'Sisi-Geist'; this.stompable = false; this.spinKillable = true; this.color = '#d4d4dc'; }
  ai() { this.vx = this.dir * 0.7; this.x += this.vx; this.y = this.baseY + Math.sin(this.anim * 0.06) * 14; if (this.x < this.room.camMinX + 4 || this.x > this.room.w * TILE - 16 || this.room.solidAtPx(this.cx + this.dir * 8, this.cy)) this.dir = -this.dir; }
  applyPhysics() { }
  draw(g) { g.globalAlpha = 0.5 + Math.sin(this.anim * 0.1) * 0.3; Sprites.draw(g, 'sisi', this.x - 2, this.y - 1, this.dir > 0); g.globalAlpha = 1; }
}
/* --- Warteschleifen-Geist (Boo): approaches only when player looks away --- */
class HoldGhost extends Enemy {
  constructor(x, y) { super(x, y, 14, 16); this.noGravity = true; this.noTileCollision = true; this.stompable = false; this.name = 'Warteschleifen-Geist'; this.noBall = true; this.spinKillable = false; this.hum = 0; }
  ai() { const p = this.player; const looking = sign(p.cx - this.cx) === -p.dir; this.hiding = looking; if (!looking) { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; this.x += dx / d * 0.9; this.y += dy / d * 0.9; this.hum++; if (this.hum % 90 === 0 && d < 100) Game.speech(this, pick(['Bitte bleiben Sie dran...', 'Ihr Anruf ist uns wichtig.', 'Wartezeit: 4 Stunden.']), 50, true); } }
  applyPhysics() { }
  onTouch(p) { if (!this.hiding) p.hurt(this); }
  hitByThrown() { }
  draw(g) { if (this.hiding) { g.globalAlpha = 0.5; Sprites.draw(g, 'holdghost', this.x - 1, this.y, this.dir > 0); g.globalAlpha = 1; g.fillStyle = '#000'; } else { Sprites.draw(g, 'holdghost', this.x - 1, this.y, this.player.cx < this.cx); if (this.anim % 20 < 10) Font.draw(g, '♥', this.cx, this.y - 8, '#e03a3a', { align: 'center' }); } }
}
/* --- Biene & Bienenstock --- */
class Biene extends Enemy {
  constructor(x, y) { super(x, y, 8, 6); this.noGravity = true; this.noTileCollision = true; this.name = 'Biene'; this.color = '#f4d03f'; this.t = irnd(0, 100); this.ox = x; this.oy = y; }
  ai() { this.t++; const p = this.player; if (this.distToPlayer() < 90) { this.vx = lerp(this.vx, sign(p.cx - this.cx) * 1.1, 0.04); this.vy = lerp(this.vy, sign(p.cy - this.cy) * 0.8, 0.04); } else { this.vx = Math.cos(this.t * 0.07) * 0.8; this.vy = Math.sin(this.t * 0.15) * 0.6; } this.x += this.vx; this.y += this.vy; if (this.t % 60 === 0 && this.distToPlayer() < 60) AudioSys.sfx('bee'); this.dir = sign(this.vx) || this.dir; }
  applyPhysics() { }
  sprite() { return 'bee'; }
  draw(g) { Sprites.draw(g, 'bee', this.x, this.y + (this.anim % 4 < 2 ? 0 : 1), this.dir > 0); }
}
class Bienenstock extends Enemy {
  constructor(x, y) { super(x, y, 16, 13); this.noGravity = true; this.stompable = false; this.cd = 100; this.spawned = 0; this.name = 'Bienenstock'; this.hp = 3; this.noBall = false; }
  ai() { this.cd--; if (this.cd <= 0 && this.distToPlayer() < 110 && this.spawned < 3) { this.cd = 150; this.spawned++; const b = new Biene(this.cx, this.bottom); b.hive = this; this.room.add(b); } }
  applyPhysics() { }
  onTouch(p) { p.hurt(this); }
  onBall() { this.hp--; this.hitT = 10; if (this.hp <= 0) this.kill('ball'); }
  hitByThrown() { this.kill('thrown'); }
  kill(how) { super.kill(how); this.room.ents.forEach(e => { if (e.hive === this) e.kill('thrown'); }); burst(this.cx, this.cy, '#ffb347', 10, 2); Game.addBits(5); }
  sprite() { return 'hive'; }
}
/* --- GEMA-Gnom: mutes music --- */
class Gnom extends Enemy {
  constructor(x, y) { super(x, y, 12, 16); this.speed = 0.6; this.name = 'GEMA-Gnom'; this.turnAtEdge = true; this.color = '#e03a3a'; }
  ai() { this.vx = this.dir * this.speed; if (!this.muted && this.distToPlayer() < 70) { this.muted = true; Game.gemaMute(this); Game.speech(this, 'Dieses Lied ist in deinem Land nicht verfügbar.', 90, true); } }
  kill(how) { super.kill(how); if (this.muted) Game.gemaUnmute(this); popup(this.cx, this.y - 12, 'Musik ist zurück!', '#7bd23a'); }
  sprite() { return 'gnom'; }
}
/* --- Abo-Dieb: steals a sub --- */
class AboDieb extends Enemy {
  constructor(x, y) { super(x, y, 12, 20); this.speed = 0.9; this.name = 'Abo-Dieb'; this.turnAtEdge = true; this.has = null; this.color = '#202028'; }
  ai() { if (this.has) { this.vx = this.dir * 2.2; if (this.anim % 30 === 0) popup(this.cx, this.y - 8, 'hehe', '#fff'); if (this.x < this.room.camMinX - 40 || this.x > this.room.w * TILE + 40) { this.dead = true; Game.stolenSub(this.has, true); } } else { if (this.distToPlayer() < 90) this.facePlayer(); this.vx = this.dir * this.speed; } }
  afterPhysics() { if (this.hitWall) this.dir = -this.dir; if (this.turnAtEdge && this.onGround && !this.has) { const ax = this.dir > 0 ? this.right + 2 : this.x - 2; if (!this.room.solidAtPx(ax, this.bottom + 4) && !this.room.solidAtPx(ax, this.bottom + 12)) this.dir = -this.dir; } }
  onTouch(p) { if (!this.has && Game.levelSubs.length) { this.has = Game.levelSubs.pop(); Game.stolenSub(this.has, false); this.dir = p.cx < this.cx ? 1 : -1; this.vy = -3; AudioSys.sfx('steal'); popup(this.cx, this.y - 12, 'Abo geklaut!', '#e03a3a'); Chat.react('steal'); } else p.hurt(this); }
  kill(how) { super.kill(how); if (this.has) { const s = new Sub(this.cx - 6, this.y, this.has); s.vy = -3; s.fly = true; this.room.add(s); popup(this.cx, this.y - 12, 'Abo zurück!', '#7bd23a'); this.has = null; } }
  sprite() { return this.anim % 12 < 6 ? 'dieb' : 'dieb_2'; }
}
/* --- Hotline-Bot: rolling phone --- */
class HotlineBot extends Enemy {
  constructor(x, y) { super(x, y, 14, 14); this.speed = 0.8; this.name = 'Hotline-Bot'; this.color = '#e03a3a'; this.turnAtEdge = false; this.talk = irnd(50, 150); }
  ai() { this.vx = this.dir * this.speed; this.talk--; if (this.talk <= 0 && this.distToPlayer() < 100) { this.talk = irnd(150, 300); Game.speech(this, pick(['Für Deutsch drücken Sie die 1.', 'Ihr Anliegen wurde nicht erkannt.', 'Bitte halten Sie Ihre Kundennummer bereit.', 'Sie sind Anrufer Nummer 47.']), 60, true); AudioSys.sfx('dtmf'); } }
  onStomp(p) { p.stomped(this); popup(this.cx, this.y - 14, 'Anruf beendet.', '#fff'); Game.hotlineCombo(); this.kill('stomp'); }
  sprite() { return this.anim % 16 < 8 ? 'hotline_1' : 'hotline_2'; }
}
/* --- Tracking-Cookie --- */
class Cookie extends Enemy {
  constructor(x, y) { super(x, y, 12, 12); this.speed = 0.5; this.name = 'Tracking-Cookie'; this.color = '#8b5a2b'; this.gravity = 0.2; }
  ai() { if (this.distToPlayer() < 140) this.facePlayer(); this.vx = this.dir * this.speed * 1.4; if (this.onGround && this.hitWall) this.vy = -3; if (this.onGround && this.player.y < this.y - 20 && Math.random() < 0.02) this.vy = -3.8; }
  afterPhysics() { }
  onStomp(p) { p.stomped(this); popup(this.cx, this.y - 12, 'Cookie abgelehnt', '#7bd23a'); AudioSys.sfx('cookie'); this.kill('stomp'); }
  sprite() { return 'cookie'; }
  draw(g) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(this.x * 0.15); Sprites.draw(g, 'cookie', -6, -6); g.restore(); }
}
/* --- Currywurst-Ratte --- */
class Ratte extends Enemy {
  constructor(x, y) { super(x, y, 14, 6); this.speed = 1.1; this.name = 'Currywurst-Ratte'; this.color = '#8a8a96'; this.isMeat = true; this.turnAtEdge = true; }
  ai() { this.vx = this.dir * this.speed; }
  tofuify() { this.dead = true; this.room.add(new Tofu(this.x, this.bottom - 8)); burst(this.cx, this.cy, ['#fff', '#7bd23a'], 6, 1); }
  sprite() { return 'ratte'; }
}
/* ============ Ausweich-Figuren (unbesiegbar) ============ */
class MarioBarth extends Enemy {
  constructor(x, y) { super(x, y, 12, 20); this.stompable = false; this.noBall = true; this.spinKillable = false; this.speed = 0.55; this.name = 'Mario Barth'; this.turnAtEdge = true; this.talk = 30; this.marxImmune = false; }
  ai() { if (this.distToPlayer() < 80 && this.player.stun <= 0) { this.facePlayer(); this.vx = this.dir * this.speed * 1.5; } else this.vx = this.dir * this.speed; this.talk--; if (this.talk <= 0) { this.talk = irnd(90, 160); if (this.distToPlayer() < 120) Game.speech(this, pick(['Kennste? Kennste?', 'Kennste den? KENNSTE?', 'Männer sind so, Frauen sind so, kennste?', 'Ich hab da nen Witz. Kennste?']), 60, true); } }
  onTouch(p) { if (p.stun > 0 || p.holf === 'gold' || p.inv > 0) { if (p.holf === 'gold') { this.vx = -this.dir * 3; this.dir = -this.dir; } return; } p.stun = 240; p.stunMash = 0; p.vx = 0; AudioSys.sfx('kennste'); Chat.react('kennste'); Game.viewers(-20); popup(p.cx, p.y - 20, 'Smalltalk-Falle!', '#ffd700'); this.freezeT = 260; this.vx = 0; }
  hitByThrown() { this.freezeT = 120; popup(this.cx, this.y - 10, 'Kennste? Aua.', '#fff'); }
  sprite() { return 'barth'; }
  draw(g) { super.draw(g); if (this.anim % 60 < 30 && this.freezeT <= 0) Font.draw(g, 'Kennste?', this.cx, this.y - 10, '#ffd700', { align: 'center', shadow: true }); }
}
class MerzJet extends Enemy {
  constructor(x, y) { super(x, y, 32, 12); this.noGravity = true; this.noTileCollision = true; this.stompable = false; this.noBall = true; this.spinKillable = false; this.noContact = true; this.vx = 1.2; this.name = 'Merz-Jet'; this.cd = 60; this.dir = 1; }
  ai() { this.x += this.vx; const p = this.player; if (this.x > this.room.w * TILE + 60) this.x = this.room.camMinX - 60; this.cd--; if (this.cd <= 0 && Math.abs(p.cx - this.cx) < 60) { this.cd = irnd(120, 200); const k = new Koffer(this.cx, this.bottom); this.room.add(k); Game.speech(this, pick(['Privatjet. Ganz normal.', 'Brandmauer? Welche Brandmauer?', 'Das zahlt der Mittelstand.']), 60, true); } }
  applyPhysics() { }
  hitByThrown() { }
  sprite() { return 'jet'; }
  draw(g) { Sprites.draw(g, 'jet', this.x, this.y, this.vx < 0); if (this.anim % 4 < 2) { g.fillStyle = '#ff8a5c'; g.fillRect(this.x - 4, this.y + 6, 4, 2); } }
}
class Koffer extends Entity {
  constructor(x, y) { super(x - 5, y, 10, 6); this.gravity = 0.15; this.isProjectile = true; this.type = 'proj'; this.sprName = 'koffer'; this.life = 300; }
  update() { this.life--; if (this.life <= 0) this.dead = true; this.applyPhysics({ noSolids: true }); const t = this.room.tileAtPx(this.cx, this.bottom + 1); if (this.onGround || this.hitWall) { this.dead = true; if (t === 'f' || this.groundTile === 'f') { popup(this.cx, this.y - 8, 'Brandmauer hält!', '#7fd6ff'); burst(this.cx, this.cy, '#5b4636', 6, 1); } else { for (let i = 0; i < 3; i++) { const f = new Formular(this.cx + rnd(-10, 10), this.y - 6); this.room.add(f); } burst(this.cx, this.cy, '#f3e7c8', 8, 2); popup(this.cx, this.y - 8, 'Formulare!', '#f3e7c8'); } } const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.holf === 'gold') this.dead = true; else if (p.hurt(this)) this.dead = true; } }
  draw(g) { Sprites.draw(g, 'koffer', this.x, this.y); }
}
class Zollschranke extends Entity {
  constructor(x, y) { super(x, y, 16, 32); this.type = 'zoll'; this.used = false; this.solidToPlayer = false; }
  update() { this.anim++; const p = this.player; if (!this.used && p && !p.dying && rectHit(this, p)) { this.used = true; const tax = Math.floor(Game.bits * 0.25); if (tax > 0) { Game.addBits(-tax, true); popup(this.cx, this.y - 12, '-' + tax + ' Bits ZOLL! Tremendous!', '#ffd700'); Chat.react('zoll'); AudioSys.sfx('hurt'); burst(this.cx, this.cy, '#ffd700', 10, 2); } else popup(this.cx, this.y - 12, 'Zoll: nichts zu holen. SAD!', '#ffd700'); } }
  draw(g) { g.fillStyle = '#ffd700'; g.fillRect(this.x + 6, this.y + 12, 4, this.h - 12); Sprites.draw(g, 'zoll', this.x, this.y - 2); if (!this.used && this.anim % 40 < 20) Font.draw(g, 'ZOLL 25%', this.cx, this.y - 12, '#ffd700', { align: 'center', shadow: true }); }
}
