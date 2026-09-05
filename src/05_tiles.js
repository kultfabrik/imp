/* =====================================================================
   05 tiles: Themes, Tile-Renderer, Parallax-Hintergründe
   ===================================================================== */
const SOLID_TILES = new Set(['#', '%', 'B', '?', 'Q', 'X', 'f', '&', 'W', 'c', 'I', 'O', '=']);
const THEMES = {
  w1: { name: 'Umzug', sky: ['#f7b267', '#f4845f', '#c1666b'], ground: '#8b5a2b', groundTop: '#c68642', groundDark: '#5c3a1a', wall: '#6d4c41', brick: '#c9803a', brickDark: '#8a4f1d', plat: '#d7b98e', accent: '#7bd23a', water: '#3a7bd5', bg: 'room' },
  w2: { name: 'Kiez', sky: ['#0b1030', '#1b2a5a', '#3a2a6a'], ground: '#4a4a55', groundTop: '#7a7a88', groundDark: '#2c2c33', wall: '#333340', brick: '#9c4f3d', brickDark: '#5a2a20', plat: '#8890a0', accent: '#ff5ad1', water: '#2f5f9f', bg: 'city' },
  w3: { name: 'Amt', sky: ['#cfd3d9', '#b8bcc5', '#9aa0aa'], ground: '#7c7f87', groundTop: '#b3b7c0', groundDark: '#55585f', wall: '#8e929b', brick: '#a8a29e', brickDark: '#6f6a66', plat: '#c9ccd2', accent: '#e03a3a', water: '#6a8fbf', bg: 'office' },
  w4: { name: 'Schanzenhof', sky: ['#7fc8f8', '#bfe6ff', '#e8f6ff'], ground: '#7a5230', groundTop: '#5aa832', groundDark: '#4a3018', wall: '#8d6e4a', brick: '#a86a3a', brickDark: '#6e4020', plat: '#c9a06a', accent: '#f4d03f', water: '#3a7bd5', bg: 'farm' },
  w5: { name: 'Röhren', sky: ['#062a2a', '#0b3d3d', '#0f4f4a'], ground: '#2f6f5f', groundTop: '#4fa08a', groundDark: '#1c4a3f', wall: '#25554a', brick: '#3f7f6f', brickDark: '#245045', plat: '#5fb09a', accent: '#7bd23a', water: '#1f8f8f', bg: 'sewer' },
  w6: { name: 'Honigwald', sky: ['#1e5a3a', '#2f8a4f', '#7fc86a'], ground: '#5c3a1a', groundTop: '#3fa34d', groundDark: '#3a2410', wall: '#4a3020', brick: '#c47a0f', brickDark: '#8a5210', plat: '#a86a3a', accent: '#ffb347', water: '#3a7bd5', bg: 'forest' },
  w7: { name: 'Wien', sky: ['#0a0a1a', '#1a1030', '#2a1a40'], ground: '#3a3040', groundTop: '#6a5a70', groundDark: '#20182a', wall: '#2c2436', brick: '#5a4a60', brickDark: '#3a2a40', plat: '#7a6a80', accent: '#ffd700', water: '#1a3a6a', bg: 'vienna' },
  w8: { name: 'YouTube-Tower', sky: ['#1a0a0a', '#3a1010', '#601818'], ground: '#5a2a2a', groundTop: '#e03a3a', groundDark: '#3a1a1a', wall: '#402020', brick: '#8a3030', brickDark: '#5a2020', plat: '#ffffff', accent: '#ffffff', water: '#3a3aa0', bg: 'tower' },
  w9: { name: 'NIXNET', sky: ['#2a0a0a', '#4a1414', '#6a2020'], ground: '#6a6a72', groundTop: '#b0b0b8', groundDark: '#3a3a40', wall: '#7a2a2a', brick: '#a03030', brickDark: '#6a1a1a', plat: '#c8c8d0', accent: '#e03a3a', water: '#3a5a9a', bg: 'nixnet' },
  w10: { name: 'Unterwelt', sky: ['#020210', '#06062a', '#0a0a40'], ground: '#1a1a4a', groundTop: '#4a7fff', groundDark: '#10102a', wall: '#15153a', brick: '#2a2a7a', brickDark: '#1a1a5a', plat: '#7fd6ff', accent: '#7fd6ff', water: '#2a2aff', bg: 'fiber' },
  hub: { name: 'Zimmer', sky: ['#3a3a4a', '#4a4a5a', '#5a5a6a'], ground: '#6d4c41', groundTop: '#8d6e63', groundDark: '#4a3028', wall: '#5a4a5a', brick: '#8a5a3a', brickDark: '#5a3a2a', plat: '#a08060', accent: '#7bd23a', water: '#3a7bd5', bg: 'room' },
};

const Tiles = {
  cache: {},
  set(theme) { this.theme = THEMES[theme] || THEMES.w1; this.themeName = theme; },
  img(ch, variant) {
    const key = this.themeName + ch + (variant || '');
    if (this.cache[key]) return this.cache[key];
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; const g = c.getContext('2d');
    this.paint(g, ch, variant || ''); this.cache[key] = c; return c;
  },
  paint(g, ch, v) {
    const T = this.theme; const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const noise = (seed) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
    switch (ch) {
      case '#': {
        px(0, 0, 16, 16, T.ground);
        const r = noise(ch.charCodeAt(0) + (v === 'top' ? 7 : 3));
        for (let i = 0; i < 14; i++) px(Math.floor(r() * 16), Math.floor(r() * 16), 1 + Math.floor(r() * 2), 1, T.groundDark);
        for (let i = 0; i < 6; i++) px(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1, T.groundTop);
        if (v === 'top') { px(0, 0, 16, 3, T.groundTop); px(0, 3, 16, 1, T.groundDark); for (let i = 0; i < 5; i++) px(Math.floor(r() * 16), 0, 1, 1, T.groundDark); if (['w4', 'w6'].includes(this.themeName)) { px(2, -1 + 1, 1, 2, T.groundTop); px(6, 0, 1, 1, '#2f8a2f'); px(11, 0, 2, 1, '#2f8a2f'); } }
        break;
      }
      case '%': { px(0, 0, 16, 16, T.wall); const r = noise(5); for (let i = 0; i < 10; i++) px(Math.floor(r() * 16), Math.floor(r() * 16), 2, 1, T.groundDark); px(0, 0, 16, 1, T.groundDark); px(0, 0, 1, 16, T.groundDark); break; }
      case 'B': { px(0, 0, 16, 16, T.brickDark); px(1, 1, 6, 6, T.brick); px(9, 1, 6, 6, T.brick); px(0, 9, 3, 6, T.brick); px(5, 9, 6, 6, T.brick); px(13, 9, 3, 6, T.brick); break; }
      case '?': case 'Q': {
        const col = ch === 'Q' ? '#ff8a5c' : '#f4d03f', dark = ch === 'Q' ? '#b04a20' : '#c9a227';
        px(0, 0, 16, 16, dark); px(1, 1, 14, 14, col); px(1, 1, 1, 1, dark); px(14, 1, 1, 1, dark); px(1, 14, 1, 1, dark); px(14, 14, 1, 1, dark);
        if (v === 'lit') { px(2, 2, 12, 12, '#fff3a8'); }
        // pixel "?"
        [[6, 4], [7, 4], [8, 4], [9, 4], [5, 5], [10, 5], [10, 6], [9, 7], [8, 8], [8, 9], [8, 11]].forEach(p => px(p[0], p[1], 1, 1, dark));
        if (ch === 'Q') { px(6, 4, 4, 1, col); px(5, 5, 1, 1, col); px(6, 4, 1, 1, dark); px(9, 4, 1, 1, dark); px(7, 5, 2, 1, dark); px(7, 7, 2, 1, dark); px(6, 8, 1, 3, dark); px(9, 8, 1, 3, dark); px(7, 11, 2, 1, dark); } // "Q"-ish
        break;
      }
      case 'X': { px(0, 0, 16, 16, '#5a5a66'); px(1, 1, 14, 14, '#8a8a96'); px(2, 2, 12, 12, '#6a6a76'); px(3, 3, 3, 3, '#9a9aa6'); px(10, 3, 3, 3, '#9a9aa6'); px(3, 10, 3, 3, '#9a9aa6'); px(10, 10, 3, 3, '#9a9aa6'); break; }
      case '-': { px(0, 0, 16, 4, T.plat); px(0, 4, 16, 1, T.groundDark); px(2, 1, 1, 1, T.groundDark); px(9, 1, 1, 1, T.groundDark); if (this.themeName === 'w8') { px(0, 0, 16, 5, '#fff'); px(1, 1, 14, 2, '#e03a3a'); } break; }
      case '=': { px(0, 0, 16, 16, T.plat); px(0, 0, 16, 1, T.groundDark); px(0, 15, 16, 1, T.groundDark); px(0, 0, 1, 16, T.groundDark); px(15, 0, 1, 16, T.groundDark); break; }
      case '^': { px(0, 12, 16, 4, '#8a8a96'); for (let i = 0; i < 4; i++) { px(i * 4 + 1, 4, 2, 8, '#d4d4dc'); px(i * 4 + 1, 2, 2, 2, '#fff'); px(i * 4 + 2, 6, 1, 6, '#8a8a96'); } break; }
      case '~': { px(0, 0, 16, 16, T.water); g.globalAlpha = 0.5; px(0, 0, 16, 2, '#9be7ff'); px(3, 6, 4, 1, '#9be7ff'); px(10, 11, 3, 1, '#9be7ff'); g.globalAlpha = 1; break; }
      case '!': { const lava = this.themeName === 'w10'; px(0, 0, 16, 16, lava ? '#2a6aff' : '#ff5a1a'); px(0, 0, 16, 2, lava ? '#9be7ff' : '#ffd23a'); px(4, 5, 3, 2, lava ? '#7fd6ff' : '#ffb347'); px(10, 9, 4, 2, lava ? '#7fd6ff' : '#ffb347'); px(2, 12, 2, 2, lava ? '#7fd6ff' : '#ffd23a'); break; }
      case '&': { px(0, 0, 16, 16, '#c47a0f'); px(0, 0, 16, 3, '#ffb347'); px(2, 3, 3, 3, '#ffb347'); px(9, 3, 2, 5, '#ffb347'); px(6, 9, 2, 2, '#8a5210'); px(12, 11, 2, 2, '#8a5210'); break; }
      case 'W': { px(0, 0, 16, 16, '#8a5210'); px(0, 0, 3, 16, '#ffb347'); px(13, 0, 3, 16, '#ffb347'); px(3, 2, 3, 4, '#ffb347'); px(10, 9, 3, 4, '#ffb347'); px(6, 5, 2, 2, '#c47a0f'); break; }
      case 'O': { px(0, 0, 16, 16, '#2f6fc4'); px(1, 1, 14, 14, '#4a90e2'); px(2, 2, 12, 12, '#7fd6ff'); px(4, 4, 8, 8, '#4a90e2'); px(6, 6, 4, 4, '#fff'); break; }
      case 'o': { g.globalAlpha = 0.25; px(0, 0, 16, 16, '#4a90e2'); g.globalAlpha = 1; px(0, 0, 16, 1, '#4a90e2'); px(0, 15, 16, 1, '#4a90e2'); px(0, 0, 1, 16, '#4a90e2'); px(15, 0, 1, 16, '#4a90e2'); break; }
      case 'f': { px(0, 0, 16, 16, '#a01c1c'); px(1, 1, 14, 14, '#e03a3a'); px(2, 6, 12, 4, '#ff8a5c'); px(3, 3, 2, 2, '#ffd23a'); px(11, 11, 2, 2, '#ffd23a'); px(4, 7, 8, 2, '#a01c1c'); break; }
      case 'c': { px(0, 0, 16, 16, '#ffd23a'); px(1, 1, 14, 14, '#fff'); px(2, 3, 12, 2, '#e03a3a'); px(2, 7, 9, 2, '#e03a3a'); px(2, 11, 11, 2, '#e03a3a'); break; }
      case '$': { g.globalAlpha = 0.28; px(0, 0, 16, 16, '#ffd23a'); g.globalAlpha = 0.7; [[7, 2], [7, 3], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [4, 5], [4, 6], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 8], [10, 9], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [7, 11], [7, 12]].forEach(p => px(p[0], p[1], 1, 1, '#c9a227')); g.globalAlpha = 1; break; }
      case 'I': { if (v === 'shown') { px(0, 0, 16, 16, '#5a5a66'); px(1, 1, 14, 14, '#8a8a96'); } break; }
      case ',': { // decoration: theme dependent
        if (this.themeName === 'w1' || this.themeName === 'hub') { px(3, 6, 10, 10, '#a86a3a'); px(3, 6, 10, 1, '#c9803a'); px(5, 9, 6, 3, '#fff3a8'); }
        else if (this.themeName === 'w3') { px(2, 2, 12, 14, '#8e929b'); px(3, 3, 10, 12, '#c9ccd2'); px(4, 5, 8, 1, '#8e929b'); px(4, 8, 6, 1, '#8e929b'); px(4, 11, 7, 1, '#8e929b'); }
        else if (this.themeName === 'w4' || this.themeName === 'w6') { px(2, 12, 1, 4, '#2f8a2f'); px(5, 10, 1, 6, '#3fa34d'); px(8, 13, 1, 3, '#2f8a2f'); px(12, 11, 1, 5, '#3fa34d'); px(4, 9, 3, 1, '#f4d03f'); }
        else if (this.themeName === 'w2') { px(2, 4, 12, 12, '#333340'); px(3, 5, 10, 10, '#4c4c56'); px(4, 6, 8, 3, '#ff5ad1'); }
        else if (this.themeName === 'w5') { px(0, 13, 16, 3, '#1f8f8f'); px(3, 11, 2, 2, '#2fb8c9'); }
        else if (this.themeName === 'w7') { px(6, 2, 4, 14, '#20182a'); px(4, 0, 8, 4, '#ffd700'); }
        else if (this.themeName === 'w8') { px(2, 4, 12, 9, '#e03a3a'); px(6, 6, 4, 5, '#fff'); px(7, 7, 2, 3, '#e03a3a'); }
        else if (this.themeName === 'w9') { px(2, 3, 12, 13, '#3a3a40'); px(3, 4, 10, 6, '#7fd6ff'); px(5, 12, 6, 2, '#b0b0b8'); }
        else if (this.themeName === 'w10') { px(7, 0, 2, 16, '#2a2aff'); px(7, 3, 2, 3, '#7fd6ff'); px(7, 11, 2, 2, '#7fd6ff'); }
        break;
      }
      case ';': { px(1, 2, 14, 10, '#c9803a'); px(2, 3, 12, 8, '#f3e7c8'); px(3, 5, 10, 1, '#5c3a1a'); px(3, 8, 7, 1, '#5c3a1a'); px(7, 12, 2, 4, '#8a5a2b'); break; }
      case ':': { // pipe body (vertical)
        px(0, 0, 16, 16, v || '#3fa34d'); px(0, 0, 2, 16, '#25702f'); px(14, 0, 2, 16, '#25702f'); px(3, 0, 2, 16, '#a4e04a'); break;
      }
    }
  },
  // pipe rendering by color name
  pipeCol(color) { return { green: ['#3fa34d', '#25702f', '#a4e04a'], blue: ['#2f6fc4', '#1a4a8a', '#7fd6ff'], orange: ['#f28c28', '#b04a20', '#ffd23a'], red: ['#e03a3a', '#a01c1c', '#ff8a5c'], grey: ['#8a8a96', '#4c4c56', '#d4d4dc'], yellow: ['#f4d03f', '#c9a227', '#fff3a8'] }[color] || ['#3fa34d', '#25702f', '#a4e04a']; },
  drawPipe(g, x, y, h, color, dir = 'up') {
    const [c, d, l] = this.pipeCol(color);
    g.fillStyle = c;
    if (dir === 'up') {
      g.fillRect(x + 2, y + 6, 28, h - 6); g.fillStyle = d; g.fillRect(x + 2, y + 6, 2, h - 6); g.fillRect(x + 26, y + 6, 4, h - 6); g.fillStyle = l; g.fillRect(x + 6, y + 6, 3, h - 6);
      g.fillStyle = c; g.fillRect(x, y, 32, 7); g.fillStyle = d; g.fillRect(x, y, 32, 1); g.fillRect(x, y + 6, 32, 1); g.fillRect(x, y, 2, 7); g.fillRect(x + 28, y, 4, 7); g.fillStyle = l; g.fillRect(x + 4, y + 1, 3, 5);
    } else if (dir === 'down') {
      g.fillRect(x + 2, y, 28, h - 6); g.fillStyle = d; g.fillRect(x + 2, y, 2, h - 6); g.fillRect(x + 26, y, 4, h - 6); g.fillStyle = l; g.fillRect(x + 6, y, 3, h - 6);
      g.fillStyle = c; g.fillRect(x, y + h - 7, 32, 7); g.fillStyle = d; g.fillRect(x, y + h - 7, 32, 1); g.fillRect(x, y + h - 1, 32, 1); g.fillRect(x, y + h - 7, 2, 7); g.fillRect(x + 28, y + h - 7, 4, 7); g.fillStyle = l; g.fillRect(x + 4, y + h - 6, 3, 5);
    } else if (dir === 'left' || dir === 'right') { // horizontal pipe: h = length, opening at left/right
      const px0 = x, w = h;
      g.fillRect(px0, y + 2, w, 28); g.fillStyle = d; g.fillRect(px0, y + 2, w, 2); g.fillRect(px0, y + 26, w, 4); g.fillStyle = l; g.fillRect(px0, y + 6, w, 3);
      const ox = dir === 'left' ? px0 : px0 + w - 7; g.fillStyle = c; g.fillRect(ox, y, 7, 32); g.fillStyle = d; g.fillRect(ox, y, 1, 32); g.fillRect(ox + 6, y, 1, 32); g.fillRect(ox, y, 7, 2); g.fillRect(ox, y + 28, 7, 4); g.fillStyle = l; g.fillRect(ox + 1, y + 4, 5, 3);
    }
  }
};

/* ---------------- Parallax backgrounds ---------------- */
const Backgrounds = {
  cache: {},
  get(theme, layer) {
    const key = theme + layer; if (this.cache[key]) return this.cache[key];
    const c = document.createElement('canvas'); c.width = 512; c.height = 240; const g = c.getContext('2d');
    this.paint(g, theme, layer, c.width, c.height); this.cache[key] = c; return c;
  },
  px(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); },
  paint(g, theme, layer, W, H) {
    const P = (x, y, w, h, col) => this.px(g, x, y, w, h, col);
    const r = makeRng(theme.length * 31 + layer * 7 + theme.charCodeAt(1) * 13);
    const bg = THEMES[theme] ? THEMES[theme].bg : 'room';
    if (layer === 0) return; // sky gradient drawn separately
    switch (bg) {
      case 'room':
        if (layer === 1) { // wallpaper + paintings + window
          P(0, 0, W, H, theme === 'hub' ? '#4a4050' : '#e8d8b8');
          for (let x = 0; x < W; x += 24) for (let y = 0; y < H; y += 24) P(x + 8, y + 8, 4, 4, theme === 'hub' ? '#5a5060' : '#d8c8a8');
          for (let i = 0; i < 6; i++) { const x = 40 + i * 84, y = 30 + (i % 2) * 8; const cols = ['#3a5b8c', '#7bd23a', '#f28c28', '#9146ff', '#2fb8c9', '#e03a3a']; P(x, y, 40, 40, '#2b1a12'); P(x + 2, y + 2, 36, 36, cols[i]); P(x + 10, y + 12, 6, 6, '#fff'); P(x + 24, y + 12, 6, 6, '#fff'); P(x + 12, y + 14, 2, 2, '#000'); P(x + 26, y + 14, 2, 2, '#000'); P(x + 12, y + 26, 16, 4, '#000'); P(x + 14, y + 27, 12, 2, '#fff'); }
          for (let i = 0; i < 3; i++) { const x = 60 + i * 180; P(x, 100, 48, 56, '#2b1a12'); P(x + 3, 103, 42, 50, '#f7b267'); P(x + 3, 103, 42, 20, '#f4845f'); P(x + 23, 103, 2, 50, '#2b1a12'); P(x + 3, 127, 42, 2, '#2b1a12'); }
          P(200, 130, 60, 12, '#c9803a'); P(210, 118, 40, 12, '#f3e7c8'); Font.draw(g, 'LEGALISIER', 205, 120, '#2b1a12');
        }
        if (layer === 2) { for (let i = 0; i < 8; i++) { const x = 20 + i * 64, y = 150 + (i % 3) * 10; P(x, y, 28, 30, '#a86a3a'); P(x, y, 28, 2, '#c9803a'); P(x + 8, y + 10, 12, 8, '#fff3a8'); } for (let i = 0; i < 4; i++) { const x = 90 + i * 130; P(x, 150, 4, 30, '#5c3a1a'); P(x - 10, 130, 24, 24, '#2f8a2f'); P(x - 4, 124, 12, 12, '#3fa34d'); } }
        break;
      case 'city':
        if (layer === 1) { for (let i = 0; i < 14; i++) { const w = 30 + r() * 30, h = 60 + r() * 100, x = i * 38; P(x, H - h, w, h, '#141a38'); for (let wy = H - h + 6; wy < H - 10; wy += 10) for (let wx = x + 4; wx < x + w - 4; wx += 8) if (r() < 0.5) P(wx, wy, 4, 5, r() < 0.2 ? '#ff5ad1' : '#f4d03f'); } P(120, 40, 3, 3, '#fff'); P(300, 30, 2, 2, '#fff'); P(420, 60, 2, 2, '#fff'); P(60, 22, 2, 2, '#fff'); P(380, 20, 24, 24, '#fff3a8'); P(386, 26, 6, 6, '#e8d8a8'); }
        if (layer === 2) { for (let i = 0; i < 9; i++) { const w = 40 + r() * 30, h = 40 + r() * 60, x = i * 58; P(x, H - h, w, h, '#0b0e22'); P(x + 6, H - h - 14, 6, 14, '#0b0e22'); if (i % 3 === 0) { P(x + 4, H - h + 10, 30, 12, ['#ff5ad1', '#2fb8c9', '#7bd23a'][i % 3 | 0]); Font.draw(g, ['SPÄTI', 'DÖNER', 'NIXNET'][(i / 3) | 0], x + 6, H - h + 12, '#101014'); } } }
        break;
      case 'office':
        if (layer === 1) { P(0, 0, W, H, '#c5c9d1'); P(0, 120, W, 4, '#9aa0aa'); for (let i = 0; i < 7; i++) { const x = 20 + i * 76; P(x, 60, 36, 100, '#8e929b'); P(x + 3, 63, 30, 94, '#b3b7c0'); P(x + 28, 110, 3, 3, '#f4d03f'); Font.draw(g, String(101 + i * 3), x + 6, 70, '#4c4c56'); } for (let x = 0; x < W; x += 16) P(x, 10, 12, 4, x % 48 === 0 ? '#fff3a8' : '#d4d4dc'); }
        if (layer === 2) { for (let i = 0; i < 6; i++) { const x = 30 + i * 88; P(x, 130, 40, 50, '#7c7f87'); for (let k = 0; k < 4; k++) P(x + 4, 136 + k * 11, 32, 8, ['#e03a3a', '#3a7bd5', '#f4d03f', '#3fa34d'][k]); } for (let i = 0; i < 3; i++) { const x = 100 + i * 170; P(x, 150, 24, 30, '#5a5a66'); P(x + 4, 152, 16, 10, '#d4d4dc'); Font.draw(g, 'ZIEHEN', x - 4, 140, '#4c4c56'); } }
        break;
      case 'farm':
        if (layer === 1) { for (let i = 0; i < 6; i++) { const x = i * 100 - 20, h = 50 + (i % 3) * 20; g.fillStyle = '#5aa832'; g.beginPath(); g.ellipse(x + 60, H, 90, h, 0, Math.PI, 0); g.fill(); } P(350, 150, 4, 4, '#fff'); P(60, 30, 40, 14, '#fff'); P(70, 24, 24, 12, '#fff'); P(300, 50, 50, 14, '#fff'); P(312, 42, 26, 12, '#fff'); }
        if (layer === 2) { P(80, 120, 90, 70, '#a03030'); P(70, 100, 110, 24, '#6e2020'); g.fillStyle = '#6e2020'; g.beginPath(); g.moveTo(70, 124); g.lineTo(125, 90); g.lineTo(180, 124); g.fill(); P(110, 150, 30, 40, '#5a2020'); P(120, 128, 12, 12, '#fff3a8'); P(60, 150, 30, 40, '#3a7bd5'); P(300, 140, 60, 50, '#8d6e4a'); P(296, 130, 68, 14, '#5c3a1a'); for (let i = 0; i < 12; i++) { P(200 + i * 26, 170, 4, 20, '#8d6e4a'); P(200 + i * 26, 176, 26, 3, '#8d6e4a'); } for (let i = 0; i < 4; i++) { P(400 + i * 28, 150, 20, 30, '#e8d8a8'); P(402 + i * 28, 152, 16, 26, '#f4d03f'); } }
        break;
      case 'sewer':
        if (layer === 1) { P(0, 0, W, H, '#0b3535'); for (let y = 0; y < H; y += 12) for (let x = (y / 12 % 2) * 12; x < W; x += 24) P(x, y, 22, 10, '#0f4545'); for (let i = 0; i < 5; i++) { const x = i * 110 + 20; g.fillStyle = '#062a2a'; g.beginPath(); g.arc(x + 40, 130, 40, Math.PI, 0); g.fill(); P(x, 130, 80, 110, '#062a2a'); } }
        if (layer === 2) { for (let i = 0; i < 8; i++) { const x = i * 68, c = ['#3fa34d', '#2f6fc4', '#f28c28', '#e03a3a'][i % 4]; P(x + 10, 0, 16, 60 + (i % 3) * 30, c); P(x + 10, 0, 3, 60 + (i % 3) * 30, '#101014'); P(x + 40, 100 + (i % 2) * 40, 40, 14, c); } for (let i = 0; i < 20; i++) P(r() * W, 150 + r() * 80, 1, 3, '#2fb8c9'); }
        break;
      case 'forest':
        if (layer === 1) { for (let i = 0; i < 12; i++) { const x = i * 44 + r() * 10; P(x + 8, 60, 10, 180, '#1e3a1e'); g.fillStyle = '#245a24'; g.beginPath(); g.arc(x + 13, 60, 30, 0, Math.PI * 2); g.fill(); } }
        if (layer === 2) { for (let i = 0; i < 7; i++) { const x = i * 76 + r() * 10; P(x + 10, 90, 16, 150, '#3a2410'); P(x + 12, 90, 4, 150, '#5c3a1a'); g.fillStyle = '#3fa34d'; g.beginPath(); g.arc(x + 18, 80, 36, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7bd23a'; g.beginPath(); g.arc(x + 8, 70, 18, 0, Math.PI * 2); g.fill(); if (i % 2) { P(x + 30, 120, 10, 12, '#ffb347'); P(x + 32, 118, 6, 3, '#c47a0f'); } } for (let i = 0; i < 10; i++) { P(r() * W, r() * 200, 2, 2, '#f4d03f'); } }
        break;
      case 'vienna':
        if (layer === 1) { for (let i = 0; i < 60; i++) P(r() * W, r() * 120, 1, 1, '#fff'); const cx = 380, cy = 100, R = 60; g.strokeStyle = '#4a3a60'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke(); for (let a = 0; a < 12; a++) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a / 12 * Math.PI * 2) * R, cy + Math.sin(a / 12 * Math.PI * 2) * R); g.stroke(); P(cx + Math.cos(a / 12 * Math.PI * 2) * R - 4, cy + Math.sin(a / 12 * Math.PI * 2) * R - 3, 8, 6, '#e03a3a'); } P(cx - 6, cy, 12, 140, '#2a1a40'); P(120, 60, 24, 150, '#2a1a40'); g.fillStyle = '#2a1a40'; g.beginPath(); g.moveTo(112, 70); g.lineTo(132, 10); g.lineTo(152, 70); g.fill(); for (let i = 0; i < 8; i++) { const x = i * 64; P(x, 130 + (i % 2) * 10, 50, 110, '#1c1430'); for (let wy = 140; wy < 220; wy += 12) for (let wx = x + 6; wx < x + 46; wx += 10) if (r() < 0.3) P(wx, wy, 4, 6, '#f4d03f'); } }
        if (layer === 2) { for (let i = 0; i < 6; i++) { const x = i * 90 + 30; P(x, 150, 6, 90, '#101014'); P(x - 4, 140, 14, 14, '#ffd700'); P(x - 2, 142, 10, 10, '#fff3a8'); } for (let i = 0; i < 40; i++) { g.globalAlpha = 0.25; P(r() * W, 160 + r() * 80, 20 + r() * 40, 6, '#8a8a96'); g.globalAlpha = 1; } }
        break;
      case 'tower':
        if (layer === 1) { P(0, 0, W, H, '#2a0c0c'); for (let y = 0; y < H; y += 40) for (let x = 0; x < W; x += 64) { P(x + 8, y + 8, 48, 28, '#3a1010'); P(x + 24, y + 14, 16, 16, '#e03a3a'); P(x + 29, y + 18, 6, 8, '#fff'); } }
        if (layer === 2) { for (let i = 0; i < 10; i++) { const x = r() * W, y = r() * H; P(x, y, 40, 24, '#4a1818'); P(x + 2, y + 2, 36, 16, ['#3a7bd5', '#f4d03f', '#7bd23a', '#ff5ad1'][i % 4]); P(x + 4, y + 19, 30, 3, '#8a8a96'); } }
        break;
      case 'nixnet':
        if (layer === 1) { P(0, 0, W, H, '#5a1a1a'); for (let x = 0; x < W; x += 32) P(x, 0, 1, H, '#4a1414'); for (let y = 0; y < H; y += 32) P(0, y, W, 1, '#4a1414'); for (let i = 0; i < 5; i++) { const x = 40 + i * 100; P(x, 40, 60, 40, '#e03a3a'); Font.draw(g, 'NIXNET', x + 12, 48, '#fff'); Font.draw(g, 'ihr anschluss', x - 4, 62, '#fff3a8'); Font.draw(g, 'ist uns wichtig', x - 10, 70, '#fff3a8'); } }
        if (layer === 2) { for (let i = 0; i < 7; i++) { const x = 20 + i * 72; P(x, 140, 56, 60, '#8a3030'); P(x + 4, 144, 48, 30, '#3a3a40'); P(x + 8, 148, 40, 20, '#7fd6ff'); P(x + 20, 176, 16, 24, '#5a5a66'); } }
        break;
      case 'fiber':
        if (layer === 1) { for (let i = 0; i < 12; i++) { const x = i * 44; g.strokeStyle = ['#2a2aff', '#4a4aff', '#1a1acc'][i % 3]; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 30, 80, x - 30, 160, x + 20, 240); g.stroke(); } for (let i = 0; i < 40; i++) P(r() * W, r() * H, 2, 2, '#7fd6ff'); }
        if (layer === 2) { for (let i = 0; i < 8; i++) { const x = i * 64; g.strokeStyle = '#7fd6ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 240); g.bezierCurveTo(x + 40, 150, x - 20, 100, x + 30, 0); g.stroke(); } }
        break;
    }
  },
  draw(g, theme, camX, camY, W, H, offline) {
    const T = THEMES[theme] || THEMES.w1;
    const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, T.sky[0]); grad.addColorStop(0.6, T.sky[1]); grad.addColorStop(1, T.sky[2]);
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    for (let layer = 1; layer <= 2; layer++) {
      const img = this.get(theme, layer); const f = layer === 1 ? 0.2 : 0.45;
      let ox = -((camX * f) % img.width); const oy = clamp(-(camY * f * 0.5), -60, 0);
      if (ox > 0) ox -= img.width;
      for (let x = ox; x < W; x += img.width) g.drawImage(img, Math.round(x), Math.round(oy));
    }
    if (offline) { g.fillStyle = 'rgba(60,60,70,0.55)'; g.fillRect(0, 0, W, H); }
  }
};
