/* =====================================================================
   07 player: imp — Bewegung, Zustände, Power-ups, Perks, HOLF
   ===================================================================== */
const PERKS = {
  impimpimp: { name: 'impimpimp', desc: 'Dreifachsprung. Jeder Extra-Sprung ruft "imp" in den Chat.', cost: 300, icon: '↑' },
  satire: { name: 'Dauersatiresendung', desc: '[E] Witz-Attacke: Gegner in der Nähe erstarren vor Fremdscham. 8s Cooldown.', cost: 250, icon: '!' },
  verplant: { name: 'Verplant', desc: 'Einmal pro Level vergisst imp zu sterben.', cost: 400, icon: '?' },
  unpuenktlich: { name: 'Unpünktlich', desc: 'Der Stream-Countdown läuft 30% langsamer. Zeit ist relativ.', cost: 150, icon: 'T' },
  papierkram: { name: 'Papierkram-Allergie', desc: 'Formulare haften nicht mehr - imp niest sie weg.', cost: 200, icon: 'F' },
  bart: { name: 'Bart-Schutz', desc: 'Alle 10s bleibt ein Projektil im Bart hängen.', cost: 250, icon: 'B' },
  vegan: { name: 'Vegan Power', desc: 'Tofu heilt komplett, Hafermilch gibt +50 Zuschauer.', cost: 150, icon: 'V' },
  modruf: { name: 'Mod-Ruf', desc: '[E] Ludwig schwingt einmal pro Level den Bannhammer (Bildschirm-Clear).', cost: 350, icon: 'M' },
  sinan: { name: 'Sinan-Sprung', desc: '+15% Sprunghöhe. [↓] in der Luft: Dunk (Ground-Pound), zerbricht Blöcke.', cost: 300, icon: 'S' },
  umverteilung: { name: 'Umverteilung', desc: 'Besiegte Gegner droppen Bits. Der Mehrwert gehört dem Streamer.', cost: 200, icon: '€' },
  magnet: { name: 'Späti-Magnet', desc: 'Bits werden aus der Ferne angezogen.', cost: 200, icon: '*' },
  doppel: { name: 'Doppelgänger', desc: '[E] Marx-Pappfigur: Gegner verfolgen 5s die Pappe. 20s Cooldown.', cost: 300, icon: 'K' },
  clip: { name: 'Clip it!', desc: 'Nach dem ersten BRB im Level startest du am Ort des Clips statt am Checkpoint.', cost: 350, icon: 'C' },
  prime: { name: 'Prime-Abo', desc: 'Ein Gratis-Item pro Level im Späti-Shop.', cost: 250, icon: 'P' },
  hype: { name: 'Hype-Lokführer', desc: 'Hype-Train baut sich 50% schneller auf und zerfällt langsamer.', cost: 200, icon: 'H' },
};
const JOKES = [
  'Mein Internet ist wie mein Stream-Start: kommt später.', 'Ich bin nicht unpünktlich. Ich bin zeitlich unabhängig.', 'Papierkram? Ich hab ein System: Stapel.',
  'Vegan ist einfach. Fleisch essen ist auch einfach. Nur eins davon ist ok.', 'Umzug ist wie ein Bosskampf mit Kartons als Lebensbalken.', 'Wien ist schön. Aus der Ferne. Aus sehr großer Ferne.',
  'Mein Router hat mehr Ausfallzeit als ich Streamzeit.', 'Ich wurde gefragt ob ich Marx bin. Ich hab nein gesagt. Er auch.', 'Techniker kommen zwischen 8 und 18 Uhr. Irgendein Tag. Irgendein Jahr.',
  'Der Chat sagt ich soll schneller laufen. Der Chat sitzt.', 'Ich hab kein Netz, aber Netzhaut. Reicht das?', 'Mein Steuerberater hat mich geblockt. Auf Twitch.',
  'Bits sind wie Kalorien: zählt man nicht, sind es mehr.', 'Ich wollte pünktlich sein, aber der Weg war interessanter.', 'Grillen ohne Fleisch ist einfach Feuer machen. Feuer ist cool.',
  'Mein Assistent heißt Ludwig. Er ist der Grund, warum wir noch existieren.', 'Ich hab die Hotline angerufen. Sie hat zurückgelacht.', 'Wusstet ihr: 9 von 10 Formularen sind unnötig. Das zehnte auch.',
  'Der Algorithmus mag mich nicht. Ich mag ihn auch nicht. Wir sind quitt.', 'Wenn ich zu spät bin, ist das Content.', 'Honig ist Bienen-Papierkram. Deshalb auch nichts für mich.',
  'Ich laufe seit 3 Leveln. Das ist mehr Sport als 2019 bis heute.', 'Drachenlord rollt. Ich rolle nicht. Ich hab Würde. Und Rückenschmerzen.', 'Ein Abo ist wie eine Umarmung. Eine, die 4,99 kostet.',
  'Mein Kabel geht nach Wien. Ich nicht. Ich muss aber. Das ist Tragik.', 'Kennt ihr den? Nein? Ich auch nicht, der ist von Mario Barth.', 'Ich hab kein Netz und trotzdem mehr Meinung als Twitter.',
  'Lieblingsfarbe? Lila. Twitch hat mich gekauft. Für Bits.', 'Späti, Mate, Kabel. Die heilige Dreifaltigkeit.', 'Mein Bart hat mehr Follower als der Router Balken.',
];
const CHAT_IMP_LINES = ['impimpimp', 'impimpimp', 'IMPIMPIMP', 'imp imp imp'];

class Player extends Entity {
  constructor(x, y) {
    super(x, y, 10, 22);
    this.type = 'player'; this.usesSolids = true; this.dir = 1; this.form = 'imp'; this.marxT = 0; this.prevForm = 'imp';
    this.jumpBuffer = 0; this.coyote = 0; this.jumpHeld = false; this.airJumps = 0; this.inv = 0; this.dying = 0; this.ducking = false; this.gliding = false;
    this.carry = null; this.spin = 0; this.throwT = 0; this.holf = null; this.holfT = 0; this.mate = 0; this.combo = 0; this.comboT = 0;
    this.formular = 0; this.formularMash = 0; this.stun = 0; this.stunMash = 0; this.balls = []; this.bartCd = new Cooldown(600); this.satireCd = new Cooldown(480); this.doppelCd = new Cooldown(1200);
    this.verplantUsed = false; this.modrufUsed = false; this.clipUsed = false; this.walkFrame = 0; this.pipeT = 0; this.pipe = null; this.pipeDir = null; this.controlLock = 0; this.won = false;
    this.honeyWall = 0; this.ducked = false; this.hurtFlash = 0; this.laughT = 0; this.gp = false; this.gpLand = 0; this.lastSafe = { x, y }; this.autoWalk = 0; this.sneeze = 0; this.hidden = false;
    this.skin = Save.slot && Save.slot.skin || 'default';
  }
  hasPerk(p) { return Game.perksActive.includes(p); }
  get big() { return this.form !== 'imp'; }
  get invincible() { return this.holf === 'gold' || this.inv > 0 || this.dying > 0 || this.pipeT > 0; }
  get spriteBase() {
    if (this.form === 'marx') return 'marx';
    if (this.form === 'banana') return 'banana'; if (this.form === 'ball') return 'ball';
    if (this.form === 'head') return this.skin === 'batik' ? 'batik' : 'head';
    return this.skin === 'batik' ? 'batik' : this.skin === 'cap' ? 'cap' : 'imp';
  }
  setForm(f) {
    if (f === 'marx') { if (this.form !== 'marx') this.prevForm = this.form; this.form = 'marx'; this.marxT = 1200; return; }
    this.form = f;
  }
  powerUp(kind) {
    AudioSys.sfx('power'); Game.viewers(25);
    if (kind === 'hafer') { if (this.form === 'imp') this.setForm('head'); if (this.hasPerk('vegan')) Game.viewers(50); popup(this.cx, this.y - 8, 'Hafermilch!', '#9be7ff'); Chat.react('power'); }
    else if (kind === 'banana') { this.setForm('banana'); popup(this.cx, this.y - 8, 'Bananenhemd!', '#f4d03f'); Chat.react('banana'); }
    else if (kind === 'ball') { this.setForm('ball'); popup(this.cx, this.y - 8, 'Sinans Ball!', '#f28c28'); Chat.react('ball'); }
    else if (kind === 'marx') { this.setForm('marx'); popup(this.cx, this.y - 8, 'Marx-Ausweis!', '#d4d4dc'); Chat.react('marx'); }
    else if (kind === 'mate') { this.mate = 600; popup(this.cx, this.y - 8, 'Späti-Mate! TURBO', '#7bd23a'); Chat.react('mate'); }
    else if (kind === 'agave') { if (this.form === 'imp') this.setForm('head'); Game.addBits(50); popup(this.cx, this.y - 8, 'Agavendicksaft!', '#ffb347'); }
    else if (kind === 'tofu') { if (this.form === 'imp' || this.hasPerk('vegan')) this.setForm(this.hasPerk('vegan') && this.form === 'imp' ? 'head' : this.form === 'imp' ? 'head' : this.form); Game.addBits(10); popup(this.cx, this.y - 8, 'Tofu! vegan power', '#fff'); AudioSys.sfx('tofu'); }
    else if (kind === 'brb') { Game.addBRB(1); }
    if (['hafer', 'banana', 'ball', 'agave'].includes(kind)) Game.hypeAdd(6);
  }
  collectHolf(kind) {
    this.holf = kind; this.holfT = kind === 'bronze' ? 540 : 600; AudioSys.sfx('holf'); Game.viewers(100); Game.hypeAdd(15);
    const names = { gold: 'HOLF GOLD: Streamer des Jahres!', silver: 'HOLF SILBER: Bester Komiker!', bronze: 'HOLF BRONZE: Pünktlichster Streamer (lol)', green: 'HOLF GRÜN: Vegan-Award!' };
    Game.banner(names[kind], kind === 'gold' ? '#ffd700' : kind === 'silver' ? '#d4d4dc' : kind === 'bronze' ? '#c47a0f' : '#7bd23a');
    Chat.react('holf' + kind);
    if (kind === 'gold') { AudioSys.play('holf'); }
    if (kind === 'silver') { AudioSys.sfx('laugh'); this.room.ents.forEach(e => { if (e.isEnemy) e.laugh = 600; }); }
    if (kind === 'bronze') { AudioSys.sfx('slowmo'); Game.slowmo = 540; AudioSys.setSpeed(0.6); }
    if (kind === 'green') { let n = 0; this.room.ents.forEach(e => { if (e.isMeat && !e.dead) { e.tofuify(); n++; } }); if (n) popup(this.cx, this.y - 16, n + 'x Tofu-fiziert!', '#7bd23a'); }
    if (!Save.slot.holfs[Game.levelNo]) Save.slot.holfs[Game.levelNo] = []; if (!Save.slot.holfs[Game.levelNo].includes(kind)) Save.slot.holfs[Game.levelNo].push(kind);
  }
  hurt(src, opts = {}) {
    if (this.invincible || this.won || Game.cut) return false;
    if (this.holf === 'silver' && src && src.laugh) return false;
    if (this.hasPerk('bart') && this.bartCd.ready && src && src.isProjectile) { this.bartCd.fire(); src.dead = true; popup(this.cx, this.y - 10, 'Bart-Schutz!', '#f2c9a0'); AudioSys.sfx('bump'); spawnFx(this.cx - 2, this.y + 8, { spr: src.sprName || 'wurst', vy: 1, life: 40 }); return false; }
    if (opts.instakill) { this.die(); return true; }
    if (this.form === 'imp' || (Game.difficulty === 'hard' && this.form !== 'marx' && opts.fromEnemy && false)) {
      if (this.hasPerk('verplant') && !this.verplantUsed) { this.verplantUsed = true; this.inv = 120; popup(this.cx, this.y - 12, 'Verplant: sterben vergessen!', '#f4d03f'); Chat.react('verplant'); AudioSys.sfx('power'); return false; }
      this.die(); return true;
    }
    // downgrade
    if (this.form === 'marx') { this.form = this.prevForm === 'imp' ? 'imp' : 'imp'; if (this.form === 'imp') { /* marx absorbs to small */ } }
    else if (this.form === 'head') this.form = 'imp';
    else this.form = Game.difficulty === 'hard' ? 'imp' : 'head';
    this.inv = 100; this.hurtFlash = 20; AudioSys.sfx('hurt'); this.dropCarry(); this.combo = 0; Game.hypeHit(); Chat.react('hurt');
    this.vy = -2.5; this.vx = (src && src.cx > this.cx ? -1.5 : 1.5); shake(3);
    return true;
  }
  die() {
    if (this.dying) return; this.dying = 1; this.vy = -5.5; this.vx = 0; this.dropCarry(); AudioSys.stop(); AudioSys.sfx('die'); Game.onPlayerDeath(); this.form = 'imp'; this.holf = null; this.mate = 0; this.formular = 0; this.stun = 0;
  }
  dropCarry() { if (this.carry) { this.carry.carried = false; this.carry.vx = 0; this.carry.vy = 0; this.carry = null; } }
  throwCarry(upward) {
    const c = this.carry; if (!c) return; c.carried = false; this.carry = null; AudioSys.sfx('throw'); this.throwT = 14;
    if (Input.is('down') && this.onGround) { c.vx = this.dir * 0.6; c.vy = 0; c.x = this.cx + this.dir * 10 - c.w / 2; c.gentle = 20; return; }
    c.vx = this.dir * (upward ? 1.2 : 3.6) + this.vx * 0.5; c.vy = upward ? -6 : -1.5; c.thrown = 30; c.throwerImmune = 20;
  }
  update() {
    const L = Game.level, room = this.room;
    this.anim++; this.bartCd.tick(); this.satireCd.tick(); this.doppelCd.tick();
    if (this.inv > 0) this.inv--; if (this.hurtFlash > 0) this.hurtFlash--; if (this.throwT > 0) this.throwT--; if (this.sneeze > 0) this.sneeze--;
    if (this.comboT > 0) { this.comboT--; if (this.comboT === 0) this.combo = 0; }
    if (this.mate > 0) { this.mate--; if (this.mate % 3 === 0) spawnFx(this.x + rnd(0, this.w), this.y + rnd(0, this.h), { col: '#7bd23a', life: 12, gravity: 0, vx: -this.dir * 0.5 }); }
    if (this.marxT > 0 && this.form === 'marx') { this.marxT--; if (this.marxT <= 0) { this.form = this.prevForm; popup(this.cx, this.y - 8, 'Ausweis abgelaufen', '#aaa'); } }
    if (this.holf) { this.holfT--; if (this.holf === 'gold' && this.anim % 2 === 0) spawnFx(this.x + rnd(0, this.w), this.y + rnd(0, this.h), { col: pick(['#ffd700', '#fff', '#ff5ad1', '#7fd6ff']), life: 14, gravity: 0, vy: -0.3 }); if (this.holfT <= 0) { if (this.holf === 'gold') AudioSys.play(L.music); if (this.holf === 'bronze') { Game.slowmo = 0; AudioSys.setSpeed(1); } this.holf = null; } }
    if (this.dying) {
      this.dying++; this.vy += 0.2; if (this.y < 4000) this.y += this.vy; if (this.dying === 150) Game.afterDeath(); return;
    }
    if (this.pipeT > 0) { this.pipeUpdate(); return; }
    if (this.x < 0) { this.x = 0; if (this.vx < 0) this.vx = 0; } if (this.right > this.room.w * TILE) { this.x = this.room.w * TILE - this.w; if (this.vx > 0) this.vx = 0; }
    if (this.won) { this.winUpdate(); return; }
    if (this.controlLock > 0) this.controlLock--;
    const locked = this.controlLock > 0 || Game.cut || Game.pollActive || !!UI.top;
    // stun (Kennste?) & formular
    if (this.stun > 0) {
      this.stun--; this.vx = 0; this.applyPhysics();
      if (Input.anyPressed && !locked) { this.stunMash++; if (this.stunMash >= 8) { this.stun = 0; this.stunMash = 0; popup(this.cx, this.y - 10, 'Losgerissen!', '#7bd23a'); Chat.react('escape'); } }
      return;
    }
    if (this.formular > 0) { this.formular--; if (Input.was('jump') && !locked) { this.formularMash++; if (this.formularMash >= 5) { this.formular = 0; this.formularMash = 0; popup(this.cx, this.y - 10, 'Formular weg!', '#7bd23a'); AudioSys.sfx('paper'); } } }
    // ---- input ----
    let left = !locked && Input.is('left'), right = !locked && Input.is('right'), run = !locked && Input.is('run') && this.formular <= 0, down = !locked && Input.is('down'), up = !locked && Input.is('up');
    if (this.autoWalk) { right = this.autoWalk > 0; left = this.autoWalk < 0; run = false; }
    const jumpPressed = !locked && Input.was('jump'), jumpDown = !locked && Input.is('jump');
    if (jumpPressed) this.jumpBuffer = 7; else if (this.jumpBuffer > 0) this.jumpBuffer--;
    const honey = this.groundTile === '&';
    const speedMul = (this.mate > 0 ? 1.45 : 1) * (this.formular > 0 ? 0.5 : 1) * (honey ? 0.45 : 1) * (Game.hype >= 2 ? 1.1 : 1);
    const maxSpd = (run ? 2.7 : 1.7) * speedMul;
    const accel = this.onGround ? (honey ? 0.06 : 0.14) : 0.09, fric = this.onGround ? (honey ? 0.3 : 0.16) : 0.02;
    this.ducking = down && this.onGround && !this.carry && !this.inWater;
    if (this.ducking && !left && !right) this.vx = Math.abs(this.vx) < fric ? 0 : this.vx - sign(this.vx) * fric;
    else if (left && !this.ducking) { this.vx -= accel * (this.vx > 0 ? 1.8 : 1); if (this.vx < -maxSpd) this.vx = Math.max(-maxSpd, this.vx + 0.1); this.dir = -1; }
    else if (right && !this.ducking) { this.vx += accel * (this.vx < 0 ? 1.8 : 1); if (this.vx > maxSpd) this.vx = Math.min(maxSpd, this.vx - 0.1); this.dir = 1; }
    else this.vx = Math.abs(this.vx) < fric ? 0 : this.vx - sign(this.vx) * fric;
    if (this.holf === 'gold' && run && this.onGround && this.anim % 4 === 0) dust(this.cx, this.bottom, 1);
    // ---- jumping ----
    if (this.onGround) { this.coyote = 7; this.airJumps = 0; this.gliding = false; if (this.gp) { this.gpLand = 8; this.gp = false; shake(4); dust(this.cx, this.bottom, 6); AudioSys.sfx('stomp'); room.groundPound(this); } }
    else if (this.coyote > 0) this.coyote--;
    const jumpMul = this.hasPerk('sinan') ? 1.08 : 1;
    if (this.inWater) {
      if (jumpPressed) { this.vy = -2.4; AudioSys.sfx('splash'); spawnFx(this.cx, this.y, { spr: 'dust', life: 15, gravity: 0, vy: -0.5 }); }
      if (this.vy < -2.4) this.vy = -2.4;
      this.jumpBuffer = 0;
    } else if (this.jumpBuffer > 0 && !this.ducked) {
      if (this.coyote > 0 && !this.gp) {
        this.vy = -(4.6 + Math.min(Math.abs(this.vx), 2.7) * 0.18) * jumpMul; this.jumpBuffer = 0; this.coyote = 0; this.jumpHeld = true; this.onGround = false; AudioSys.sfx('jump'); dust(this.cx, this.bottom, 2);
      } else if (this.honeyWall && !this.onGround) {
        this.vy = -4.4; this.vx = -this.honeyWall * 2.4; this.dir = -this.honeyWall; this.jumpBuffer = 0; this.jumpHeld = true; AudioSys.sfx('jump2'); dust(this.cx, this.cy, 2); this.honeyWall = 0;
      } else if (this.hasPerk('impimpimp') && this.airJumps < 2 && !this.gp) {
        this.airJumps++; this.vy = this.airJumps === 1 ? -4.0 * jumpMul : -3.6 * jumpMul; this.jumpBuffer = 0; this.jumpHeld = true; AudioSys.sfx(this.airJumps === 1 ? 'jump2' : 'jump3');
        popup(this.cx, this.y - 6, this.airJumps === 1 ? 'imp' : 'impimp', '#9146ff'); if (this.airJumps === 2) Chat.say(pick(CHAT_IMP_LINES)); burst(this.cx, this.bottom, '#9146ff', 5, 1);
      }
    }
    if (!jumpDown) this.jumpHeld = false;
    // variable jump: reduced gravity while rising and holding
    this.gravMul = (this.jumpHeld && this.vy < 0) ? 0.55 : 1;
    // glide (banana)
    this.gliding = false;
    if (this.form === 'banana' && !this.onGround && this.vy > 0.5 && jumpDown && !this.jumpHeld && !this.gp) { this.gliding = true; this.vy = Math.min(this.vy, 0.9); if (this.anim % 6 === 0) spawnFx(this.cx - this.dir * 6, this.y + 12, { col: '#f4d03f', life: 12, gravity: 0 }); }
    // ground pound (Sinan-Sprung perk)
    if (this.hasPerk('sinan') && !this.onGround && !this.inWater && Input.was('down') && !locked && !this.gp && !this.carry) { this.gp = true; this.vy = -1.5; this.vx = 0; this.gpSpin = 12; AudioSys.sfx('whoosh'); }
    if (this.gp) { if (this.gpSpin > 0) { this.gpSpin--; this.vy = -0.5; } else this.vy = Math.max(this.vy, 6); this.vx = 0; }
    // honey wall climbing (W tiles)
    this.honeyWall = 0;
    if (!this.onGround && this.vy > -1) {
      const side = (left ? -1 : right ? 1 : 0);
      if (side) { const tx = Math.floor((side > 0 ? this.right + 1 : this.x - 1) / TILE), ty = Math.floor(this.cy / TILE); if (room.tileAt(tx, ty) === 'W') { this.honeyWall = side; this.vy = Math.min(this.vy, up ? -0.8 : 0.5); if (this.anim % 8 === 0) spawnFx(this.x + (side > 0 ? this.w : 0), this.cy, { col: '#ffb347', life: 15, gravity: 0.05 }); } }
    }
    // ---- actions: carry/throw/spin/ball ----
    if (!locked && Input.was('run')) {
      if (this.carry) { this.throwCarry(up); }
      else {
        const t = room.ents.find(e => e.throwable && !e.dead && !e.carried && rectHit({ x: this.x - 6, y: this.y - 4, w: this.w + 12, h: this.h + 6 }, e) && (!e.pickupCond || e.pickupCond()));
        if (t && !this.gp) { this.carry = t; t.carried = true; t.thrown = 0; if (t.onPickup) t.onPickup(); AudioSys.sfx('select'); }
        else if (this.form === 'ball' && this.balls.filter(b => !b.dead).length < 2 && this.throwT <= 0) { const b = new Basketball(this.cx + this.dir * 6 - 4, this.y + 6, this.dir, this); room.add(b); this.balls.push(b); this.balls = this.balls.filter(x => !x.dead); this.throwT = 12; AudioSys.sfx('throw'); }
        else if (this.form === 'banana' && this.spin <= 0) { this.spin = 22; AudioSys.sfx('whoosh'); }
      }
    }
    if (this.spin > 0) { this.spin--; if (this.spin % 4 === 0) spawnFx(this.cx + rnd(-12, 12), this.cy + rnd(-8, 8), { col: pick(['#f4d03f', '#2fb8c9']), life: 10, gravity: 0 }); }
    if (this.carry) { const c = this.carry; c.x = this.cx - c.w / 2 + (this.ducking ? this.dir * 6 : 0); c.y = this.y - c.h + (this.ducking ? 10 : 2); c.vx = 0; c.vy = 0; if (c.dead) this.carry = null; }
    // perk active
    if (!locked && Input.was('perk')) this.usePerk();
    // ---- physics ----
    if (this.ducking && this.h !== 14) { this.y += 8; this.h = 14; }
    else if (!this.ducking && this.h !== 22) { // try to stand up
      const can = !room.solidRect(this.x, this.y - 8, this.w, 8); if (can) { this.y -= 8; this.h = 22; } else this.ducking = true;
    }
    this.dropThrough = down && this.onGround && this.groundTile === '-' && Input.was('down') && !this.hasPerk('sinan');
    if (this.dropThrough) { this.y += 2; this.onGround = false; }
    this.maxFall = this.gliding ? 0.9 : MAXFALL;
    this.applyPhysics();
    if (this.inWater && this.anim % 20 === 0) spawnFx(this.cx, this.y, { col: '#9be7ff', life: 20, gravity: -0.05, vy: -0.3 });
    if (this.hitTop && this.vy === 0) room.bumpBlock(this.hitTop.tx, this.hitTop.ty, this);
    if (this.hitWall && this.holf === 'gold' && run) { room.bumpBlock(Math.floor((this.hitWall > 0 ? this.right + 1 : this.x - 1) / TILE), Math.floor(this.cy / TILE), this, true); }
    // walk anim
    if (this.onGround && Math.abs(this.vx) > 0.2) { this.walkFrame += Math.abs(this.vx) * 0.25; if (Math.floor(this.walkFrame) % 4 === 0 && this.anim % 10 === 0 && run) dust(this.cx - this.dir * 4, this.bottom, 1); }
    if (this.onGround && Math.abs(this.vx) > 0.5 && this.anim % 14 === 0 && this.groundTile === '&') AudioSys.sfx('honey');
    // safe position
    if (this.onGround && this.groundTile !== '-' && this.groundTile !== 'E' && this.groundTile !== 'c') { const below = room.tileAt(Math.floor(this.cx / TILE), Math.floor((this.bottom + 8) / TILE)); if (below !== '^' && below !== '!' && below !== '~') this.lastSafe = { x: this.x, y: this.y }; }
    // hazards & bounds
    if (this.y > room.h * TILE + 40) { if (room.fallDeath !== false) this.die(); }
    const under = room.tileAtPx(this.cx, this.bottom - 2), mid = room.tileAtPx(this.cx, this.cy);
    if (under === '^' || mid === '^') this.hurt(null, {});
    if (under === '!' || mid === '!') { if (!this.hurt(null, { instakill: this.form === 'imp' })) { } else if (!this.dying) { this.vy = -5; } }
    if (mid === '$') { Game.demonT = (Game.demonT || 0) + 1; if (Game.demonT % 30 === 0 && Game.bits > 0) { Game.addBits(-1, true); popup(this.cx, this.y - 6, '-1 (demonetarisiert)', '#f4d03f'); } }
    // pipes
    if (!locked && !this.carry) this.checkPipes(up, down, left, right);
    // camera zone / room exit
    if (this.x > room.w * TILE - 8 && room.exitRight) { room.exitRight(); }
    // magnet
    if (this.hasPerk('magnet')) for (const e of room.ents) if (e.type === 'bit' && !e.dead && Math.abs(e.cx - this.cx) < 56 && Math.abs(e.cy - this.cy) < 48) { e.x += (this.cx - e.cx) * 0.12; e.y += (this.cy - e.cy) * 0.12; }
  }
  usePerk() {
    if (this.hasPerk('modruf') && !this.modrufUsed && (Input.is('down') || !this.hasPerk('satire'))) { this.modrufUsed = true; Game.modRuf(); return; }
    if (this.hasPerk('satire') && this.satireCd.ready) {
      this.satireCd.fire(); const joke = pick(JOKES); Game.speech(this, joke, 150); AudioSys.sfx('joke'); Save.slot.stats.jokes++;
      let n = 0; for (const e of this.room.ents) if (e.isEnemy && !e.dead && Math.abs(e.cx - this.cx) < 90 && Math.abs(e.cy - this.cy) < 60) { e.laugh = Math.max(e.laugh || 0, 150); n++; }
      Game.viewers(10 + n * 5); Chat.react(n ? 'joke' : 'jokemiss'); return;
    }
    if (this.hasPerk('doppel') && this.doppelCd.ready) { this.doppelCd.fire(); const d = new Decoy(this.x - 4, this.y - 2); this.room.add(d); AudioSys.sfx('select'); popup(this.cx, this.y - 10, 'Marx-Pappe!', '#d4d4dc'); return; }
    if (this.hasPerk('modruf') && !this.modrufUsed) { this.modrufUsed = true; Game.modRuf(); return; }
    AudioSys.sfx('back');
  }
  checkPipes(up, down, left, right) {
    for (const p of this.room.pipes) {
      if (!p.to) continue;
      if (p.dir === 'up' && down && this.onGround && Math.abs(this.cx - (p.x + 16)) < 8 && Math.abs(this.bottom - p.y) < 3) return this.enterPipe(p, 'down');
      if (p.dir === 'down' && up && Math.abs(this.cx - (p.x + 16)) < 8 && Math.abs(this.y - (p.y + p.h)) < 4 && this.vy <= 0) return this.enterPipe(p, 'up');
      if (p.dir === 'right' && left && this.onGround && Math.abs(this.x - (p.x + p.h)) < 4 && this.bottom > p.y + 4 && this.bottom <= p.y + 32) return this.enterPipe(p, 'left');
      if (p.dir === 'left' && right && this.onGround && Math.abs(this.right - p.x) < 4 && this.bottom > p.y + 4 && this.bottom <= p.y + 32) return this.enterPipe(p, 'right');
    }
  }
  enterPipe(p, moveDir) { this.pipe = p; this.pipeDir = moveDir; this.pipeT = 1; this.pipePhase = 'in'; AudioSys.sfx('pipe'); this.vx = 0; this.vy = 0; this.dropCarry(); if (moveDir === 'down') { this.x = p.x + 16 - this.w / 2; } if (moveDir === 'up') this.x = p.x + 16 - this.w / 2; Game.warpFlashSkip = false; }
  pipeUpdate() {
    this.pipeT++;
    const spd = 1;
    if (this.pipePhase === 'in') {
      if (this.pipeDir === 'down') this.y += spd; else if (this.pipeDir === 'up') this.y -= spd; else this.x += this.pipeDir === 'right' ? spd : -spd;
      if (this.pipeT > 30) { this.pipePhase = 'warp'; Game.pipeTravel(this.pipe); }
    } else if (this.pipePhase === 'out') {
      if (this.pipeDir === 'down') this.y += spd; else if (this.pipeDir === 'up') this.y -= spd; else this.x += this.pipeDir === 'right' ? spd : -spd;
      if (this.pipeT > 26) { this.pipeT = 0; this.pipe = null; this.inv = 10; }
    }
  }
  exitFromPipe(p) {
    // place player inside pipe and move out
    this.pipePhase = 'out'; this.pipeT = 1; this.pipe = p;
    if (p.dir === 'up') { this.x = p.x + 16 - this.w / 2; this.y = p.y + 2; this.pipeDir = 'up'; }
    else if (p.dir === 'down') { this.x = p.x + 16 - this.w / 2; this.y = p.y + p.h - this.h - 2; this.pipeDir = 'down'; }
    else if (p.dir === 'right') { this.x = p.x + p.h - this.w - 2; this.y = p.y + 32 - this.h; this.pipeDir = 'right'; }
    else { this.x = p.x + 2; this.y = p.y + 32 - this.h; this.pipeDir = 'left'; }
  }
  win(kind) { this.won = kind || 'flag'; this.winT = 0; this.vx = 0; this.dropCarry(); this.holf = null; }
  winUpdate() { this.winT++; this.vx = 0; this.applyPhysics(); if (this.winT === 60) { this.autoWalk = 0; } }
  stomped(e) { // called by enemies when stomped
    this.vy = Input.is('jump') ? -5.6 : -3.8; this.combo++; this.comboT = 90; const pts = [1, 2, 4, 8, 16][Math.min(4, this.combo - 1)];
    Game.viewers(pts * 5); popup(e.cx, e.y - 6, this.combo > 1 ? 'x' + this.combo + ' +' + pts * 5 : '+5', this.combo > 2 ? '#ff5ad1' : '#fff'); AudioSys.sfx('stomp'); Save.slot.stats.stomps++;
    if (this.combo === 3) Chat.react('combo'); if (this.combo === 5) { Chat.react('combo5'); Game.addBRB(1); popup(this.cx, this.y - 16, '1-BRB!', '#7bd23a'); }
    Game.hypeAdd(this.hasPerk('hype') ? 6 : 4);
    if (this.hasPerk('umverteilung')) { const b = new Bit(e.cx - 3, e.y, 1); b.vy = -2.5; b.vx = rnd(-1, 1); b.fly = true; this.room.add(b); }
    this.gp = false; this.airJumps = 0;
  }
  draw(g) {
    if (this.hidden) return;
    if (this.inv > 0 && this.anim % 6 < 3 && !this.dying && this.holf !== 'gold') return;
    const base = this.spriteBase; let name;
    const carrying = !!this.carry;
    if (this.dying) name = base + '_hurt';
    else if (this.stun > 0) name = base + '_hurt';
    else if (this.won) name = this.winT > 30 ? base + '_win' : base + '_happy';
    else if (this.pipeT > 0) name = base + '_idle';
    else if (this.gp) name = base + '_duck';
    else if (this.ducking) name = base + '_duck';
    else if (this.gliding) name = base + '_glide';
    else if (this.spin > 0) name = base + (this.spin % 8 < 4 ? '_glide' : '_fall');
    else if (this.throwT > 0) name = base + '_throw';
    else if (this.inWater) name = base + (this.anim % 20 < 10 ? '_jump' : '_fall');
    else if (!this.onGround) name = base + (carrying ? '_carry' : this.vy < 0 ? '_jump' : '_fall');
    else if (Math.abs(this.vx) > 0.2) { const f = Math.floor(this.walkFrame) % 4; name = base + (carrying ? ['_carryw1', '_carry', '_carryw3', '_carry'][f] : ['_walk1', '_idle', '_walk3', '_idle'][f]); }
    else name = base + (carrying ? '_carry' : '_idle');
    if (!SPR[name]) name = base + '_idle';
    const flip = this.dir < 0; const sx = this.x - 3, sy = this.bottom - 24;
    let pal = null;
    if (this.holf === 'gold') pal = this.anim % 8 < 4 ? 'gold' : null; if (this.hurtFlash > 0 && this.anim % 4 < 2) pal = 'flash';
    if (this.form === 'marx' && this.marxT < 120 && this.anim % 8 < 4) pal = null;
    if (this.spin > 0) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.scale(this.spin % 8 < 4 ? 1 : -1, 1); Sprites.draw(g, name, -8, -12, false, pal); g.restore(); }
    else if (this.gp && this.gpSpin > 0) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(this.gpSpin / 12 * Math.PI * 2); Sprites.draw(g, base + '_jump', -8, -12, flip, pal); g.restore(); }
    else Sprites.draw(g, name, sx, sy, flip, pal);
    if (this.formular > 0) { Sprites.draw(g, 'formular', this.cx - 6 + Math.sin(this.anim * 0.3) * 2, this.y - 4); if (this.anim % 30 < 15) Font.draw(g, 'Sprung hämmern!', this.cx, this.y - 16, '#fff', { align: 'center', shadow: true }); }
    if (this.stun > 0) { const s = ['Kennste?', 'Kennste?!', 'KENNSTE?', 'kennste kennste'][Math.floor(this.anim / 20) % 4]; Font.draw(g, s, this.cx, this.y - 20, '#ffd700', { align: 'center', shadow: true }); if (this.anim % 30 < 15) Font.draw(g, 'Tasten hämmern!', this.cx, this.y - 12, '#fff', { align: 'center', shadow: true }); }
    if (this.holf === 'silver' && this.anim % 20 < 10) Sprites.draw(g, 'laugh', this.cx - 4, this.y - 10);
    if (this.form === 'marx') { if (this.anim % 40 < 20) Sprites.draw(g, 'marx_card', this.cx - 6, this.y - 10); }
    if (this.honeyWall) { /* wall cling */ }
  }
}

class Basketball extends Entity {
  constructor(x, y, dir, owner) { super(x, y, 8, 8); this.vx = dir * 3.2; this.vy = -1; this.owner = owner; this.life = 240; this.type = 'ball'; this.bounces = 0; this.gravity = 0.2; }
  update() {
    this.life--; if (this.life <= 0) this.dead = true; this.anim++;
    this.applyPhysics({ noSolids: true });
    if (this.onGround) { this.vy = -2.6; this.bounces++; if (this.bounces > 6) this.dead = true; }
    if (this.hitWall) this.dead = true;
    if (this.tileAt(this.cx, this.cy) === '~') this.vy -= 0.3;
    for (const e of this.room.ents) if ((e.isEnemy || e.boss) && !e.dead && !e.noBall && rectHit(this, e)) { if (e.onBall) e.onBall(this); else e.kill('ball'); this.dead = true; burst(this.cx, this.cy, '#f28c28', 6, 1.5); break; }
    if (this.dead && this.life > 0) burst(this.cx, this.cy, '#f28c28', 4, 1);
  }
  draw(g) { g.save(); g.translate(Math.round(this.cx), Math.round(this.cy)); g.rotate(this.anim * 0.3 * sign(this.vx)); Sprites.draw(g, 'sinan_ball', -4, -4); g.restore(); }
}
class Decoy extends Entity {
  constructor(x, y) { super(x, y, 14, 24); this.life = 300; this.type = 'decoy'; }
  update() { this.life--; if (this.life <= 0) { this.dead = true; burst(this.cx, this.cy, '#d4d4dc', 6, 1); } this.applyPhysics(); }
  draw(g) { if (this.life < 60 && this.life % 8 < 4) return; Sprites.draw(g, 'marx_idle', this.x - 1, this.y); Font.draw(g, 'PAPPE', this.cx, this.y - 8, '#d4d4dc', { align: 'center', shadow: true }); }
}
