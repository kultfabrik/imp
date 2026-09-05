/* =====================================================================
   06 entity: Basisklasse, Physik gegen Tilemap, Partikel, Popups
   ===================================================================== */
class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.vx = 0; this.vy = 0; this.dead = false; this.dir = -1;
    this.onGround = false; this.hitWall = false; this.hitTop = false; this.solidToPlayer = false; this.layer = 1; this.anim = 0; this.active = false;
    this.gravity = GRAV; this.ignoreOneWay = false; this.noTileCollision = false; this.type = 'entity'; this.id = Entity.nextId++;
  }
  get cx() { return this.x + this.w / 2; } get cy() { return this.y + this.h / 2; } get bottom() { return this.y + this.h; } get right() { return this.x + this.w; }
  get room() { return Game.level ? Game.level.room : null; }
  get player() { return Game.level ? Game.level.player : null; }
  update() { }
  draw(g) { }
  distToPlayer() { const p = this.player; return p ? Math.abs(p.cx - this.cx) : 9999; }
  facePlayer() { const p = this.player; if (p) this.dir = p.cx < this.cx ? -1 : 1; }
  // tile helpers
  tileAt(px, py) { return this.room.tileAt(Math.floor(px / TILE), Math.floor(py / TILE)); }
  solidAt(px, py) { return this.room.solidAt(Math.floor(px / TILE), Math.floor(py / TILE), this); }
  applyPhysics(opts = {}) {
    const room = this.room; if (!room) return;
    const inWater = !this.noWater && room.tileAtPx(this.cx, this.cy) === '~';
    this.inWater = inWater;
    // gravity
    if (!this.noGravity) { this.vy += inWater ? this.gravity * 0.22 : this.gravity * (this.gravMul || 1); const mf = inWater ? 1.3 : (this.maxFall || MAXFALL); if (this.vy > mf) this.vy = mf; }
    if (this.noTileCollision) { this.x += this.vx; this.y += this.vy; return; }
    const prevBottom = this.bottom;
    // X axis
    this.hitWall = false;
    this.x += this.vx;
    if (this.vx !== 0) {
      const dirx = this.vx > 0 ? 1 : -1;
      const edgeX = dirx > 0 ? this.right - 0.01 : this.x;
      const tx = Math.floor(edgeX / TILE);
      const y0 = Math.floor(this.y / TILE), y1 = Math.floor((this.bottom - 0.01) / TILE);
      for (let ty = y0; ty <= y1; ty++) {
        if (room.solidAt(tx, ty, this) === 1) {
          this.x = dirx > 0 ? tx * TILE - this.w : (tx + 1) * TILE; this.hitWall = dirx; this.vx = 0; break;
        }
      }
    }
    // Y axis
    this.hitTop = false; this.onGround = false; this.groundTile = null;
    this.y += this.vy;
    if (this.vy >= 0) {
      const ty = Math.floor((this.bottom - 0.01) / TILE);
      const x0 = Math.floor((this.x + 1) / TILE), x1 = Math.floor((this.right - 1.01) / TILE);
      let landed = false;
      for (let tx = x0; tx <= x1; tx++) {
        const s = room.solidAt(tx, ty, this);
        if (s === 1 || (s === 2 && !this.ignoreOneWay && !this.dropThrough && prevBottom <= ty * TILE + 4)) {
          this.y = ty * TILE - this.h; this.vy = 0; this.onGround = true; this.groundTile = room.tileAt(tx, ty); landed = true;
          if (s === 1 && this.groundTile !== '-') { /* ok */ }
        }
      }
      if (landed) this.groundTile = this.groundTile || '#';
    } else {
      const ty = Math.floor(this.y / TILE);
      const x0 = Math.floor((this.x + 2) / TILE), x1 = Math.floor((this.right - 2.01) / TILE);
      let best = null;
      for (let tx = x0; tx <= x1; tx++) if (room.solidAt(tx, ty, this) === 1) { const d = Math.abs((tx + 0.5) * TILE - this.cx); if (!best || d < best.d) best = { tx, ty, d }; }
      if (best) { this.y = (best.ty + 1) * TILE; this.vy = 0; this.hitTop = best; }
    }
    // entity solids (moving platforms)
    if (!opts.noSolids && this.usesSolids) {
      for (const s of room.solids) {
        if (s === this || s.dead) continue;
        if (this.vy >= 0 && prevBottom <= s.y + 4 + Math.max(0, s.vy) && this.right > s.x + 1 && this.x < s.right - 1 && this.bottom >= s.y && this.bottom <= s.y + s.h + 4) {
          this.y = s.y - this.h; this.vy = 0; this.onGround = true; this.groundTile = 'E'; this.riding = s;
          if (s.onRide) s.onRide(this);
        }
      }
    }
    if (this.onGround && this.riding && this.groundTile !== 'E') this.riding = null;
    if (!this.onGround) this.riding = null;
  }
}
Entity.nextId = 1;

/* ---------------- FX ---------------- */
class Particle extends Entity {
  constructor(x, y, opts) { super(x, y, 2, 2); Object.assign(this, { life: 30, col: '#fff', size: 2, gravity: 0.1, spr: null, txt: null, fade: true, rot: 0 }, opts); this.maxLife = this.life; this.layer = 3; this.type = 'fx'; this.noTileCollision = true; }
  update() { this.life--; if (this.life <= 0) this.dead = true; this.vy += this.gravity; this.x += this.vx; this.y += this.vy; if (this.bounce && this.solidAt(this.cx, this.bottom)) { this.vy *= -0.5; this.y -= 1; } }
  draw(g) {
    if (this.fade) g.globalAlpha = clamp(this.life / this.maxLife * 2, 0, 1);
    if (this.spr) Sprites.draw(g, this.spr, this.x, this.y, this.flip);
    else if (this.txt) Font.draw(g, this.txt, this.x, this.y, this.col, { shadow: true });
    else { g.fillStyle = this.col; g.fillRect(Math.round(this.x), Math.round(this.y), this.size, this.size); }
    g.globalAlpha = 1;
  }
}
function spawnFx(x, y, opts) { const p = new Particle(x, y, opts); Game.level.room.add(p); return p; }
function popup(x, y, txt, col = '#fff') { return spawnFx(x - Font.width(txt) / 2, y, { txt, col, vy: -0.8, gravity: 0, life: 45 }); }
function burst(x, y, col, n = 8, speed = 2, opts = {}) { for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n + Math.random() * 0.5; spawnFx(x, y, Object.assign({ vx: Math.cos(a) * speed * (0.5 + Math.random()), vy: Math.sin(a) * speed * (0.5 + Math.random()) - 1, col: Array.isArray(col) ? pick(col) : col, life: 20 + Math.random() * 20, size: 1 + Math.floor(Math.random() * 3) }, opts)); } }
function dust(x, y, n = 3) { for (let i = 0; i < n; i++) spawnFx(x + rnd(-4, 4), y - 2, { vx: rnd(-0.6, 0.6), vy: rnd(-0.6, -0.1), gravity: 0, spr: 'dust', life: 14 + i * 3 }); }
function shake(n) { if (Save.opt.shake) Game.shake = Math.max(Game.shake, n); }
