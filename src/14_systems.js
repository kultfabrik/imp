/* =====================================================================
   14 systems: Chat-Overlay, Hype-Train, Chat-Polls, Marx-Orakel, HUD, Banner
   ===================================================================== */
const CHAT_NAMES = [
  ['hafermilchHans', '#ff7f50'], ['wiener_oida', '#9acd32'], ['nixnet_support_bot', '#ff4500'], ['ludwig_fan_01', '#7bd23a'], ['marxistin93', '#e03a3a'], ['sinan_mit_ss', '#ff69b4'],
  ['drachenfan_ohne_lord', '#daa520'], ['veganerin_berlin', '#00ff7f'], ['kabel_kevin', '#f28c28'], ['pixel_pauline', '#ff5ad1'], ['moddi_mod', '#7bd23a'], ['bratwurst_bernd', '#d2691e'],
  ['impimpimp_enjoyer', '#c9a4ff'], ['spaeti_sophie', '#5f9ea0'], ['glasfaser_gigi', '#7fd6ff'], ['lag_lord', '#8a8a96'], ['tofu_tom', '#f4d03f'], ['berlin_bine', '#ff69b4'],
  ['hafi_official', '#9be7ff'], ['sub_sabine', '#ff5ad1'], ['bits_benny', '#c9a4ff'], ['clickbait_claudia', '#ff3b3b'], ['kennste_kai', '#ffd700'], ['brb_bernhard', '#7bd23a'],
  ['meddl_maria', '#c8a04a'], ['rohrfrei_ralf', '#3fa34d'], ['dauer_satire', '#9146ff'], ['prater_paul', '#ffb347'], ['honig_hanna', '#f4d03f'], ['zoll_zoe', '#ff8a5c'],
  ['captcha_carla', '#2fb8c9'], ['router_rita', '#7fd6ff'], ['wlan_wanda', '#9be7ff'], ['mate_max', '#a4e04a'], ['formular_frank', '#d4d4dc'], ['koffer_konstantin', '#8c8c96'],
  ['ober_ohne_trinkgeld', '#ffd700'], ['algo_rithmus', '#e03a3a'], ['pinguin_peter', '#5f9ea0'], ['chat_chris', '#ff7f50'],
];
const CHAT_REACT = {
  power: ['POWER UP', 'Hafi!', 'hafermilch gang', 'jetzt geht was', 'HAFI HAFI HAFI'], banana: ['BANANENHEMD LUL', 'das hemd ist back', 'gleiten!!!', 'fashion icon'], ball: ['SINAN BALL', 'wirf wirf wirf', 'streetball zeit', 'Sinan approves'],
  marx: ['MARX CARRIED', 'die büste redet wieder', 'marx > google', 'karl lässt grüßen', 'ist das satire?', 'Proletarier POG'], mate: ['MATE SPEED', 'späti gang', 'zu viel koffein', 'er ist schnell jetzt'],
  holfgold: ['HOLF GOLD!!!', 'UNBESIEGBAR', 'hall of live fame lets go', 'GOLDEN imp', 'impimpimp'], holfsilver: ['HOLF SILBER', 'alle lachen KEKW', 'satire modus', 'LUL LUL LUL'], holfbronze: ['HOLF BRONZE', 'slow mo pog', 'matrix imp', 'zeitlupe'], holfgreen: ['HOLF GRÜN', 'vegan power', 'grün ist die hoffnung'],
  verplant: ['er hat vergessen zu sterben LUL', 'VERPLANT', 'classic imp', 'das ist der perk'], hurt: ['AUA', 'F im chat?', 'pass auf!', 'monkaS', 'oof', 'noooo', 'headset weg'], escape: ['er hat sich losgerissen', 'FREI', 'kennste? nee'],
  combo: ['COMBO POG', 'x3!!!', 'stompen wie ein profi', 'POGGERS'], combo5: ['x5 COMBO', 'BRB verdient', 'ER IST UNAUFHALTBAR', 'POGGERS POGGERS'], joke: ['KEKW', 'LUL', 'dauersatiresendung', 'der war gut', 'HAHAHA', 'top witz'], jokemiss: ['...', 'Kappa', 'keiner lacht', 'ok imp', 'Sadge'],
  formular: ['PAPIERKRAM monkaS', 'formular klebt LUL', 'hämmer die taste', 'bürokratie ist der endboss'], kennste: ['KENNSTE?', 'oh nein Barth', 'kennste kennste', 'RUN', 'smalltalk trap'], steal: ['ABO GEKLAUT', 'DIEB!!!', 'hol das abo zurück', 'NEIN'],
  zoll: ['zoll nimmt 25%', 'tariffs LUL', 'der zoll hat gewonnen'], gift: ['GIFTED SUB POG', 'danke für den gift', 'wer war das?'], checkpoint: ['ludwig ist da', 'checkpoint!', 'safe', 'Ludwig hält die stellung'],
  sinan: ['SINAN', 'bizeps trampolin', 'mit scharfem S', 'pose pose pose'], online: ['ONLINE!', 'stream läuft wieder', 'endlich netz', 'wlan gefunden pog'], cookie: ['nur notwendige ✓', 'cookie banner besiegt', 'DSGVO POG'],
  ticket: ['ticket gezogen', 'schnell zur schleuse', 'wartenummer LUL'], richtip: ['reichtum kauft alles', 'marx ist enttäuscht', '100 BITS TRINKGELD', 'geld regiert'], bosshit: ['HIT', 'LETS GO', 'weiter so', 'POGGERS', 'noch einer'],
  bosskill: ['BOSS DOWN', 'GG', 'LETS GOOO', 'CLIP IT', 'impimpimp', 'WELTKLASSE'], death: ['F', 'F', 'f', 'RIP', 'nooo', 'BRB', 'F im chat'], sub: ['NEW SUB POG', 'ABO!', 'willkommen im club', 'sub hype', 'tier up'],
  holf: ['HOLF!', 'pokal pog'], levelstart: ['endlich stream', 'hallo imp', 'hafi!', 'zu spät wie immer', 'hallo chat'], levelclear: ['GG', 'WERBEPARTNER POG', 'kanal gerettet?', 'sponsor money', 'ludwig unterschreibt'],
  poll: ['POLL POLL', 'der chat entscheidet', 'A A A', 'B B B', 'ich stimme ab', 'demokratie pog'], pipe: ['röhre pog', 'wohin gehts', 'klempner imp'], offline: ['stream hängt?', 'bild steht', 'lag?', 'F in the chat', 'offline monkaS', 'hallo??'],
  afk: ['ist er afk?', 'imp?', 'hallo?', 'schläft er?', 'afk andy'], hype: ['HYPE TRAIN', 'ALL ABOARD', 'choo choo', 'HYPE HYPE', 'lokführer imp'], bits100: ['100 BITS POG', 'reich!', 'bits bits bits'], brb: ['+1 BRB', 'extra leben pog', 'BRB gesichert'],
  marxask: ['marx wird gefragt', 'orakel time', 'Marx carried', 'kapital braucht kapital'], shop: ['späti time', 'mate kaufen!', 'shopping pog'], warp: ['WARP ZONE', 'speedrun strats', 'wie hat er das gefunden'],
  timeout: ['STREAM STARTET OHNE DICH', 'zu spät LUL', 'classic imp', 'unpünktlich'], boss: ['BOSS TIME', 'monkaS', 'LETS GO', 'boss musik pog'], modruf: ['BANNHAMMER', 'MOD POWER', 'ludwig räumt auf', 'gebannt LUL'],
  gema: ['GEMA monkaS', 'musik weg', 'in deinem land nicht verfügbar', 'gnom!'], stuck: ['frag marx (H)', 'er ist lost', 'H drücken!'], levelup: ['impimpimp', 'nächstes level', 'pog'], plug: ['STECKER REIN', 'INTERNET!!!', 'POGGERS'],
  captcha: ['fahrräder!', 'ist er ein roboter?', 'captcha LUL'], lag: ['LAG', '999ms LUL', 'ping hölle'], dark: ['ich seh nix', 'licht an', 'monkaS'], secret: ['GEHEIMRAUM', 'wie?', 'pog'],
};
const CHAT_AMBIENT = ['hafi', 'impimpimp', 'wann internet?', 'ludwig ist der beste', 'erster', 'wo ist sinan', 'vegan gang', 'Kappa', 'ist das live?', 'wo bist du grad', 'NIXNET LUL', 'kennste?', 'ich hab auch kein netz', 'moin', 'BRB?', 'guter stream', 'wie spät ist es bei imp', 'marx > merz', 'Berlin > Wien', 'der bart sitzt', 'clip das', 'techniker kommt morgen', 'zwischen 8 und 18 uhr LUL', 'wer ist baba', 'sub gegönnt', 'lurk', '4 stunden wartezeit', 'imp du bist zu spät', 'oida', 'hafermilch > kuhmilch', 'router neu starten', 'hast du den stecker geprüft', 'LEGALISIER', 'Sinan mit scharfem S', 'Dauersatiresendung!', 'chat ist der beste', 'ich bin neu hier', 'wo ist marx', 'gibts ein giveaway', 'nice', 'lol', 'was ist ein HOLF', 'hall of live fame?', 'ich bin von nixnet, wir helfen gern (nicht)'];
const Chat = {
  msgs: [], pending: [], cd: {}, amb: 180, afkT: 0, lastX: 0, offlineSaid: false, scroll: 0, cache: null,
  reset() { this.msgs = []; this.pending = []; this.cd = {}; },
  say(txt, name) { const n = name || pick(CHAT_NAMES); this.msgs.push({ name: typeof n === 'string' ? n : n[0], col: typeof n === 'string' ? '#fff' : n[1], text: String(txt), t: Game.frame }); if (this.msgs.length > 60) this.msgs.shift(); },
  sys(txt) { this.msgs.push({ name: '', col: '#9146ff', text: txt, t: Game.frame, sys: true }); if (this.msgs.length > 60) this.msgs.shift(); },
  react(key, force) { if (!Save.opt.chat) return; if (this.cd[key] > 0 && !force) return; this.cd[key] = key === 'hurt' || key === 'bosshit' ? 90 : 200; const pool = CHAT_REACT[key]; if (!pool) return; const big = ['bosskill', 'combo5', 'holfgold', 'levelclear', 'death', 'sub', 'hype', 'plug'].includes(key); const n = big ? 3 + irnd(0, 2) : 1 + irnd(0, 1); const used = []; for (let i = 0; i < n; i++) { let t = pick(pool); if (used.includes(t) && pool.length > 2) t = pick(pool); used.push(t); this.pending.push({ txt: t, delay: 6 + i * irnd(8, 18) }); } },
  update() {
    for (const k in this.cd) if (this.cd[k] > 0) this.cd[k]--;
    for (const p of this.pending) p.delay--; while (this.pending.length && this.pending[0].delay <= 0) { const p = this.pending.shift(); this.say(p.txt); AudioSys.sfx('chat'); }
    this.pending = this.pending.filter(p => p.delay > 0 || true).filter(p => p.delay > -1);
    if (!Save.opt.chat) return;
    this.amb--; if (this.amb <= 0) { this.amb = irnd(200, 520); if (Game.state === 'play' || Game.state === 'hub') this.say(pick(CHAT_AMBIENT)); }
    const p = Game.level && Game.level.player; if (p && Game.state === 'play' && !Game.cut) { if (Math.abs(p.x - this.lastX) < 2) { this.afkT++; if (this.afkT === 600) this.react('afk'); if (this.afkT === 1500) { this.react('stuck', true); this.afkT = 700; } } else { this.afkT = 0; this.lastX = p.x; } }
  },
  draw(g, x0) {
    g.fillStyle = '#18181b'; g.fillRect(x0, 0, CHATW, VH); g.fillStyle = '#0e0e10'; g.fillRect(x0, 0, 1, VH);
    // header
    g.fillStyle = '#1f1f23'; g.fillRect(x0 + 1, 0, CHATW - 1, 12); Font.draw(g, 'STREAM-CHAT', x0 + CHATW / 2, 3, '#efeff1', { align: 'center' });
    let y = 14;
    // hype train
    y = HypeTrain.drawPanel(g, x0, y);
    if (Poll.active || Poll.resultT > 0) y = Poll.drawPanel(g, x0, y);
    if (!Save.opt.chat) { Font.draw(g, 'Chat aus', x0 + CHATW / 2, y + 20, '#53535f', { align: 'center' }); Font.draw(g, '(Optionen)', x0 + CHATW / 2, y + 30, '#53535f', { align: 'center' }); return; }
    // messages bottom-up
    const maxW = 15; let yy = VH - 4; const lines = [];
    for (let i = this.msgs.length - 1; i >= 0 && lines.length < 40; i--) {
      const m = this.msgs[i]; const wrapped = m.sys ? Font.wrap(m.text, maxW).map(l => ({ t: l, col: '#bf94ff' })) : this.wrapMsg(m, maxW); for (let j = wrapped.length - 1; j >= 0; j--) lines.push(wrapped[j]); lines.push(null);
    }
    for (const l of lines) { if (yy < y + 2) break; if (!l) { yy -= 2; continue; } yy -= 8; if (l.name) { Font.draw(g, l.name, x0 + 3, yy, l.col); if (l.t) Font.draw(g, l.t, x0 + 3 + Font.width(l.name) + 4, yy, '#efeff1'); } else Font.draw(g, l.t, x0 + 3, yy, l.col || '#efeff1'); }
  },
  wrapMsg(m, maxW) { // first line starts with name
    const out = []; const name = (m.name.length > 9 ? m.name.slice(0, 8) + '.' : m.name) + ':'; const words = m.text.split(' ');
    let line = '', firstLine = true, lim = maxW - name.length - 1; if (lim < 4) { out.push({ t: '', name, col: m.col }); firstLine = false; lim = maxW; }
    const flush = () => { out.push({ t: line, name: firstLine ? name : null, col: m.col }); line = ''; firstLine = false; lim = maxW; };
    for (let w of words) { while (w.length > lim) { if (line) flush(); line = w.slice(0, lim); w = w.slice(lim); flush(); } if ((line ? line.length + 1 : 0) + w.length > lim) flush(); line = line ? line + ' ' + w : w; }
    if (line || firstLine) flush(); return out;
  }
};
/* ---------------- Hype Train ---------------- */
const HypeTrain = {
  level: 0, bar: 0, t: 0, idle: 0, rainT: 0,
  reset() { this.level = 0; this.bar = 0; this.t = 0; this.idle = 0; AudioSys.setHype(0); },
  add(n) { const p = Game.level && Game.level.player; const mul = p && p.hasPerk && p.hasPerk('hype') ? 1.5 : 1; this.bar += n * mul; this.idle = 0; if (this.bar >= 100 && this.level < 5) { this.level++; this.bar = 0; this.t = 900; AudioSys.sfx(this.level === 1 ? 'train' : 'hype'); AudioSys.setHype(this.level); Game.banner(this.level === 5 ? 'HYPE TRAIN LV5: ALL ABOARD!' : 'HYPE TRAIN LEVEL ' + this.level + '!', '#9146ff'); Chat.react('hype', true); Chat.sys(['', 'Bits x1.5', '+10% Speed', 'Zuschauer x2', 'Bits x3', 'UNVERWUNDBAR 5s'][this.level]); if (this.level === 5 && p) { p.inv = Math.max(p.inv, 300); this.rainT = 300; } } else if (this.bar >= 100) this.bar = 100; },
  hit() { if (this.level > 0) { this.level--; this.t = this.level ? 900 : 0; AudioSys.setHype(this.level); Chat.sys('Hype Train verliert Dampf'); } this.bar = Math.max(0, this.bar - 40); },
  update() { const p = Game.level && Game.level.player; const slow = p && p.hasPerk && p.hasPerk('hype') ? 0.6 : 1; if (this.level > 0) { this.t -= slow; if (this.t <= 0) { this.level = 0; this.bar = 0; AudioSys.setHype(0); Chat.sys('Hype Train beendet'); } } else { this.idle++; if (this.idle > 180 && this.bar > 0) this.bar = Math.max(0, this.bar - 0.08 * slow); } if (this.rainT > 0) { this.rainT--; if (this.rainT % 8 === 0 && Game.level && Game.level.room) { const r = Game.level.room; const b = new Bit(r.camX + rnd(0, VW), r.camY - 10, 1); b.fly = true; b.vy = 1; b.gravity = 0.05; r.add(b); } } },
  get bitMul() { return this.level >= 4 ? 3 : this.level >= 1 ? 1.5 : 1; },
  drawPanel(g, x0, y) {
    const w = CHATW - 6; g.fillStyle = this.level ? '#2a1a4a' : '#1f1f23'; g.fillRect(x0 + 3, y, w, 16);
    if (this.level) { Font.draw(g, 'HYPE LV' + this.level, x0 + 5, y + 2, '#ffd700'); Font.draw(g, Math.ceil(this.t / 60) + 's', x0 + w - 1, y + 2, '#fff', { align: 'right' }); } else Font.draw(g, 'HYPE TRAIN', x0 + 5, y + 2, '#8a8a96');
    g.fillStyle = '#0e0e10'; g.fillRect(x0 + 5, y + 11, w - 4, 3); g.fillStyle = this.level ? '#ff5ad1' : '#9146ff'; g.fillRect(x0 + 5, y + 11, (w - 4) * clamp(this.bar / 100, 0, 1), 3);
    return y + 19;
  }
};
/* ---------------- Chat-Polls ---------------- */
const Poll = {
  active: false, t: 0, a: 0, b: 0, def: null, trig: null, vote: 0, resultT: 0, winner: null,
  start(def, trig) { if (this.active) return; this.active = true; this.t = 210; this.a = 0; this.b = 0; this.def = def; this.trig = trig; this.vote = 0; this.winner = null; this.resultT = 0; this.bias = Math.random() < 0.5 ? 1 : -1; Game.pollActive = true; AudioSys.sfx('poll'); Chat.react('poll', true); Chat.sys('POLL: ' + def.A + ' vs ' + def.B); },
  update() {
    if (this.resultT > 0) this.resultT--;
    if (!this.active) return;
    this.t--;
    if (Save.opt.vote && this.vote === 0) { if (Input.was('left') || Input.was('one')) { this.vote = 1; AudioSys.sfx('select'); Chat.say(this.def.A.split(':')[0], ['imp (du)', '#9146ff']); } else if (Input.was('right') || Input.was('two')) { this.vote = 2; AudioSys.sfx('select'); Chat.say(this.def.B.split(':')[0], ['imp (du)', '#9146ff']); } }
    if (this.t > 30 && this.t % 6 === 0) { const pa = 0.5 + this.bias * 0.12 + (this.vote === 1 ? 0.3 : this.vote === 2 ? -0.3 : 0); if (Math.random() < pa) this.a++; else this.b++; if (Math.random() < 0.3) Chat.say(Math.random() < pa ? 'A' : 'B'); }
    if (this.t === 30) { this.winner = this.a === this.b ? (Math.random() < 0.5 ? 'A' : 'B') : this.a > this.b ? 'A' : 'B'; AudioSys.sfx('pollend'); }
    if (this.t <= 0) { this.finish(); }
  },
  finish() { this.active = false; Game.pollActive = false; this.resultT = 240; const room = Game.level.room; const win = this.winner; room.openDoor(win === 'A' ? this.def.doorA : this.def.doorB); const label = win === 'A' ? this.def.A : this.def.B; Game.banner('Der Chat hat entschieden: ' + label, '#9146ff'); Chat.sys(win + ' gewinnt: ' + label); Save.slot.stats.polls++; if (this.trig) this.trig.done = true; },
  drawPanel(g, x0, y) {
    const w = CHATW - 6; const tot = Math.max(1, this.a + this.b); const pa = this.a / tot, pb = this.b / tot;
    g.fillStyle = '#1f1f23'; g.fillRect(x0 + 3, y, w, 46); Font.draw(g, this.active ? 'CHAT ENTSCHEIDET' : 'ERGEBNIS', x0 + CHATW / 2, y + 2, '#bf94ff', { align: 'center' });
    const bar = (yy, label, frac, win, key) => { const short = label.split(':')[0].slice(0, 9); Font.draw(g, key + ' ' + short, x0 + 5, yy, win ? '#ffd700' : '#efeff1'); g.fillStyle = '#0e0e10'; g.fillRect(x0 + 5, yy + 8, w - 4, 4); g.fillStyle = win ? '#ffd700' : '#9146ff'; g.fillRect(x0 + 5, yy + 8, (w - 4) * frac, 4); Font.draw(g, Math.round(frac * 100) + '%', x0 + w - 1, yy, '#8a8a96', { align: 'right' }); };
    bar(y + 11, this.def.A, pa, this.winner === 'A', 'A'); bar(y + 26, this.def.B, pb, this.winner === 'B', 'B');
    if (this.active) Font.draw(g, this.t > 30 ? Math.ceil((this.t - 30) / 60) + 's' + (Save.opt.vote && !this.vote ? ' ←/→' : '') : 'Auswertung...', x0 + CHATW / 2, y + 39, '#8a8a96', { align: 'center' });
    else Font.draw(g, this.winner + ' gewinnt!', x0 + CHATW / 2, y + 39, '#ffd700', { align: 'center' });
    return y + 49;
  }
};
/* ---------------- Marx-Orakel ---------------- */
const MARX_QUOTES = ['Die Philosophen haben die Welt nur verschieden interpretiert; es kömmt drauf an, den Stream zu starten.', 'Ein Gespenst geht um in diesem Level.', 'Die Router aller Länder, vereinigt euch!', 'Das Sein bestimmt das Bewusstsein. Das WLAN bestimmt den Stream.', 'Alles Ständische und Stehende verdampft. Vor allem der Techniker-Termin.', 'Die Geschichte wiederholt sich: erst als Tragödie, dann als Warteschleife.', 'Der Chat ist das Opium des Streamers.', 'Kapital ist geronnene Wartezeit.', 'Wer nicht springt, fällt. Das ist Dialektik.', 'Von jedem nach seinen Fähigkeiten, jedem nach seinen Bits.'];
const MarxOracle = {
  open: false, text: '', shown: 0, t: 0, cost: 0, mode: 'hint',
  ask(hint, free) {
    const L = Game.level; const hints = (L && L.hints) || MARX_HINTS[Save.slot.unlocked] || MARX_QUOTES;
    let txt; if (typeof hint === 'string') txt = hint; else if (typeof hint === 'number') txt = hints[hint % hints.length]; else { const p = L && L.player, r = L && L.room; let frac = 0; if (r && p) frac = clamp(p.x / (r.w * TILE), 0, 0.999); if (r && r.id === 'boss') frac = 0.999; txt = hints[Math.floor(frac * hints.length)]; }
    const isFree = free || !Game.marxUsed || Game.difficulty === 'chill' || !Game.level || Game.state === 'hub';
    if (!isFree) { if (Game.bits < 20) { Game.banner('Marx: "Auch das Kapital braucht Kapital." (20 Bits)', '#d4d4dc'); AudioSys.sfx('back'); return; } Game.addBits(-20, true); this.cost = 20; } else this.cost = 0;
    Game.marxUsed = true; Save.slot.stats.marx++; this.text = txt; this.quote = pick(MARX_QUOTES); this.shown = 0; this.t = 0; this.open = true; Game.cut = true; AudioSys.duck(1.2); AudioSys.sfx('select'); Chat.react('marxask');
  },
  update() { this.t++; if (this.shown < this.text.length) this.shown += Input.is('ok') ? 3 : 1; if (this.t > 10 && (Input.was('ok') || Input.was('back') || Input.was('marx'))) { if (this.shown < this.text.length) this.shown = this.text.length; else { this.open = false; Game.cut = false; AudioSys.sfx('back'); } } },
  draw(g) {
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 0, VW, VH);
    const bx = 16, by = 40, bw = VW - 32, bh = 150; g.fillStyle = '#d4d4dc'; g.fillRect(bx, by, bw, bh); g.fillStyle = '#1a1a22'; g.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
    Sprites.draw(g, 'face_marx', bx + 8, by + 8); Font.draw(g, 'KARL MARX', bx + 38, by + 10, '#d4d4dc'); Font.draw(g, 'Orakel & Doppelgänger', bx + 38, by + 19, '#8a8a96');
    if (this.cost) Font.draw(g, '-20 Bits', bx + bw - 8, by + 10, '#e03a3a', { align: 'right' }); else Font.draw(g, 'gratis', bx + bw - 8, by + 10, '#7bd23a', { align: 'right' });
    Font.drawWrapped(g, this.text.slice(0, this.shown), bx + 8, by + 40, 46, '#fff');
    Font.drawWrapped(g, '"' + this.quote + '"', bx + 8, by + 100, 46, '#8a8a96');
    if (this.shown >= this.text.length && this.t % 40 < 20) Font.draw(g, 'ENTER', bx + bw - 8, by + bh - 12, '#d4d4dc', { align: 'right' });
  }
};
/* ---------------- Banner (mid-screen announcements) ---------------- */
const Banner = {
  q: [], cur: null,
  show(txt, col) { if (this.cur && this.cur.txt === txt) return; this.q.push({ txt, col: col || '#fff', t: 0 }); if (this.q.length > 4) this.q.shift(); },
  update() { if (!this.cur && this.q.length) this.cur = this.q.shift(); if (this.cur) { this.cur.t++; if (this.cur.t > 150) this.cur = null; } },
  clear() { this.q = []; this.cur = null; },
  draw(g) { const c = this.cur; if (!c) return; const a = c.t < 10 ? c.t / 10 : c.t > 130 ? (150 - c.t) / 20 : 1; const lines = Font.wrap(c.txt, 44); const w = Math.max(...lines.map(l => Font.width(l))) + 12, h = lines.length * 9 + 7; const x = Math.round(VW / 2 - w / 2), y = 56; g.globalAlpha = a; g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#1a1a22'; g.fillRect(x, y, w, h); g.fillStyle = c.col; g.fillRect(x, y, 2, h); lines.forEach((l, i) => Font.draw(g, l, x + 8, y + 4 + i * 9, c.col)); g.globalAlpha = 1; }
};
/* ---------------- HUD ---------------- */
const HUD = {
  fmtViewers(n) { return n >= 10000 ? (n / 1000).toFixed(0) + 'k' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); },
  draw(g) {
    const L = Game.level; if (!L) return; const p = L.player, r = L.room; const off = r.playerOffline(p.cx);
    // LIVE / viewers
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(2, 2, 92, 11);
    if (off) { Font.draw(g, Game.frame % 40 < 25 ? 'OFFLINE' : '', 6, 4, '#8a8a96'); } else { g.fillStyle = Game.frame % 60 < 40 ? '#e03a3a' : '#7a1c1c'; g.fillRect(5, 5, 5, 5); Font.draw(g, 'LIVE', 13, 4, '#fff'); }
    Font.draw(g, this.fmtViewers(Game.viewerCount), 92, 4, '#efeff1', { align: 'right' }); Font.draw(g, '●', 46, 4, '#8a8a96');
    // bits
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(2, 15, 56, 11); Sprites.draw(g, 'bit_1', 5, 16); Font.draw(g, String(Game.bits), 14, 17, '#c9a4ff');
    // subs
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(60, 15, 34, 11); const have = new Set((Save.slot.subs[L.no] || []).concat(Game.levelSubs)); for (let i = 1; i <= 3; i++) Font.draw(g, '♥', 62 + (i - 1) * 10, 17, have.has(i) ? '#ff5ad1' : '#4c4c56');
    // timer (top right of game area)
    const secs = Math.ceil(Game.time / 60); const tcol = secs <= 60 ? (Game.frame % 30 < 15 ? '#e03a3a' : '#fff') : '#fff';
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(VW - 60, 2, 58, 11); Font.draw(g, 'START', VW - 57, 4, '#8a8a96'); Font.draw(g, fmtTime(secs), VW - 5, 4, tcol, { align: 'right' });
    // BRB
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(VW - 60, 15, 58, 11); Sprites.draw(g, 'brb', VW - 57, 16); Font.draw(g, 'x' + Game.brb, VW - 5, 17, Game.brb <= 1 ? '#e03a3a' : '#7bd23a', { align: 'right' });
    // form / perks
    let py = 28; const formName = { imp: '', head: 'Hafermilch', banana: 'Bananenhemd', ball: 'Basketball', marx: 'Marx-Ausweis' }[p.form]; if (formName) { Font.draw(g, formName, VW - 5, py, p.form === 'marx' && p.marxT < 180 && Game.frame % 20 < 10 ? '#e03a3a' : '#9be7ff', { align: 'right', shadow: true }); py += 9; }
    if (p.mate > 0) { Font.draw(g, 'MATE ' + Math.ceil(p.mate / 60), VW - 5, py, '#7bd23a', { align: 'right', shadow: true }); py += 9; }
    if (p.holf) { const names = { gold: 'HOLF GOLD', silver: 'HOLF SILBER', bronze: 'HOLF BRONZE', green: 'HOLF GRÜN' }; Font.draw(g, names[p.holf], VW - 5, py, '#ffd700', { align: 'right', shadow: true }); g.fillStyle = '#000'; g.fillRect(VW - 65, py + 9, 60, 3); g.fillStyle = '#ffd700'; g.fillRect(VW - 65, py + 9, 60 * clamp(p.holfT / 600, 0, 1), 3); py += 14; }
    const perks = Game.perksActive; perks.forEach((id, i) => { const pk = PERKS[id]; if (!pk) return; const x = VW - 5 - (perks.length - i) * 13; g.fillStyle = '#000'; g.fillRect(x, py, 11, 11); g.fillStyle = '#2a2a3a'; g.fillRect(x + 1, py + 1, 9, 9); let frac = 0; if (id === 'satire') frac = p.satireCd.frac; if (id === 'doppel') frac = p.doppelCd.frac; if (id === 'bart') frac = p.bartCd.frac; if (id === 'modruf' && p.modrufUsed) frac = 1; if (id === 'verplant' && p.verplantUsed) frac = 1; if (frac > 0) { g.fillStyle = '#5a1a1a'; g.fillRect(x + 1, py + 1, 9, Math.round(9 * frac)); } Font.draw(g, pk.icon, x + 3, py + 3, frac >= 1 ? '#8a8a96' : '#fff'); });
    // signal / offline zone
    const sig = r.signalAt(p.cx); if (sig >= 0) { const x = VW / 2 - 14, y = 4; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x - 3, y - 2, 34, 13); for (let i = 0; i < 4; i++) { g.fillStyle = i < sig ? '#7bd23a' : '#3a3a44'; g.fillRect(x + i * 7, y + 8 - i * 2, 5, 2 + i * 2); } if (sig === 0 && Game.frame % 30 < 15) Font.draw(g, 'KEIN NETZ', VW / 2, y + 13, '#e03a3a', { align: 'center', shadow: true }); }
    if (Game.ticket) Font.draw(g, 'TICKET #' + Game.ticket.no + ' ' + fmtTime(Math.ceil(Game.ticket.ttl / 60)), VW / 2, 18, Game.ticket.ttl < 300 && Game.frame % 20 < 10 ? '#e03a3a' : '#7bd23a', { align: 'center', shadow: true });
    if (p.carry && p.carry.type === 'stecker') Font.draw(g, 'Stecker zur Buchse!', VW / 2, 28, '#7fd6ff', { align: 'center', shadow: true });
    if (Game.demonT && r.tileAtPx(p.cx, p.cy) === '$') Font.draw(g, 'DEMONETARISIERT', VW / 2, 28, '#f4d03f', { align: 'center', shadow: true });
    Banner.draw(g);
  }
};
