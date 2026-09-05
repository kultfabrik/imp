/* =====================================================================
   10 bosses: Torben&Kevin, Drachenlord, Kabelsalat-König, Baba, Ober,
              Algorithmus, Volker, NIXI 3000
   ===================================================================== */
class Boss extends Enemy {
  constructor(x, y, w, h, hp, name) { super(x, y, w, h); this.boss = true; this.hp = hp; this.maxHp = hp; this.name = name; this.stompable = false; this.noBall = true; this.spinKillable = false; this.phase = 1; this.t = 0; this.state = 'intro'; this.defeated = false; this.introT = 90; }
  damage(n = 1, how) { if (this.hitT > 0 || this.defeated || this.state === 'intro') return false; this.hp -= n; this.hitT = 45; AudioSys.sfx('bosshit'); shake(5); burst(this.cx, this.cy, ['#fff', '#e03a3a'], 12, 2.5); Game.viewers(50); Game.hypeAdd(10); Chat.react('bosshit'); if (this.hp <= 0) { this.defeat(); } else this.onDamaged(); return true; }
  onDamaged() { }
  defeat() { this.defeated = true; this.state = 'defeat'; this.t = 0; AudioSys.stop(); AudioSys.sfx('bossdie'); Game.viewers(300); Chat.react('bosskill'); Game.hypeAdd(30); }
  update() { this.anim++; this.t++; if (this.hitT > 0) this.hitT--; if (this.laugh > 0) { this.laugh--; } if (this.state === 'intro') { this.introT--; if (this.introT <= 0) { this.state = 'fight'; this.t = 0; } return; } if (this.state === 'defeat') { this.defeatUpdate(); return; } this.ai(); this.applyPhysics(); this.afterPhysics(); this.contact(); }
  defeatUpdate() { if (this.t % 10 === 0) burst(this.x + rnd(0, this.w), this.y + rnd(0, this.h), ['#fff', '#ffd700', '#e03a3a'], 6, 2); this.applyPhysics(); if (this.t === 120) Game.bossDefeated(this); }
  drawHp(g) { if (this.state === 'intro' || this.defeated) return; const x = Game.level.room.camX + VW / 2 - 50, y = Game.level.room.camY + VH - 14; g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, 102, 8); g.fillStyle = '#5a1a1a'; g.fillRect(x, y, 100, 6); g.fillStyle = this.hitT > 0 && this.anim % 4 < 2 ? '#fff' : '#e03a3a'; g.fillRect(x, y, 100 * this.hp / this.maxHp, 6); Font.draw(g, this.name, x + 50, y - 9, '#fff', { align: 'center', shadow: true }); }
}
/* ---------- Torben & Kevin (Level 2) ---------- */
class BossTechniker extends Boss {
  constructor(x, y, kind) { super(x, y, 12, 20, 2, kind === 'torben' ? 'Torben' : 'Kevin'); this.kind = kind; this.helmet = true; this.stompable = true; this.speed = 0.7; this.cd = 100; this.dir = -1; this.introT = 60; this.turnAtEdge = true; }
  ai() { this.vx = this.dir * this.speed; this.cd--; if (this.drilling > 0) { this.drilling--; this.vx = 0; if (this.drilling % 6 === 0) spawnFx(this.cx + this.dir * 8, this.bottom, { col: pick(['#aaa', '#8b5a2b']), vy: -1.5, vx: rnd(-1, 1), life: 20 }); if (this.drilling === 1) { const tx = Math.floor((this.cx + this.dir * 12) / TILE), ty = Math.floor((this.bottom + 4) / TILE); this.room.drillTile(tx, ty, true); } }
    else if (this.cd <= 0) { this.cd = irnd(90, 150); if (this.kind === 'torben') { this.drilling = 40; AudioSys.sfx('drill'); Game.speech(this, pick(['Da muss ich durch!', 'Kurz bohren.', 'Ups. Wasserrohr.']), 50, true); } else { this.facePlayer(); for (let i = -1; i <= 1; i++) { const k = new Kabelbinder(this.cx, this.y + 4 + i * 5, this.dir * (2 + Math.abs(i) * 0.4)); k.vy = i * 0.4; this.room.add(k); } Game.speech(this, pick(['Kabelbinder-Salve!', 'Halt still!', 'Leiter kommt!']), 50, true); } } }
  hitByThrown(o) { this.damage(1, 'thrown'); }
  onBall() { }
  onTouch(p) { p.hurt(this); }
  onDamaged() { this.vy = -3; this.dir = -this.dir; Game.speech(this, pick(['Aua! Arbeitsunfall!', 'Das melde ich!', 'Feierabend?']), 50, true); }
  bumpedFromBelow() { this.damage(1, 'bump'); }
  defeatUpdate() { this.vx = 0; this.applyPhysics(); if (this.t === 1) Game.speech(this, this.kind === 'torben' ? 'Kunde... angetroffen.' : 'Ich hol die Leiter...', 100); if (this.t === 110) { const other = this.room.ents.find(e => e instanceof BossTechniker && e !== this && !e.dead); if (!other || other.defeated) Game.bossDefeated(this); this.dead = true; } }
  sprite() { const w = Math.abs(this.vx) < 0.1 ? 1 : (this.anim % 20 < 10 ? 1 : 2); return this.kind + '_' + w; }
  drawHp(g) { if (this.state === 'intro' || this.defeated) return; const other = this.room.ents.find(e => e instanceof BossTechniker && e !== this); const total = this.hp + (other && !other.defeated ? other.hp : 0); const x = Game.level.room.camX + VW / 2 - 50, y = Game.level.room.camY + VH - 14; if (this.kind !== 'torben' && other && !other.dead) return; g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, 102, 8); g.fillStyle = '#5a1a1a'; g.fillRect(x, y, 100, 6); g.fillStyle = '#e03a3a'; g.fillRect(x, y, 100 * total / 4, 6); Font.draw(g, 'Torben & Kevin', x + 50, y - 9, '#fff', { align: 'center', shadow: true }); }
}
/* ---------- Drachenlord (Level 4) ---------- */
class Drachenlord extends Boss {
  constructor(x, y) { super(x, y, 20, 30, 3, 'Drachenlord'); this.dir = -1; this.introT = 120; this.rolling = false; this.dizzy = 0; this.rollSpeed = 2.2; this.jumpedThisRoll = false; this.arena = null; }
  ai() {
    const p = this.player;
    if (this.dizzy > 0) { this.dizzy--; this.vx = 0; this.stompable = true; this.helmet = false; if (this.dizzy % 15 === 0) spawnFx(this.cx + rnd(-8, 8), this.y - 6, { txt: '*', col: '#ffd700', vy: -0.5, gravity: 0, life: 20 }); if (this.dizzy === 0) { this.state = 'fight'; this.t = 0; this.cd = 60; } return; }
    this.stompable = false;
    if (this.rolling) {
      this.vx = this.dir * this.rollSpeed * (this.phase >= 2 ? 1.3 : 1); this.ignoreOneWay = true;
      if (this.anim % 5 === 0) { dust(this.cx - this.dir * 8, this.bottom, 1); if (this.anim % 15 === 0) shake(1); }
      if (this.phase >= 2 && !this.jumpedThisRoll && this.onGround && Math.abs(p.cx - this.cx) < 40 && Math.abs(p.cx - this.cx) > 24) { this.vy = -4.2; this.jumpedThisRoll = true; }
      if (this.hitWall) { this.rolling = false; this.dizzy = 200; this.w = 20; this.h = 30; this.y -= 6; AudioSys.sfx('break'); shake(8); burst(this.cx, this.cy, ['#c8a04a', '#8b5a2b'], 10, 2); Game.speech(this, pick(['Aua! Mei Kopf!', 'Des war die Wand!', 'Etzala...']), 80, true); this.rollsLeft--; if (this.rollsLeft > 0 && this.phase >= 3) { this.dizzy = 30; } }
      return;
    }
    // standing: face player, wait, then roll
    this.cd = (this.cd || 60) - 1; this.vx = 0; this.facePlayer();
    if (this.cd === 40) { Game.speech(this, pick(['MEDDL LOIDE!', 'Des is mei Kabel!', 'Ich roll dich platt!', 'Meddl, du Haider!']), 60, true); AudioSys.sfx('meddl'); }
    if (this.cd <= 0) { this.rolling = true; this.jumpedThisRoll = false; this.rollsLeft = this.phase >= 3 ? 2 : 1; this.w = 22; this.h = 22; this.y += 8; AudioSys.sfx('roll'); this.cd = 60; }
  }
  onStomp(p) { if (this.dizzy > 0) { p.stomped(this); this.dizzy = 0; this.damage(1, 'stomp'); this.phase = 4 - this.hp; this.cd = 90; Game.speech(this, ['', 'Des tut weh!', 'Du Haider!', 'Etzala reicht\'s!'][this.hp] || '', 60, true); } }
  onTouch(p) { if (this.dizzy > 0 && p.vy > 0 && p.bottom - this.y < 12) { this.onStomp(p); return; } p.hurt(this); }
  hitByThrown() { if (this.dizzy > 0) { this.dizzy = 0; this.damage(1, 'thrown'); this.phase = 4 - this.hp; } }
  onDamaged() { this.rollSpeed += 0.3; }
  contact() { if (this.dizzy > 0) { const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.vy > 0 && p.bottom - this.y < 12 + p.vy) this.onStomp(p); else if (!p.invincible) p.hurt(this); } return; } super.contact(); }
  defeatUpdate() { this.vx = 0; this.applyPhysics(); if (this.t === 1) { Game.speech(this, 'Etzala reicht\'s. Des Kabel geht in den Gully.', 150); Chat.say('MEDDL OFF'); } if (this.t % 12 === 0) burst(this.x + rnd(0, this.w), this.y + rnd(0, this.h), ['#c8a04a', '#fff'], 5, 1.5); if (this.t === 160) { Game.bossDefeated(this); this.dead = true; } }
  sprite() { if (this.rolling) return Math.floor(this.anim / 4) % 2 ? 'dl_ball1' : 'dl_ball2'; if (this.dizzy > 0) return 'dl_idle'; return this.anim % 30 < 15 || this.vx === 0 ? 'dl_idle' : 'dl_walk'; }
  draw(g) { const s = this.sprite(); if (this.rolling) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(this.x * 0.08 * this.dir); const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null; Sprites.draw(g, s, -12, -12, false, pal); g.restore(); } else { const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null; Sprites.draw(g, s, this.cx - 12, this.bottom - 32 + (this.dizzy > 0 ? 2 : 0), this.dir > 0, pal); if (this.dizzy > 0 && this.anim % 20 < 10) Font.draw(g, 'benommen!', this.cx, this.y - 12, '#ffd700', { align: 'center', shadow: true }); } if (this.state === 'intro' && this.introT < 100) { Font.draw(g, 'MEDDL LOIDE!', this.cx, this.y - 14 - Math.sin(this.anim * 0.3) * 2, '#ffd700', { align: 'center', shadow: true }); } }
}
/* ---------- Kabelsalat-König (Level 5, mini) ---------- */
class KabelKoenig extends Boss {
  constructor(x, y) { super(x, y, 48, 40, 3, 'Kabelsalat-König'); this.noGravity = true; this.noTileCollision = true; this.arms = [0, 1, 2, 3].map(i => ({ a: i * Math.PI / 2, len: 40 })); this.plugs = [0, 1, 2].map(i => ({ x: x + 4 + i * 18, y: y - 8, pulled: 0, done: false })); this.introT = 60; this.armSpeed = 0.02; }
  ai() { this.arms.forEach((a, i) => a.a += this.armSpeed * (i % 2 ? 1 : -1)); const p = this.player; if (p.invincible) return; for (const a of this.arms) for (let k = 2; k <= 4; k++) { const bx = this.cx + Math.cos(a.a) * k * 10, by = this.cy + Math.sin(a.a) * k * 10; if (rectHit({ x: bx - 4, y: by - 4, w: 8, h: 8 }, p)) { p.hurt(this); return; } }
    // plug pulling
    for (const pl of this.plugs) { if (pl.done) continue; if (rectHit({ x: pl.x - 2, y: pl.y - 6, w: 12, h: 14 }, p)) { if (Input.is('run')) { pl.pulled++; if (pl.pulled % 10 === 0) spawnFx(pl.x, pl.y - 4, { col: '#f4d03f', vy: -1, life: 15 }); if (pl.pulled >= 90) { pl.done = true; this.damage(1, 'plug'); this.armSpeed += 0.012; popup(pl.x, pl.y - 10, 'Stecker gezogen!', '#7bd23a'); } } else if (pl.pulled > 0) pl.pulled = Math.max(0, pl.pulled - 2); } else if (pl.pulled > 0) pl.pulled = Math.max(0, pl.pulled - 2); }
  }
  contact() { }
  applyPhysics() { this.y = this.startY || (this.startY = this.y); this.y += Math.sin(this.anim * 0.05) * 0.3; }
  draw(g) { for (const a of this.arms) for (let k = 1; k <= 4; k++) { const bx = this.cx + Math.cos(a.a) * k * 10, by = this.cy + Math.sin(a.a) * k * 10; g.fillStyle = k === 4 ? '#e03a3a' : '#f4d03f'; g.fillRect(bx - 3, by - 3, 6, 6); } g.fillStyle = '#c9a227'; g.beginPath(); g.ellipse(this.cx, this.cy, 24, 20, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f4d03f'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(this.cx + Math.cos(i) * 10, this.cy + Math.sin(i * 1.7) * 8, 8, 5, i, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#101014'; g.fillRect(this.cx - 10, this.cy - 6, 5, 5); g.fillRect(this.cx + 5, this.cy - 6, 5, 5); g.fillRect(this.cx - 6, this.cy + 4, 12, 3); for (const pl of this.plugs) { if (pl.done) continue; g.fillStyle = '#7fd6ff'; g.fillRect(pl.x, pl.y - Math.floor(pl.pulled / 10), 8, 8); g.fillStyle = '#2f6fc4'; g.fillRect(pl.x + 2, pl.y + 8 - Math.floor(pl.pulled / 10), 4, 4); if (pl.pulled > 0) { g.fillStyle = '#000'; g.fillRect(pl.x - 4, pl.y - 14, 16, 3); g.fillStyle = '#7bd23a'; g.fillRect(pl.x - 4, pl.y - 14, 16 * pl.pulled / 90, 3); } } if (this.state === 'fight' && this.anim % 60 < 30 && this.hp === 3) Font.draw(g, 'Shift halten: Stecker ziehen', this.cx, this.y - 24, '#fff', { align: 'center', shadow: true }); }
  defeatUpdate() { if (this.t % 8 === 0) burst(this.x + rnd(0, this.w), this.y + rnd(0, this.h), ['#f4d03f', '#fff'], 6, 2); if (this.t === 100) { Game.bossDefeated(this); this.dead = true; } }
}
/* ---------- Baba der Bär (Level 6) ---------- */
class Baba extends Boss {
  constructor(x, y) { super(x, y, 26, 32, 3, 'Baba der Bär'); this.introT = 120; this.cd = 80; this.mode = 'throw'; this.sleep = 0; this.dir = -1; this.speed = 0.5; this.friendly = false; }
  ai() {
    const p = this.player;
    if (this.sleep > 0) { this.sleep--; this.vx = 0; if (this.sleep % 30 === 0) spawnFx(this.cx + 8, this.y - 8, { spr: 'zzz', vy: -0.5, gravity: 0, life: 40 }); if (this.sleep === 0) { this.cd = 60; } return; }
    this.facePlayer(); this.cd--;
    if (this.phase < 3 || this.hp === 1) this.vx = this.dir * this.speed * (this.hp === 1 ? 1.4 : 1);
    if (this.cd <= 0) {
      const r = Math.random();
      if (this.hp === 3 || r < 0.4) { // soletti fan
        this.cd = 130; Game.speech(this, pick(['Soletti-Salve!', 'Knabber knabber!', 'Baba!']), 50, true); this.throwT = 20;
        for (let i = 0; i < 3; i++) { const s = new SolettiProjectile(this.cx + this.dir * 12, this.y + 8, this.dir * (1.5 + i * 0.7), -3 - i * 0.6); this.room.add(s); }
      } else if (r < 0.7 && this.hp <= 2) { // honey slam
        this.cd = 150; Game.speech(this, 'HONIG!', 40, true); this.vy = -4; this.slam = true;
      } else if (this.hp <= 2) { // eat honey -> sleep
        this.cd = 200; Game.speech(this, pick(['Kurz Honig essen...', 'Mmmh... Agaven... nein, Honig.']), 60, true); this.sleepSoon = 40;
      } else this.cd = 60;
    }
    if (this.sleepSoon > 0) { this.sleepSoon--; this.vx = 0; if (this.sleepSoon === 0) { this.sleep = 240; Game.speech(this, 'zzz... Honig...', 80, true); } }
    if (this.slam && this.onGround && this.vy === 0 && this.t > 5) { this.slam = false; shake(6); AudioSys.sfx('honey'); for (let i = -2; i <= 2; i++) if (i) { const hp = new HoneyPuddle(this.cx + i * 28 - 8, this.bottom - 3); this.room.add(hp); } dust(this.cx, this.bottom, 8); }
    if (this.throwT > 0) this.throwT--;
  }
  contact() { const p = this.player; if (!p || p.dying || p.invincible) return; if (!rectHit(this, p)) return; if (this.sleep > 0 && p.vy > 0 && p.bottom - this.y < 14) { p.vy = -7; p.airJumps = 0; AudioSys.sfx('bounce'); this.sleep = 0; this.damage(1, 'belly'); this.phase = 4 - this.hp; Game.speech(this, pick(['AU! Mein Bauch!', 'Wer springt auf schlafende Bären?!', 'Uff!']), 60, true); return; } if (p.vy > 0 && p.bottom - this.y < 10) { p.vy = -4; popup(this.cx, this.y - 8, 'Plüsch! Kein Schaden.', '#f472b6'); AudioSys.sfx('bump'); return; } p.hurt(this); }
  hitByThrown(o) { if (o instanceof SolettiProjectile) { this.damage(1, 'soletti'); this.phase = 4 - this.hp; Game.speech(this, 'Mit meinen eigenen Soletti?!', 60, true); } }
  defeatUpdate() { this.vx = 0; this.applyPhysics(); if (this.t === 1) Game.speech(this, 'Du bist imp?! Ich schau deine Streams! Willst du Honig?', 180); if (this.t === 150) Game.speech(this.player, 'Vegan.', 60); if (this.t === 200) Game.speech(this, '...Agavendicksaft?', 80); if (this.t === 260) { const a = new PowerItem(this.cx + this.dir * 20, this.y, 'agave'); a.vy = -3; this.room.add(a); } if (this.t === 300) { Game.bossDefeated(this); this.friendly = true; this.state = 'friend'; } }
  update() { if (this.state === 'friend') { this.anim++; return; } super.update(); }
  sprite() { return this.sleep > 0 ? 'baba_sleep' : this.throwT > 0 ? 'baba_throw' : 'baba_idle'; }
  draw(g) { const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null; Sprites.draw(g, this.sprite(), this.cx - 16, this.bottom - 32, this.dir > 0, pal); if (this.sleep > 0 && this.anim % 30 < 15) Font.draw(g, 'schläft! Bauch = Trampolin', this.cx, this.y - 12, '#fff', { align: 'center', shadow: true }); if (this.state === 'intro' && this.introT < 90) Font.draw(g, 'BABA!', this.cx, this.y - 10, '#f472b6', { align: 'center', shadow: true }); if (this.state === 'friend') Sprites.draw(g, 'baba_pot', this.x - 12, this.bottom - 7); }
}
class SolettiProjectile extends Entity {
  constructor(x, y, vx, vy) { super(x, y, 16, 3); this.vx = vx; this.vy = vy; this.gravity = 0.15; this.isProjectile = true; this.type = 'proj'; this.sprName = 'soletti'; this.stuck = false; this.life = 900; this.throwable = false; }
  update() { this.anim++; this.life--; if (this.life <= 0) this.dead = true; if (this.carried) return; if (this.stuck) { if (this.thrown > 0) { this.thrown--; this.applyPhysics({ noSolids: true }); for (const e of this.room.ents) if ((e.isEnemy || e.boss) && !e.dead && rectHit(this, e)) { e.hitByThrown(this); this.dead = true; break; } if (this.hitWall) this.dead = true; } return; } this.applyPhysics({ noSolids: true }); if (this.onGround || this.hitWall) { this.stuck = true; this.throwable = true; this.solid = true; this.vx = 0; this.vy = 0; if (this.hitWall) { this.y = Math.floor(this.y / 8) * 8; } this.room.solids.push(this); } const p = this.player; if (p && !p.dying && rectHit(this, p) && !this.stuck) { if (!p.hurt(this)) { } } }
  onPickup() { const i = this.room.solids.indexOf(this); if (i >= 0) this.room.solids.splice(i, 1); this.solid = false; }
  draw(g) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); if (!this.stuck && !this.carried) g.rotate(this.anim * 0.2); Sprites.draw(g, 'soletti', -8, -1); g.restore(); if (this.stuck && !this.carried && this.anim % 40 < 20 && this.distToPlayer() < 30) Font.draw(g, 'Plattform / Shift: werfen', this.cx, this.y - 9, '#fff', { align: 'center', shadow: true }); }
}
class HoneyPuddle extends Entity {
  constructor(x, y) { super(x, y, 16, 3); this.type = 'honey'; this.life = 500; this.noGravity = true; this.noTileCollision = true; }
  update() { this.life--; if (this.life <= 0) this.dead = true; const p = this.player; if (p && rectHit({ x: this.x, y: this.y - 2, w: this.w, h: 5 }, p) && p.onGround) { p.vx *= 0.5; if (this.life % 20 === 0) spawnFx(p.cx, p.bottom, { col: '#ffb347', life: 15, gravity: 0.05 }); } }
  draw(g) { g.globalAlpha = this.life < 60 ? this.life / 60 : 1; Sprites.draw(g, 'honey_puddle', this.x, this.y); g.globalAlpha = 1; }
}
/* ---------- Der Herr Ober (Level 7, mini, unbesiegbar) ---------- */
class Ober extends Boss {
  constructor(x, y, tisch) { super(x, y, 12, 20, 99, 'Der Herr Ober'); this.tisch = tisch; this.cd = 60; this.speed = 0.6; this.introT = 90; this.turnAtEdge = true; tisch.onFull = () => this.leave(); }
  ai() { this.facePlayer(); this.vx = this.dir * this.speed * (this.distToPlayer() < 40 ? -1 : 1); this.cd--; if (this.cd <= 0) { this.cd = irnd(80, 130); if (Math.random() < 0.6) { const t = new Teller(this.cx, this.y + 4, this.dir); this.room.add(t); Game.speech(this, pick(['Ham\'S reserviert?', 'Dann ham\'S nicht reserviert.', 'Wir hätten da nix frei.', 'A Melange? Na.']), 50, true); } else { const t = new Torte(this.cx, this.y, this.dir * 1.5); this.room.add(t); Game.speech(this, 'Sachertorte! Achtung, heiß. Also kalt.', 50, true); } } }
  hitByThrown() { Game.speech(this, 'Des is a Frechheit!', 50, true); }
  damage() { Game.speech(this, 'Na. So ned.', 40, true); return false; }
  onTouch(p) { p.hurt(this); }
  leave() { this.state = 'defeat'; this.t = 0; }
  defeatUpdate() { if (this.t === 1) Game.speech(this, 'Passt scho. Baba.', 100); this.vx = 1.2; this.dir = 1; this.applyPhysics(); if (this.t === 110) { Game.bossDefeated(this); this.dead = true; } }
  sprite() { return 'ober'; }
  drawHp(g) { if (this.state !== 'fight') return; const x = Game.level.room.camX + VW / 2, y = Game.level.room.camY + VH - 14; Font.draw(g, 'Unbesiegbar. Trinkgeld: ' + this.tisch.coins + '/5', x, y - 4, '#ffd700', { align: 'center', shadow: true }); }
}
class Teller extends Entity {
  constructor(x, y, dir) { super(x, y, 8, 6); this.dir = dir; this.vx = dir * 2.2; this.t = 0; this.noGravity = true; this.noTileCollision = true; this.isProjectile = true; this.sprName = 'teller'; this.type = 'proj'; }
  update() { this.t++; this.x += this.vx; this.y += Math.sin(this.t * 0.15) * 1.2; if (this.t > 60) this.vx -= this.dir * 0.08; if (this.t > 200 || this.room.solidAtPx(this.cx, this.cy)) this.dead = true; const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.holf === 'gold' || p.spin > 0) this.dead = true; else if (p.hurt(this)) this.dead = true; } }
  draw(g) { Sprites.draw(g, 'teller', this.x, this.y); }
}
class Torte extends Wurst { constructor(x, y, vx) { super(x, y, vx, -3.5); this.w = 10; this.h = 6; this.sprName = 'torte'; } draw(g) { Sprites.draw(g, 'torte', this.x, this.y); } }
/* ---------- Der Algorithmus (Level 8) ---------- */
class Algorithmus extends Boss {
  constructor(x, y) { super(x, y, 48, 48, 3, 'Der Algorithmus'); this.noGravity = true; this.noTileCollision = true; this.introT = 120; this.layout = 0; this.cd = 120; this.vuln = 0; this.baseX = x; this.baseY = y; this.attackT = 0; this.bell = { x: x - 60, y: y + 40, hit: false }; }
  ai() {
    const p = this.player; this.x = this.baseX + Math.sin(this.anim * 0.02) * 30; this.y = this.baseY + Math.cos(this.anim * 0.03) * 10;
    this.cd--; if (this.vuln > 0) { this.vuln--; if (this.vuln === 0) Game.speech(this, 'Abonnieren nicht möglich. Weiter empfehlen.', 60, true); return; }
    if (this.cd <= 0) {
      this.cd = 160 - this.phase * 15; const r = Math.random();
      if (r < 0.3) { this.layout = (this.layout + 1) % 3; this.room.setBossLayout(this.layout); Game.speech(this, 'Empfehlungen aktualisiert.', 60, true); AudioSys.sfx('warp'); }
      else if (r < 0.55) { Game.speech(this, 'TRENDING!', 40, true); this.beam = 60; this.beamY = p.cy; AudioSys.sfx('whoosh'); }
      else if (r < 0.8) { Game.speech(this, 'Das könnte dir gefallen:', 40, true); for (let i = 0; i < 4; i++) { const c = new ClickbaitDrop(this.room.camMinX + 30 + i * 70 + rnd(-10, 10), this.room.camY - 10); this.room.add(c); } }
      else { Game.speech(this, 'COPYRIGHT STRIKE!', 40, true); this.strike = { x: p.cx, t: 60 }; }
      if (Math.random() < 0.5 && !this.vuln) { this.vulnSoon = 40; }
    }
    if (this.vulnSoon > 0) { this.vulnSoon--; if (this.vulnSoon === 0) { this.vuln = 150; Game.speech(this, 'ABONNIEREN?', 60, true); AudioSys.sfx('bell'); } }
    if (this.beam > 0) { this.beam--; if (this.beam < 40 && !p.invincible && Math.abs(p.cy - this.beamY) < 8) p.hurt(this); }
    if (this.strike) { this.strike.t--; if (this.strike.t < 20 && !p.invincible && Math.abs(p.cx - this.strike.x) < 8) p.hurt(this); if (this.strike.t <= 0) this.strike = null; }
  }
  contact() { const p = this.player; if (!p || p.dying) return; const btn = { x: this.x + 8, y: this.bottom + 4, w: 32, h: 10 }; if (this.vuln > 0 && p.vy > 0 && rectHit(btn, p)) { p.vy = -5; this.vuln = 0; this.damage(1, 'sub'); this.phase = 4 - this.hp; Game.speech(this, pick(['ABONNIERT?! NEIN!', 'Meine Metriken!', 'Watchtime sinkt!']), 60, true); return; } if (!p.invincible && rectHit(this, p) && this.vuln <= 0) p.hurt(this); }
  applyPhysics() { }
  draw(g) {
    const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null;
    Sprites.draw(g, this.vuln > 0 ? 'algo_closed' : 'algo', this.x, this.y, false, pal);
    // subscribe button
    const bx = this.x + 8, by = this.bottom + 4; g.fillStyle = this.vuln > 0 ? (this.anim % 10 < 5 ? '#ff3b3b' : '#e03a3a') : '#5a5a66'; g.fillRect(bx, by, 32, 10); Font.draw(g, this.vuln > 0 ? 'ABO!' : 'abo', bx + 16, by + 2, '#fff', { align: 'center' });
    if (this.vuln > 0 && this.anim % 20 < 10) Font.draw(g, 'DRAUFSPRINGEN!', this.cx, by + 12, '#fff', { align: 'center', shadow: true });
    if (this.beam > 0) { g.fillStyle = this.beam < 40 ? 'rgba(255,60,60,0.8)' : 'rgba(255,60,60,0.25)'; g.fillRect(this.room.camX, this.beamY - 4, VW, 8); }
    if (this.strike) { g.fillStyle = this.strike.t < 20 ? 'rgba(255,255,255,0.9)' : 'rgba(255,0,0,0.3)'; g.fillRect(this.strike.x - 4, this.room.camY, 8, VH); Font.draw(g, 'STRIKE', this.strike.x, this.room.camY + 20, '#fff', { align: 'center', shadow: true }); }
  }
  defeatUpdate() { if (this.t % 8 === 0) burst(this.x + rnd(0, this.w), this.y + rnd(0, this.h), ['#e03a3a', '#fff'], 6, 2); if (this.t === 1) Game.speech(this, 'Fehler 404: Empfehlung nicht gefunden. NIXNET... hat das Kabel... absichtlich...', 200); if (this.t === 220) { Game.bossDefeated(this); this.dead = true; } }
}
class ClickbaitDrop extends Entity {
  constructor(x, y) { super(x, y, 24, 8); this.gravity = 0.08; this.isProjectile = true; this.type = 'proj'; this.life = 300; this.txt = pick(['SCHOCK!', 'KRASS!', 'UNGLAUBLICH', 'TOP 10', '(GONE WRONG)']); }
  update() { this.life--; if (this.life <= 0) this.dead = true; this.applyPhysics({ noSolids: true }); if (this.onGround) { this.dead = true; burst(this.cx, this.cy, '#f4d03f', 6, 1); } const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.holf === 'gold' || p.spin > 0) this.dead = true; else if (p.hurt(this)) this.dead = true; } }
  draw(g) { g.fillStyle = '#f4d03f'; g.fillRect(this.x, this.y, this.w, this.h); Font.draw(g, this.txt, this.cx, this.y + 1, '#a01c1c', { align: 'center' }); }
}
/* ---------- Vertriebler Volker (Level 9, mini) ---------- */
class Volker extends Boss {
  constructor(x, y) { super(x, y, 12, 20, 3, 'Vertriebler Volker'); this.speed = 0.9; this.cd = 60; this.bow = 0; this.introT = 90; this.turnAtEdge = true; this.marxImmune = false; }
  ai() { if (this.bow > 0) { this.bow--; this.vx = 0; this.stompable = true; if (this.bow === 0) this.cd = 70; return; } this.stompable = false; this.facePlayer(); this.vx = this.dir * this.speed; this.cd--; if (this.cd <= 0) { this.cd = 999; Game.speech(this, pick(['Nur heute: 1000 Mbit für 99€!', 'Upgrade auf PREMIUM?', 'Ich mach Ihnen ein Angebot!', 'Vertrag über 24 Monate, minimum.']), 60, true); for (let i = 0; i < 2; i++) { const a = new Angebot(this.cx, this.y + 4, this.dir * (1.5 + i)); this.room.add(a); } this.bowSoon = 40; } if (this.bowSoon > 0) { this.bowSoon--; if (this.bowSoon === 0) { this.bow = 80; popup(this.cx, this.y - 12, '*verbeugt sich*', '#fff'); } } }
  onStomp(p) { if (this.bow > 0) { p.stomped(this); this.damage(1, 'stomp'); this.bow = 0; this.cd = 90; Game.speech(this, pick(['Dann halt 800 Mbit!', 'Ok, ohne Grundgebühr!', 'Dann halt der Grundtarif...']), 60, true); } }
  contact() { const p = this.player; if (!p || p.dying || p.invincible) return; if (!rectHit(this, p)) return; if (this.bow > 0 && p.vy > 0 && p.bottom - this.y < 12) { this.onStomp(p); return; } if (p.form === 'marx') { if (!this.greeted) { this.greeted = true; Game.speech(this, 'Herr Marx! Für Sie: Sozialtarif!', 60, true); } return; } p.hurt(this); }
  hitByThrown() { if (this.bow > 0) { this.damage(1, 'thrown'); this.bow = 0; } }
  defeatUpdate() { this.vx = 0; this.applyPhysics(); if (this.t === 1) Game.speech(this, 'Dann halt der Grundtarif... Der Serverkeller ist da hinten.', 150); if (this.t === 160) { Game.bossDefeated(this); this.dead = true; } }
  sprite() { return 'volker'; }
  draw(g) { const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null; if (this.bow > 0) { g.save(); g.translate(Math.round(this.cx), Math.round(this.bottom)); g.rotate(this.dir * 0.5); Sprites.draw(g, 'volker', -8, -24, this.dir > 0, pal); g.restore(); if (this.anim % 20 < 10) Font.draw(g, 'JETZT!', this.cx, this.y - 14, '#7bd23a', { align: 'center', shadow: true }); } else Sprites.draw(g, 'volker', this.cx - 8, this.bottom - 24, this.dir > 0, pal); }
}
class Angebot extends Entity {
  constructor(x, y, vx) { super(x, y, 12, 7); this.vx = vx; this.vy = -2; this.gravity = 0.12; this.isProjectile = true; this.type = 'proj'; this.sprName = 'angebot'; this.life = 200; }
  update() { this.life--; if (this.life <= 0) this.dead = true; this.applyPhysics({ noSolids: true }); if (this.onGround || this.hitWall) { this.dead = true; const f = new Formular(this.cx, this.y - 6); this.room.add(f); burst(this.cx, this.cy, '#f4d03f', 4, 1); } const p = this.player; if (p && !p.dying && rectHit(this, p)) { if (p.holf === 'gold' || p.spin > 0) this.dead = true; else if (p.hurt(this)) this.dead = true; } }
  draw(g) { Sprites.draw(g, 'angebot', this.x, this.y); }
}
/* ---------- NIXI 3000 – Die Warteschleife (Level 10, Endboss) ---------- */
class Nixi extends Boss {
  constructor(x, y) { super(x, y, 64, 64, 4, 'NIXI 3000'); this.noGravity = true; this.noTileCollision = true; this.introT = 150; this.baseY = y; this.cd = 100; this.wait = 240; this.buttons = []; this.target = null; this.correct = 0; this.phaseName = 'Bitte bleiben Sie dran'; this.stecker = null; }
  ai() {
    const p = this.player; this.y = this.baseY + Math.sin(this.anim * 0.03) * 6; this.wait += 1 / 60;
    if (this.hp === 4) { // phase 1: sound waves
      this.cd--; if (this.cd <= 0) { this.cd = 110; const w = new SoundWave(this.x - 10, this.bottom - 10, -1); this.room.add(w); if (Math.random() < 0.5) { const w2 = new SoundWave(this.x - 10, this.bottom - 10, -1); w2.delay = 40; this.room.add(w2); } Game.speech(this, pick(['♪ Bitte bleiben Sie dran ♪', 'Ihr Anruf ist uns wichtig.', 'Voraussichtliche Wartezeit: ' + Math.floor(this.wait) + ' Minuten']), 60, true); }
      if (!this.hotspotPhase && this.t > 60) { this.hotspotPhase = true; this.vuln = true; }
      // vulnerable: player must ground-pound/jump on the antenna top (the 'receiver') when it lowers
      if (this.t % 400 === 200) { this.lower = 180; Game.speech(this, 'Verbindung wird hergestellt...', 60, true); }
      if (this.lower > 0) { this.lower--; this.y += 20; if (this.lower === 0) { } }
    } else if (this.hp === 3) { // phase 2: press the number
      if (!this.buttons.length) { this.spawnButtons(); this.phaseName = 'Drücken Sie die ...'; }
      this.cd--; if (this.cd <= 0 && !this.target) { this.target = irnd(1, 6); this.targetT = 240; Game.speech(this, 'Für ' + pick(['Störungen', 'Vertragsfragen', 'Beschwerden', 'Kündigung', 'Rückruf', 'alles andere']) + ' drücken Sie die ' + this.target + '!', 120, true); AudioSys.sfx('dtmf'); this.cd = 40; }
      if (this.target) { this.targetT--; if (this.targetT <= 0) { this.target = null; this.cd = 60; Game.speech(this, 'Eingabe nicht erkannt.', 50, true); const b = new HotlineBot(this.cx - 20, this.bottom + 10); this.room.add(b); } }
      if (this.t % 150 === 0) { const w = new SoundWave(this.x - 10, this.bottom - 10, -1); this.room.add(w); }
    } else if (this.hp === 2) { // phase 3: technicians + ping
      if (this.phaseName !== 'Wir verbinden Sie') { this.phaseName = 'Wir verbinden Sie'; Game.speech(this, 'Wir verbinden Sie mit einem Techniker.', 80, true); this.cd = 60; }
      this.cd--; if (this.cd <= 0) { this.cd = 200; const t = new Techniker(this.room.camMinX + 20, this.y, Math.random() < 0.5 ? 'torben' : 'kevin'); this.room.add(t); const pg = new Ping(this.x, this.cy); this.room.add(pg); const pg2 = new Ping(this.x, this.cy + 20); this.room.add(pg2); AudioSys.sfx('ping'); }
      if (this.t % 400 === 100) { this.lower = 150; Game.speech(this, 'Sind Sie noch dran?', 60, true); }
      if (this.lower > 0) { this.lower--; this.y += 20; }
    } else if (this.hp === 1) { // phase 4: carry the plug
      if (this.phaseName !== 'Sind Sie noch dran?') { this.phaseName = 'Sind Sie noch dran?'; Game.speech(this, 'SIND SIE NOCH DRAN?! Der Stecker! Nehmen Sie ihn nicht!', 100, true); this.stecker = new Stecker(this.x - 30, this.y); this.stecker.startX = this.x - 30; this.stecker.startY = this.y; this.stecker.vy = -3; this.room.add(this.stecker); this.room.spawnBuchse(); }
      this.cd--; if (this.cd <= 0) { this.cd = 90; const pg = new Ping(this.x, this.cy); this.room.add(pg); AudioSys.sfx('ping'); if (Math.random() < 0.4) { const w = new SoundWave(this.x - 10, this.bottom - 10, -1); this.room.add(w); } }
    }
  }
  spawnButtons() { for (let i = 1; i <= 6; i++) { const b = new NumButton(this.room.camMinX + 24 + (i - 1) * 40, this.bottom + 20 - (i % 2) * 24, i, this); this.room.add(b); this.buttons.push(b); } }
  pressed(n) { if (!this.target) return; if (n === this.target) { this.correct++; this.target = null; this.cd = 50; AudioSys.sfx('select'); popup(this.cx, this.y - 10, 'Richtig! ' + this.correct + '/3', '#7bd23a'); if (this.correct >= 3) { this.damage(1, 'menu'); this.buttons.forEach(b => b.dead = true); this.buttons = []; this.correct = 0; } } else { this.target = null; this.cd = 60; AudioSys.sfx('back'); Game.speech(this, 'Falsche Eingabe. Sie werden zurück in die Warteschleife gestellt.', 80, true); const b = new HotlineBot(this.cx - 20, this.bottom + 10); this.room.add(b); } }
  contact() { const p = this.player; if (!p || p.dying) return; // antenna/receiver hitbox on top when lowered
    const top = { x: this.x + 8, y: this.y - 4, w: 48, h: 12 };
    if ((this.hp === 4 || this.hp === 2) && this.lower > 0 && p.vy > 0 && rectHit(top, p)) { p.vy = -6; this.damage(1, 'stomp'); this.lower = 0; Game.speech(this, this.hp === 3 ? 'AUTSCH! Hauptmenü!' : 'SYSTEMFEHLER!', 60, true); return; }
    if (!p.invincible && rectHit({ x: this.x + 6, y: this.y + 20, w: 52, h: 40 }, p)) p.hurt(this); }
  applyPhysics() { }
  damage(n, how) { const ok = super.damage(n, how); if (ok && this.hp > 0) { this.t = 0; this.cd = 90; } return ok; }
  draw(g) {
    const pal = this.hitT > 0 && this.anim % 4 < 2 ? 'flash' : null; const ly = this.lower > 0 ? Math.min(20, this.lower / 4) : 0;
    Sprites.draw(g, 'nixi', this.x, this.y - ly, false, pal);
    // display text
    g.fillStyle = '#b8e6b0'; g.fillRect(this.x + 13, this.y + 27 - ly, 38, 12); Font.draw(g, 'WARTEZEIT', this.x + 32, this.y + 28 - ly, '#1a3a1a', { align: 'center' }); Font.draw(g, Math.floor(this.wait) + ' MIN', this.x + 32, this.y + 36 - ly, '#1a3a1a', { align: 'center' });
    if (this.lower > 0 && this.anim % 20 < 10) Font.draw(g, 'JETZT DRAUF!', this.cx, this.y - 14 - ly, '#7bd23a', { align: 'center', shadow: true });
    if (this.target && this.anim % 20 < 10) Font.draw(g, 'DRÜCKE ' + this.target + '!', this.cx, this.y - 12, '#ffd700', { align: 'center', shadow: true });
    if (this.target) { const bx = this.room.camX + VW / 2 - 40, by = this.room.camY + 30; g.fillStyle = '#000'; g.fillRect(bx, by, 80, 4); g.fillStyle = '#ffd700'; g.fillRect(bx, by, 80 * this.targetT / 240, 4); }
  }
  drawHp(g) { super.drawHp(g); if (this.state === 'fight') Font.draw(g, this.phaseName, Game.level.room.camX + VW / 2, Game.level.room.camY + VH - 32, '#e03a3a', { align: 'center', shadow: true }); }
  defeatUpdate() { if (this.t % 6 === 0) { burst(this.x + rnd(0, this.w), this.y + rnd(0, this.h), ['#e03a3a', '#fff', '#7fd6ff', '#9146ff'], 8, 3); shake(3); } if (this.t === 1) Game.speech(this, 'Ihr Anruf... wurde... beendet.', 150); if (this.t === 160) { this.dead = true; Game.bossDefeated(this); } }
}
class SoundWave extends Entity {
  constructor(x, y, dir) { super(x, y, 8, 12); this.dir = dir; this.delay = 0; this.isProjectile = true; this.type = 'proj'; this.noGravity = true; this.noTileCollision = true; this.life = 300; this.noBart = true; }
  update() { this.anim++; if (this.delay > 0) { this.delay--; return; } this.x += this.dir * 1.8; this.life--; if (this.life <= 0 || this.x < this.room.camMinX - 20) this.dead = true; const p = this.player; if (p && !p.dying && !p.invincible && rectHit(this, p)) { p.hurt(this); } }
  draw(g) { if (this.delay > 0) return; g.fillStyle = '#e03a3a'; for (let i = 0; i < 3; i++) { const h = 4 + Math.abs(Math.sin(this.anim * 0.3 + i)) * 8; g.fillRect(this.x + i * 3, this.bottom - h, 2, h); } Font.draw(g, '♪', this.x, this.y - 8, '#e03a3a'); }
}
class NumButton extends Entity {
  constructor(x, y, n, boss) { super(x, y, 16, 8); this.n = n; this.boss = boss; this.type = 'numbtn'; this.noGravity = true; this.noTileCollision = true; this.solid = true; this.pressT = 0; }
  update() { this.anim++; if (this.pressT > 0) this.pressT--; const p = this.player; if (p && p.vy > 0 && p.bottom - this.y < 8 && p.bottom >= this.y - 2 && p.x < this.right && p.right > this.x && this.pressT <= 0) { this.pressT = 30; p.vy = -3.5; AudioSys.sfx('dtmf'); this.boss.pressed(this.n); } }
  onRide(e) { }
  draw(g) { const pressed = this.pressT > 0; g.fillStyle = '#5a5a66'; g.fillRect(this.x - 2, this.y + (pressed ? 3 : 0), 20, 10 - (pressed ? 3 : 0)); g.fillStyle = this.boss.target === this.n && this.anim % 20 < 10 ? '#ffd700' : '#d4d4dc'; g.fillRect(this.x, this.y + (pressed ? 3 : 0), 16, 6); Font.draw(g, String(this.n), this.cx, this.y + 1 + (pressed ? 3 : 0), '#101014', { align: 'center' }); g.fillStyle = '#3a3a40'; g.fillRect(this.x + 6, this.y + 10, 4, this.room.h * TILE - this.y); }
}
