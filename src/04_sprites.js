/* =====================================================================
   04 sprites: Palette, Pixel-Strings, Sprite-Builder (eigene Pixelkunst)
   ===================================================================== */
const PAL = {
  k: '#101014', w: '#ffffff', s: '#f2c9a0', S: '#d9a878', h: '#2b1a12', b: '#4a3020', t: '#202028', g: '#7bd23a', j: '#3a5b8c', J: '#27405f',
  o: '#4a3020', r: '#e03a3a', R: '#a01c1c', y: '#f4d03f', Y: '#c9a227', O: '#f28c28', p: '#9146ff', P: '#6b2fc7', c: '#2fb8c9', C: '#1a7f8c',
  n: '#f472b6', N: '#c0397f', e: '#3fa34d', E: '#25702f', a: '#8c8c96', A: '#4c4c56', l: '#d4d4dc', m: '#8b5a2b', M: '#5c3a1a', q: '#f3e7c8',
  u: '#7fd6ff', U: '#2f6fc4', d: '#ffb347', D: '#c47a0f', z: '#fff3a8', x: '#ff5ad1', i: '#262638', v: '#b8e6b0', f: '#ffe1ec', B: '#c8a04a',
  G: '#a4e04a', T: '#ff8a5c', L: '#9be7ff', Q: '#5b4636', W: '#eaeaf5', V: '#6d4bd8', K: '#33333d', X: '#ff3b3b', Z: '#ffd700'
};

// ---- imp parts (16 wide) ----
const IMP_HEAD = [
  '.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhsssssshhh..', '..hhsskssksshh..', '..hhsssssssshh..',
  '..hhssbssbsshh..', '..hhsbbbbbbshh..', '..hhbbbbbbbbhh..', '...hbbbbbbbbh...', '....bbbbbbbb....', '.....bbbbbb.....'];
const IMP_HEAD_HURT = [
  '.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhsssssshhh..', '..hhskskskkshh..', '..hhsssssssshh..',
  '..hhssbkkbsshh..', '..hhsbbbbbbshh..', '..hhbbbbbbbbhh..', '...hbbbbbbbbh...', '....bbbbbbbb....', '.....bbbbbb.....'];
const IMP_HEAD_HAPPY = [
  '.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhsssssshhh..', '..hhskssssksshh.', '..hhsssssssshh..',
  '..hhsswwwwsshh..', '..hhsbbbbbbshh..', '..hhbbbbbbbbhh..', '...hbbbbbbbbh...', '....bbbbbbbb....', '.....bbbbbb.....'];
const IMP_TORSO = ['....tttttttt....', '..sttggggggtts..', '..sttgtggtgtts..', '..sttggggggtts..', '..s.tttttttt.s..', '....tttttttt....'];
const IMP_TORSO_UP = ['..s.tttttttt.s..', '..sttggggggtts..', '...ttgtggtgtt...', '...ttggggggtt...', '....tttttttt....', '....tttttttt....'];
const IMP_TORSO_OUT = ['....tttttttt....', 'sstttggggggtttss', '....tgtggtgt....', '....tggggggt....', '....tttttttt....', '....tttttttt....'];
const IMP_TORSO_THROW = ['....tttttttt....', '..sttggggggttts.', '..sttgtggtgttts.', '....tgggggggt...', '....tttttttt....', '....tttttttt....'];
const IMP_LEGS_IDLE = ['....jjjjjjjj....', '....jjj..jjj....', '....jjj..jjj....', '....jjj..jjj....', '...ooo....ooo...', '..oooo....oooo..'];
const IMP_LEGS_W1 = ['....jjjjjjjj....', '...jjj..jjjj....', '..jjj....jjj....', '.jjj......jjj...', 'ooo........ooo..', 'ooo........ooo..'];
const IMP_LEGS_W3 = ['....jjjjjjjj....', '....jjjj..jjj...', '....jjj....jjj..', '...jjj......jjj.', '..ooo........ooo', '..ooo........ooo'];
const IMP_LEGS_JUMP = ['....jjjjjjjj....', '...jjjj..jjjj...', '...jjj....jjj...', '..ojj......jjo..', '..ooo......ooo..', '................'];
const IMP_DUCK = [
  '................', '................', '................', '................', '................', '................', '................', '................',
  '.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhsssssshhh..', '..hhsskssksshh..', '..hhsssssssshh..', '..hhssbssbsshh..', '..hhsbbbbbbshh..',
  '..hhbbbbbbbbhh..', '...hbbbbbbbbh...', '..sttbbbbbbtts..', '..sttggggggtts..', '....tttttttt....', '....jjjjjjjj....', '..ooojjjjjjooo..', '..oooo....oooo..'];
const IMP_GLIDE = [ // arms spread wide, shirt flaps
  '.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhsssssshhh..', '..hhsskssksshh..', '..hhsssssssshh..',
  '..hhssbssbsshh..', '..hhsbbbbbbshh..', '..hhbbbbbbbbhh..', '...hbbbbbbbbh...', '....bbbbbbbb....', 's....bbbbbb....s',
  'tt..tttttttt..tt', 'ttttggggggggtttt', '.ttttgtggtgtttt.', '..tttggggggttt..', '....tttttttt....', '....tttttttt....',
  '....jjjjjjjj....', '....jjj..jjj....', '....jjj..jjj....', '....jjj..jjj....', '...ooo....ooo...', '..oooo....oooo..'];
const IMP_OVER_CAP = { 0: '....rrrrrrrr....', 1: '...rrrrrrrrrrrr.', 2: '...rrrrrrrrrr...' };
const IMP_OVER_HEADSET = { 1: '...AAAAAAAAAA...', 2: '..AAhhhhhhhhAA..', 4: '..AAsskssksAA...'.slice(0, 14) + '..', 5: '..AAsssssssAA...'.slice(0, 14) + '..' };
const IMP_OVER_HEADSET2 = { 1: '...AAAAAAAAAA...', 4: '.AA..........AA.', 5: '.AA..........AA.', 6: '.AA..........AA.' };

function composeImp(head, torso, legs, overlay, palMap) {
  let rows = head.concat(torso, legs);
  if (overlay) rows = rows.map((r, i) => overlay[i] ? mergeRow(r, overlay[i]) : r);
  if (palMap) rows = rows.map(r => r.replace(/./g, ch => palMap[ch] || ch));
  return rows;
}
function mergeRow(base, over) { let out = ''; for (let i = 0; i < base.length; i++) out += (over[i] && over[i] !== '.') ? over[i] : base[i]; return out; }
function remap(rows, palMap) { return rows.map(r => r.replace(/./g, ch => palMap[ch] || ch)); }

const SPR = {};
function def(name, rows, opts) { SPR[name] = { rows, w: Math.max(...rows.map(r => r.length)), h: rows.length, opts: opts || {} }; }

// imp frames ----------------------------------------------------------
const impFrames = {
  idle: [IMP_HEAD, IMP_TORSO, IMP_LEGS_IDLE], walk1: [IMP_HEAD, IMP_TORSO, IMP_LEGS_W1], walk3: [IMP_HEAD, IMP_TORSO, IMP_LEGS_W3],
  jump: [IMP_HEAD, IMP_TORSO_UP, IMP_LEGS_JUMP], fall: [IMP_HEAD, IMP_TORSO_OUT, IMP_LEGS_JUMP], hurt: [IMP_HEAD_HURT, IMP_TORSO_OUT, IMP_LEGS_W1],
  carry: [IMP_HEAD, IMP_TORSO_UP, IMP_LEGS_IDLE], carryw1: [IMP_HEAD, IMP_TORSO_UP, IMP_LEGS_W1], carryw3: [IMP_HEAD, IMP_TORSO_UP, IMP_LEGS_W3],
  throw: [IMP_HEAD, IMP_TORSO_THROW, IMP_LEGS_IDLE], happy: [IMP_HEAD_HAPPY, IMP_TORSO_UP, IMP_LEGS_IDLE], win: [IMP_HEAD_HAPPY, IMP_TORSO_UP, IMP_LEGS_JUMP]
};
const impVariants = {
  imp: { overlay: null, pal: null }, head: { overlay: IMP_OVER_HEADSET2, pal: null }, banana: { overlay: IMP_OVER_HEADSET2, pal: { t: 'c', g: 'y' } },
  ball: { overlay: IMP_OVER_CAP, pal: null }, marx: { overlay: null, pal: { h: 'l', b: 'l', t: 'K', g: 'K' } },
  batik: { overlay: IMP_OVER_HEADSET2, pal: { t: 'O', g: 'x' } }, cap: { overlay: IMP_OVER_CAP, pal: null }
};
for (const v in impVariants) {
  const vv = impVariants[v];
  for (const f in impFrames) { const p = impFrames[f]; def(v + '_' + f, composeImp(p[0], p[1], p[2], vv.overlay, vv.pal)); }
  def(v + '_duck', remap(vv.overlay === IMP_OVER_CAP ? IMP_DUCK.map((r, i) => i >= 8 && IMP_OVER_CAP[i - 8] ? mergeRow(r, IMP_OVER_CAP[i - 8]) : r) : IMP_DUCK, vv.pal || {}));
  def(v + '_glide', remap(vv.overlay ? IMP_GLIDE.map((r, i) => vv.overlay[i] ? mergeRow(r, vv.overlay[i]) : r) : IMP_GLIDE, vv.pal || {}));
}
// Karl Marx (same silhouette) ---------------------------------------------
const MARX_HEAD = [
  '....lllllllll...', '...lllllllllll..', '..lllllllllllll.', '..llsssssssslll.', '..llsskssksslll.', '..llsssssssslll.',
  '..llsslllsssll..', '..llsllllllsll..', '..lllllllllllll.', '...lllllllllll..', '....lllllllll...', '.....lllllll....'];
const MARX_TORSO = ['....KKwwwwKK....', '..sKKKwKKwKKKs..', '..sKKKKwwKKKKs..', '..sKKKKKKKKKKs..', '..s.KKKKKKKK.s..', '....KKKKKKKK....'];
def('marx_idle', MARX_HEAD.concat(MARX_TORSO, remap(IMP_LEGS_IDLE, { j: 'K', o: 'k' })));
def('marx_walk1', MARX_HEAD.concat(MARX_TORSO, remap(IMP_LEGS_W1, { j: 'K', o: 'k' })));
def('marx_walk3', MARX_HEAD.concat(MARX_TORSO, remap(IMP_LEGS_W3, { j: 'K', o: 'k' })));
def('marx_bust', [
  '....lllllllll...', '...lllllllllll..', '..lllllllllllll.', '..llsssssssslll.', '..llsskssksslll.', '..llsssssssslll.', '..llsslllsssll..', '..llsllllllsll..',
  '..lllllllllllll.', '...lllllllllll..', '....lllllllll...', '...aaalllllaaa..', '..aaaaaaaaaaaa..', '...AAAAAAAAAA...', '....AAAAAAAA....', '..AAAAAAAAAAAA..']);
def('marx_card', ['aaaaaaaaaaaa', 'allllwwwwwwa', 'alslswwwwwwa', 'alllwwwrrwwa', 'allllwwwwwwa', 'aaaaaaaaaaaa']);
// Luigi ---------------------------------------------------------------------
const LUD = [
  '.....eeeeee.....', '....eewwwweee...', '...eeewewewee...', '..eeeeeeeeeeeee.', '....MMssssMM....', '....Msskssks....', '.....ssssss.....',
  '.....sMMMMs.....', '.....ssssss.....', '......ssss......', '.....eeeeee.....', '....seeeeees....', '....seeeeees....', '....seeeeees....',
  '....s.eeee.s....', '......eeee......', '......JJJJ......', '......JJJJ......', '......JJJJ......', '......JJJJ......', '......JJJJ......',
  '......JJJJ......', '......JJJJ......', '.....JJ..JJ.....', '.....JJ..JJ.....', '.....JJ..JJ.....', '....ooo..ooo....', '....ooo..ooo....'];
def('luigi_idle', LUD);
def('luigi_walk', LUD.slice(0, 23).concat(['....JJJ..JJJ....', '...JJJ....JJJ...', '..JJJ......JJJ..', '.ooo........ooo.', '.ooo........ooo.']));
def('luigi_hammer', LUD.map((r, i) => i === 10 ? '.....eeeeeeAA...' : i === 11 ? '....seeeeeeAA...' : i === 9 ? '......ssss.AA...' : i === 8 ? '.....ssssss.AA..' : i >= 4 && i <= 7 ? mergeRow(r, '.............AAA') : r));
// Sinan ------------------------------------------------------------------------
const SINAN = [
  '.....rrrrrr.....', '....rrrrrrrrrr..', '...rrrrrrrrrrrr.', '....ssssssss....', '...skkkkskkkks..', '....ssssssss....', '....sssssbss....', '.....ssssss.....',
  '......ssss......', '....wwwwwwww....', '...wwwwwwwwww...', '..swwwwlwwwwws..', '..swwwwlwwwwws..', '..swwwlllwwwws..', '..s.wwwwwwww.s..', '....wwwwwwww....',
  '....aaaaaaaa....', '....aaa..aaa....', '....aaa..aaa....', '....aaa..aaa....', '....aaa..aaa....', '...www....www...', '..wwww....wwww..', '................'];
def('sinan_idle', SINAN);
def('sinan_flex', SINAN.map((r, i) => i === 9 ? 's..wwwwwwwwww..s' : i === 10 ? 'sswwwwwwwwwwwwss' : i === 11 ? '.wwwwwwlwwwwwww.' : i === 12 ? '..wwwwwlwwwwww..' : i === 13 ? '...wwwlllwww....' : i === 14 ? '....wwwwwwww....' : r));
def('sinan_ball', ['..OOOO..', '.OOkOOO.', 'OOOkOOOO', 'OkkkkkkO', 'OOOkOOOO', 'OOOkOOOO', '.OOkOOO.', '..OOOO..']);
// Baba der Bär (32x32) -----------------------------------------------------------
const BABA = [
  '....nnnn................nnnn....', '...nnffnn..............nnffnn...', '...nnffnnnnnnnnnnnnnnnnnnffnn...', '....nnnnnnnnnnnnnnnnnnnnnnnn....',
  '......nnnnnnnnnnnnnnnnnnnn......', '......nnnnssssssssssssnnnn......', '......nnnsYYYYYssYYYYYsnnn......', '......nnnsYAAAYssYAAAYsnnn......',
  '......nnnsYAAAYYYYAAAYsnnn......', '......nnnssYYYssssYYYssnnn......', '......nnnsssssssssssssnnnn......', '......nnnssbbbbbbbbbbsnnnn......',
  '......nnnnbbbbbbbbbbbbnnnn......', '.......nnnbbbbbbbbbbbnnnn.......', '........nnnbbbbbbbbbnnnn........', '.........nnnnnnnnnnnnn..........',
  '......nnnnnnnnnnnnnnnnnnnn......', '.....nnnnnnnnnnnnnnnnnnnnnn.....', '....nnnnnnnnNNNNNNNNnnnnnnnn....', '....nnnnnnNNNNNNNNNNNNnnnnnn....',
  '....nnnnnNNNNNNNNNNNNNNnnnnn....', '....nnnnnNNNNNNNNNNNNNNnnnnn....', '....nnnnnNNNNNNNNNNNNNNnnnnn....', '....nnnnnnNNNNNNNNNNNNnnnnnn....',
  '.....nnnnnnnNNNNNNNNnnnnnnn.....', '......nnnnnnnnnnnnnnnnnnnn......', '.......nnnnnnnnnnnnnnnnnn.......', '.......nnnnnn......nnnnnn.......',
  '......nnnnnnn......nnnnnnn......', '......nnnnnnn......nnnnnnn......', '.....nnnNnnnn......nnnnNnnn.....', '.....nnnnnnnn......nnnnnnnn.....'];
def('baba_idle', BABA);
def('baba_sleep', BABA.map((r, i) => (i === 7 || i === 8) ? r.replace(/A/g, 'Y') : i === 6 ? '......nnnsYYYYYssYYYYYsnnn......' : r));
def('baba_throw', BABA.map((r, i) => i >= 8 && i <= 15 ? mergeRow(r, '............................nnnn') : i >= 4 && i <= 7 ? mergeRow(r, '.............................nnn') : r));
def('baba_pot', ['..DDDDDDDD..', '.DddddddddD.', 'DDDDDDDDDDDD', '.DdddyyddddD', '.DddddddddD.', '.DdddyydddD.', '..DDDDDDDD..']);
def('baba_small', [ // 16x16 hub/cutscene version
  '.nn..........nn.', 'nnnnnnnnnnnnnnnn', '.nnssssssssssnn.', '.nnsYYYssYYYsnn.', '.nnsYAYssYAYsnn.', '.nnssssssssssnn.', '.nnsbbbbbbbbsnn.', '.nnnbbbbbbbbnnn.',
  '..nnnnnnnnnnnn..', '.nnnnNNNNNNnnnn.', '.nnnNNNNNNNNnnn.', '.nnnNNNNNNNNnnn.', '.nnnnNNNNNNnnnn.', '..nnnnnnnnnnnn..', '..nnnn....nnnn..', '..nnnn....nnnn..']);
def('soletti', ['mmmmmmmmmmmmmmmm', 'mwmmmwmmmwmmmwmm', 'mmmmmmmmmmmmmmmm']);
def('honey_puddle', ['....dddddddd....', '..dddddddddddd..', 'dddddddddddddddd']);
// Drachenlord (24x32) ------------------------------------------------------------
const DL = [
  '........BBBBBBBB........', '......BBBBBBBBBBBB......', '.....BBBBBBBBBBBBBB.....', '.....BBBssssssssBBB.....', '.....BBsskssskssBBB.....',
  '.....BBssssssssssBB.....', '.....BBsssBBBBsssBB.....', '......BssBBBBBBssB......', '......ssBBBBBBBBss......', '.......BBBBBBBBBB.......',
  '....sstttttttttttss.....', '...ssstttwwwwwttttsss...', '..sssstwwwwwwwwwtssss...', '..sssstwwwkwkwwwtsssss..', '..sssstwwkkkkkwwtsssss..',
  '..sssstwwwkkkwwwtsssss..', '.sssssttwwwwwwwttssssss.', '.ssssstttwwwwwtttssssss.', '.sssssttttttttttttsssss.', '.ssss.tttttttttttt.ssss.',
  '.ssss.tttttttttttt.ssss.', '.sss..tttttttttttt..sss.', '......tttttttttttt......', '......jjjjjjjjjjjj......', '......jjjjjjjjjjjj......',
  '......jjjjj..jjjjj......', '......jjjjj..jjjjj......', '......jjjjj..jjjjj......', '......jjjjj..jjjjj......', '.....ooooo....ooooo.....',
  '....oooooo....oooooo....', '....oooooo....oooooo....'];
def('dl_idle', DL);
def('dl_walk', DL.slice(0, 25).concat(['.....jjjjjj..jjjjjj.....', '....jjjjj......jjjjj....', '...jjjjj........jjjjj...', '...jjjj..........jjjj...', '..ooooo..........ooooo..', '.oooooo..........oooooo.', '.oooooo..........oooooo.']));
def('dl_ball1', [
  '.......BBBBBBBBBB.......', '.....BBBBBBBBBBBBBB.....', '....BBBBsssssssBBBBB....', '...BBBsssssssssssBBBB...', '..BBBssssttttttssssBBB..', '..BBssssttttttttssssBB..',
  '.BBsssstttwwwwtttsssBBB.', '.BBssssttwwwwwwttssssBB.', 'BBsssstttwwwwwwtttssssBB', 'BBssssttttwwwwttttssssBB', 'BBsssstttttttttttssssBBB', 'BBssssstttttttttsssssBBB',
  'BBBsssssttttttttssssBBBB', 'BBBsssssssttttsssssssBBB', 'BBBBsssssssssssssssBBBBB', '.BBBBsssssssssssssBBBBB.', '.BBBBBsssssssssssBBBBBB.', '..BBBBBBsssssssBBBBBBB..',
  '..BBBBBBBBBBBBBBBBBBBB..', '...BBBBBBBBBBBBBBBBBB...', '....BBBBBBBBBBBBBBBB....', '.....BBBBBBBBBBBBBB.....', '.......BBBBBBBBBB.......', '........................']);
def('dl_ball2', [
  '.......BBBBBBBBBB.......', '.....BBBBBBBBBBBBBB.....', '....BBBBBBBBBBBBBBBB....', '...BBBBBsssssssBBBBBB...', '..BBBBssssssssssssBBBB..', '..BBBssssssttttsssssBB..',
  '.BBBssssstttttttsssssBB.', '.BBsssssttttwwtttsssssB.', 'BBsssssttttwwwwtttsssssB', 'BBssssstttwwwwwwtttsssBB', 'BBssssstttwwwwwwtttsssBB', 'BBsssssttttwwwwtttssssBB',
  'BBsssssstttttttttsssssBB', 'BBBsssssstttttttssssssBB', 'BBBsssssssstttssssssBBBB', '.BBBBssssssssssssssBBBB.', '.BBBBBsssssssssssssBBBB.', '..BBBBBBsssssssssBBBBB..',
  '..BBBBBBBBBBBBBBBBBBBB..', '...BBBBBBBBBBBBBBBBBB...', '....BBBBBBBBBBBBBBBB....', '.....BBBBBBBBBBBBBB.....', '.......BBBBBBBBBB.......', '........................']);
// ---- enemies ----------------------------------------------------------------
def('kartoni_1', ['mmmmmmmmmmmmmmmm', 'mMMMMMMMMMMMMMMm', 'mMmmmmmmmmmmmmMm', 'mMmmkmmmmmmkmmMm', 'mMmmmmmmmmmmmmMm', 'mMmmmmmkkmmmmmMm', 'mMmmmmmmmmmmmmMm', 'mMMMMMMMMMMMMMMm', 'mmmmmmmmmmmmmmmm', 'mmmqqqqqqqqqqmmm', 'mmmqIMPqqqqqqmmm'.replace('IMP', 'kkk'), 'mmmqqqqqqqqqqmmm', 'mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm', '.oo..........oo.', 'ooo..........ooo']);
def('kartoni_2', SPR.kartoni_1.rows.slice(0, 14).concat(['..oo........oo..', '..oo........oo..']));
def('kartoni_flat', ['mmmmmmmmmmmmmmmm', 'mMMMMMMMMMMMMMMm', 'mMmmkmmmmmmkmmMm', 'mMMMMMMMMMMMMMMm', 'mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm']);
const GRILL = [
  '....wwwwwwww....', '...wwwwwwwwww...', '....ssssssss....', '....skssskss....', '....ssssssss....', '.....sssbss.....', '......ssss......', '....rrrrrrrr....',
  '...srrwwwwrrs...', '...srrwrrwrrs...', '...srrwwwwrrs...', '..a.rrrrrrrr.s..', '.aa.rrrrrrrr.s..', 'aa..rrrrrrrr....', '....jjjjjjjj....', '....jjj..jjj....',
  '....jjj..jjj....', '....jjj..jjj....', '...ooo....ooo...', '..oooo....oooo..', '................', '................', '................', '................'];
def('grill_1', GRILL);
def('grill_2', GRILL.map((r, i) => i === 15 ? '...jjj....jjj...' : i === 16 ? '..jjj......jjj..' : i === 17 ? '.jjj........jjj.' : i === 18 ? 'ooo..........ooo' : i === 19 ? 'ooo..........ooo' : r));
def('sepp_1', GRILL.map((r, i) => i === 0 ? '....AAAAAAAA....' : i === 1 ? '...AAAAAAAAAA...' : i === 2 ? '..AAAAAAAAAAAA..' : i === 3 ? '....skssskss....' : r));
def('sepp_2', SPR.grill_2.rows.map((r, i) => i === 0 ? '....AAAAAAAA....' : i === 1 ? '...AAAAAAAAAA...' : i === 2 ? '..AAAAAAAAAAAA..' : r));
def('wurst', ['..mmmmmmmm..', '.mTTTTTTTTm.', 'mTTTTTTTTTTm', '.mTTTTTTTTm.', '..mmmmmmmm..']);
def('wurst_spiky', ['..k.k.k.k...', '.kTTTTTTTTk.', 'kTTTTTTTTTTk', '.kTTTTTTTTk.', '..k.k.k.k...']);
def('tofu', ['..wwwwwwwwww..', '.wwwqqqqqqqqw.', 'wwqqqqqqqqqqqw', 'wwqqqqqqqqqqqw', 'wwqqqqqqqqqqqw', 'wwqqqqqqqqqqqw', '.wwwwwwwwwwww.', '..wwwwwwwwww..']);
def('cloud', ['......aaaaaaaa..........', '....aaaaaaaaaaaa........', '..aaaaaaaaaaaaaaaaaa....', '.aaaaakaaaaaakaaaaaaa...', 'aaaaaaaaaaaaaaaaaaaaaaa.', 'aaaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaa', '.aaaaaaaaaaaaaaaaaaaaaa.', '..aaaaaaaaaaaaaaaaaaaa..', '....aaaaaaaaaaaaaaaa....', '......aaaaaaaaaaaa......', '........aaaaaaaa........']);
def('troll_1', ['....gggggggg....', '...gggggggggg...', '...ggkgggggkg...', '...gggggggggg...', '...ggggkkkggg...', '....gggggggg....', '..aaaaaaaaaaaa..', '..aAAAAAAAAAAa..', '..aAuuuuuuuuAa..', '..aAuuuuuuuuAa..', '..aAAAAAAAAAAa..', '..aaaaaaaaaaaa..', '..gg........gg..', '..gg........gg..', '.ggg........ggg.', '.ggg........ggg.']);
def('troll_2', SPR.troll_1.rows.map((r, i) => i === 12 ? '...gg......gg...' : i === 13 ? '...gg......gg...' : i === 14 ? '..ggg......ggg..' : i === 15 ? '..ggg......ggg..' : r));
def('bubble_hate', ['wwwwwwwwwwww', 'wrrrwwwrrrww', 'wwrrrwrrrwww', 'wwwrrrrrwwww', 'wwrrrwrrrwww', 'wrrrwwwrrrww', 'wwwwwwwwwwww', '.ww.........', 'w...........']);
def('kabel_1', ['....yyyy........', '...yyyyyy.......', '..yykyyyky......', '..yyyyyyyy......', '..yyyykkyy......', '...yyyyyy.......', '..yy.yyyy.yy....', '.yy..yyyy..yy...', '.yy.yyyyyy.yy...', '..yyyyyyyyyy....', '...yyy..yyy.....', '....yy..yy......', '....yyyyyy......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......', '.....yyyy.......']);
def('kabel_2', SPR.kabel_1.rows.map((r, i) => i === 2 ? '..yyyyyyyy......' : i === 4 ? '..yykyyyky......' : i === 6 ? '....yyyyyy......' : i === 7 ? '...yyyyyyyy.....' : i === 8 ? '..yyyyyyyyyy....' : r));
const TECH = [
  '....OOOOOOOO....', '...OOOOOOOOOO...', '..OOOOOOOOOOOO..', '....ssssssss....', '....skssskss....', '....ssssssss....', '....sssbbsss....', '.....ssssss.....',
  '....rrrrrrrr....', '...srrrrrrrrs...', '...srrwwwwrrs...', '...srrrrrrrrs...', '...srrrrrrrrs...', '....rrrrrrrr....', '....jjjjjjjj....', '....jjj..jjj....',
  '....jjj..jjj....', '....jjj..jjj....', '...ooo....ooo...', '..oooo....oooo..', '................', '................', '................', '................'];
def('torben_1', TECH.map((r, i) => i === 9 ? '...srrrrrrrrsAA.' : i === 10 ? '...srrwwwwrrsAAA' : i === 11 ? '...srrrrrrrrsAA.' : i === 12 ? '...srrrrrrrr.kkk' : r));
def('torben_2', SPR.torben_1.rows.map((r, i) => i === 15 ? '...jjj....jjj...' : i === 16 ? '..jjj......jjj..' : i === 17 ? '.jjj........jjj.' : i === 18 ? 'ooo..........ooo' : i === 19 ? 'ooo..........ooo' : r));
def('kevin_1', TECH.map((r, i) => i >= 3 && i <= 13 ? mergeRow(r, i % 3 === 0 ? '.aaaa...........' : '.a..a...........') : r));
def('kevin_2', SPR.kevin_1.rows.map((r, i) => i === 15 ? '...jjj....jjj...' : i === 16 ? '..jjj......jjj..' : i === 17 ? '.jjj........jjj.' : i === 18 ? 'ooo..........ooo' : i === 19 ? 'ooo..........ooo' : r));
def('kabelbinder', ['kkkkkkkk', 'k......k', 'kkkkkkkk']);
def('router', ['.a....a....a....', '.a....a....a....', '.a....a....a....', '.a....a....a....', 'AAAAAAAAAAAAAAAA', 'AKKKKKKKKKKKKKKA', 'AKrKgKgKgKrKKKKA', 'AKKKKKKKKKKKKKKA', 'AAAAAAAAAAAAAAAA', 'AAAAAAAAAAAAAAAA', 'AKKKKKKKKKKKKKKA', 'AKKrKKKrKKKrKKKA', 'AKKKKKKKKKKKKKKA', 'AAAAAAAAAAAAAAAA', '.AAAAAAAAAAAAAA.', '.AAAAAAAAAAAAAA.']);
def('ping', ['..uuuu..', '.u....u.', 'u......u', 'u......u', 'u......u', 'u......u', '.u....u.', '..uuuu..']);
def('ordner', ['aaaaaaaaaaaaaaaa', 'aAAAAAAAAAAAAAAa', 'aAwwwwwwwwwwwwAa', 'aAwkkwwwkwkwwwAa', 'aAwwwwwwwwwwwwAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAkAAAAAAAAkAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAkkkkAAAAAa', 'aAAAAkAAAAkAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aaaaaaaaaaaaaaaa']);
def('formular', ['qqqqqqqqqqqq', 'qkkkkqqkkkqq', 'qqqqqqqqqqqq', 'qkkkkkkkkqqq', 'qqqqqqqqqqqq', 'qkkkkkkkkkkq', 'qqqqqqqqqqqq', 'qkkkkkkqqqqq', 'qqqqqqqqqqqq', 'qqqqqqqqkkkq', 'qqqqqqqqrrrq', 'qqqqqqqqqqqq']);
const SACH = [
  '....aaaaaaaa....', '...aaaaaaaaaa...', '....ssssssss....', '...skkkssskkks..', '....ssssssss....', '....sssssbss....', '.....ssssss.....', '....AAAAAAAA....',
  '...sAAqqqqAAs...', '...sAAqrrqAAs...', '...sAAqqqqAAs...', '...sAAAAAAAAs...', '...sAAAAAAAAs...', '....AAAAAAAA....', '....AAAAAAAA....', '....AAA..AAA....',
  '....AAA..AAA....', '....AAA..AAA....', '...kkk....kkk...', '..kkkk....kkkk..', '................', '................', '................', '................'];
def('sach_1', SACH); def('sach_2', SACH.map((r, i) => i === 15 ? '...AAA....AAA...' : i === 16 ? '..AAA......AAA..' : i === 18 ? '.kkk........kkk.' : i === 19 ? '.kkk........kkk.' : r));
def('stempel', ['..mmmmmm..', '..mmmmmm..', '...mmmm...', '...mmmm...', 'rrrrrrrrrr', 'rrrrrrrrrr']);
def('haider', ['....BBBB....', '...BBBBBB...', '...ssssss...', '...sksskss..', '...ssssss...', '....ssss....', '...tttttt...', '..sttttttts.', '..sttttttts.', '....tttt....', '....jjjj....', '....jj.jj...']);
def('egg', ['..ww..', '.wwww.', 'wwwwww', 'wwwwww', '.wwww.', '..ww..']);
def('wiener_1', ['......yyyy......', '.....yyyyyy.....', '......yyyy......', '....mTTTTTTm....', '...mTTTTTTTTm...', '..mTTkTTTTkTTm..', '..mTTTTTTTTTTm..', '..mTTTTTTTTTTm..', '..mTTTkkkkTTTm..', '..mTTTTTTTTTTm..', '..mTTTTTTTTTTm..', '..mTTTTTTTTTTm..', '...mTTTTTTTTm...', '....mTTTTTTm....', '....oo....oo....', '...ooo....ooo...']);
def('wiener_2', SPR.wiener_1.rows.map((r, i) => i === 14 ? '.....oo..oo.....' : i === 15 ? '....ooo..ooo....' : r));
def('fiaker', [
  '..........kkkkkkkkkkkk..........', '.........kKKKKKKKKKKKKk.........', '.........kKKKKKKKKKKKKk.........', '.........kKKKuuKKKuuKKk.........', 'MMMM.....kKKKuuKKKuuKKk.........', 'MMMMMM...kKKKKKKKKKKKKk..s......',
  'MMMMMMM..kKKKKKKKKKKKKk.tttt....', 'MMMMMMMM.kKKKKKKKKKKKKk.tttt....', 'MMMMMMMM.kkkkkkkkkkkkkk.tttt....', '.MMMMMM..kkkkkkkkkkkkkk.........', '.MMMMMM...aaaaaaaaaaaa..........', '.MM.MM.....aaa....aaa...........',
  '.MM.MM.....a.a....a.a...........', '.MM.MM.....aaa....aaa...........', 'oMMoMM..........................', '................................']);
def('sisi', ['....ZZZZZZZZ....', '...ZZZzZZzZZZ...', '..llllllllllll..', '.llllsssssslll..', '.llllskssksllll.', '.llllsssssslll..', '.lllllssssllll..', '..llllllllllll..', '..llllllllllll..', '...llllllllll...', '...llllllllll...', '..llllllllllll..', '..ll.llllll.ll..', '.ll..ll.ll..ll..', '.....ll.ll......', '................']);
def('holdghost', ['....llllllll....', '...llllllllll...', '..llllllllllll..', '..llkkllllkkll..', '..llkkllllkkll..', '..llllllllllll..', '..lllkkkkkklll..', '..llllllllllll..', '..llAAAAAAAAll..', '..llArArArArll..', '..llAAAAAAAAll..', '..llllllllllll..', '..llllllllllll..', '..ll.llllll.ll..', '.ll..ll..ll..ll.', '................', '................', '................', '................', '................']);
def('bee', ['..kk....', '.kyyk...', 'kyykyyk.', 'kyyyyyyk', '.kykykk.', '..wwww..', '..w..w..', '........']);
def('hive', ['....dddddddd....', '..dddddddddddd..', '.dDDDDDDDDDDDDd.', 'dddddddddddddddd', 'dDDDDDDDDDDDDDDd', 'dddddddddddddddd', 'dDDDDDDkkDDDDDDd', 'ddddddkkkkdddddd', 'dDDDDDkkkkDDDDDd', 'ddddddddddddddddd'.slice(0, 16), '.dDDDDDDDDDDDDd.', '..dddddddddddd..', '....dddddddd....', '................', '................', '................']);
def('gnom', ['....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '...ssssss...', '...sksskss..', '...ssssss...', '..llllllll..', '.lllllllll..', '..llllllll..', '...AAAAAA...', '..sAAkkAAs..', '..sAAkkAAs..', '...AAAAAA...', '...AA..AA...', '...AA..AA...', '..kkk..kkk..']);
def('dieb', ['....tttttttt....', '...tttttttttt...', '...ttkkkkkktt...', '...tkkskkskkt...', '...ttkkkkkktt...', '....ssssssss....', '.....ssssss.....', '....tttttttt....', '...sttttttttss..', '...sttwtwttsppp.', '...sttttttttppp.', '....tttttttt.pp.', '....tttttttt....', '....tttttttt....', '....jjjjjjjj....', '....jjj..jjj....', '....jjj..jjj....', '....jjj..jjj....', '...ooo....ooo...', '..oooo....oooo..', '................', '................', '................', '................']);
def('dieb_2', SPR.dieb.rows.map((r, i) => i === 15 ? '...jjj....jjj...' : i === 16 ? '..jjj......jjj..' : i === 17 ? '.jjj........jjj.' : i === 18 ? 'ooo..........ooo' : i === 19 ? 'ooo..........ooo' : r));
def('hotline_1', ['....rrrrrrrr....', '..rrrrrrrrrrrr..', '.rrRRRRRRRRRRrr.', 'rrRRRRRRRRRRRRrr', 'rrRRwwRRRRwwRRrr', 'rrRRwwRRRRwwRRrr', 'rrRRRRRRRRRRRRrr', 'rrRRRwwwwwwRRRrr', 'rrRRRRRRRRRRRRrr', '.rrrrrrrrrrrrrr.', '..rrrrrrrrrrrr..', '.kkkkkkkkkkkkkk.', 'kkkkkkkkkkkkkkkk', '.kk..........kk.', '..kk........kk..', '................']);
def('hotline_2', SPR.hotline_1.rows.map((r, i) => i === 13 ? '.kk....kk....kk.' : i === 14 ? '..kk..kk....kk..' : r));
def('cookie', ['...mmmmmm...', '..mmmmmmmm..', '.mmMmmmmMmm.', 'mmmmmmmmmmmm', 'mmmMmmmMmmmm', 'mmmmmmmmmmmm', 'mmkmmmmmmkmm', 'mmmmmmmmmmmm', 'mMmmmmmmmmMm', 'mmmmmMmmmmmm', '.mmmmmmmmmm.', '..mmmmmmmm..']);
def('ratte', ['..........aaa...', '.........aaaaa..', 'a.......aakaaak.', '.aaaaaaaaaaaaaa.', '..aaaaaaaaaaaa..', '..aa.aa..aa.aa..', '................', '................']);
def('barth', [ // Mario Barth: blond, blue shirt, grin
  '....BBBBBBBB....', '...BBBBBBBBBB...', '...BBssssssBB...', '....skssskss....', '....ssssssss....', '....swwwwwws....', '.....ssssss.....', '....UUUUUUUU....',
  '...sUUUUUUUUs...', '..ssUUUUUUUUss..', '..s.UUUUUUUU.s..', '....UUUUUUUU....', '....UUUUUUUU....', '....UUUUUUUU....', '....jjjjjjjj....', '....jjj..jjj....',
  '....jjj..jjj....', '....jjj..jjj....', '...kkk....kkk...', '..kkkk....kkkk..', '................', '................', '................', '................']);
def('jet', ['..........................ll....', '.........................lll....', '........................llll....', 'l......................lllll....', 'llllllllllllllllllllllllllllll..', 'lllllllllwwwwwwwwwwwlllllllllll.', 'llllllllluuuuuuuuuuulllllllllll.', '.lllllllllllllllllllllllllllll..', '..lllll..........lllll..........', '....lll..............lll........', '.....................l..........', '................................']);
def('koffer', ['..MMMMMM..', '.MmmmmmmM.', 'MMMMMMMMMM', 'MmmmmYmmmM', 'MmmmmmmmmM', 'MMMMMMMMMM']);
def('zoll', [ // Zollschranke Kopf 16x16 (Trump-Frisur + Schranke)
  '..yyyyyyyyyy....', '.yyyyyyyyyyyy...', 'yyyyyyyyyyyyyy..', 'yyyssssssssyyy..', 'yyOOOOOOOOOOyy..', '.yOOkOOOOkOOy...', '..OOOOOOOOOO....', '..OOOOwwOOOO....', '...OOOOOOOO.....', '....OOOOOO......', '.....ZZZZ.......', '.....ZZZZ.......', 'ZZZZZZZZZZZZZZZZ', 'ZZrrZZrrZZrrZZrr', 'ZZZZZZZZZZZZZZZZ', '................']);
def('hotspot', ['................', '.....u......u...', '....u..uuu...u..', '...u..u...u...u.', '..u..u..u..u..u.', '........u.......', 'KKKKKKKKKKKKKKKK', 'KAAAAAAAAAAAAAAK', 'KArAgAgAgAgAAAAK', 'KAAAAAAAAAAAAAAK', 'KKKKKKKKKKKKKKKK', '................']);
def('hotspot_off', SPR.hotspot.rows.map((r, i) => i < 6 ? '................' : r.replace(/g/g, 'A')));
def('ober', [
  '....hhhhhhhh....', '...hhhhhhhhhh...', '....ssssssss....', '....skssskss....', '....ssssssss....', '....ssskkkss....', '.....ssssss.....', '....kkkwwkkk....',
  '...skkkwwkkks...', '...skkkkkkkkls..', '...skkkkkkklll..', '...s.kkkkkkl.l..', '.....kkkkkk.....', '....wwwwwwww....', '....wwwwwwww....', '....wwwwwwww....',
  '....kkk..kkk....', '....kkk..kkk....', '...kkk....kkk...', '..kkkk....kkkk..', '................', '................', '................', '................']);
def('teller', ['..wwww..', '.wwwwww.', 'wwllllww', 'wwllllww', '.wwwwww.', '..wwww..']);
def('torte', ['..MMMMMM..', '.MMMMMMMM.', 'MMMMMMMMMM', 'MMrrMMrrMM', 'MMMMMMMMMM', 'wwwwwwwwww']);
def('volker', [
  '....hhhhhhhh....', '...hhhhhhhhhh...', '....ssssssss....', '....skssskss....', '....ssssssss....', '....sswwwwss....', '.....ssssss.....', '....UUUUUUUU....',
  '...sUUwwwwUUs...', '...sUUwrrwUUs...', '..uusUUwwwwUUs..', '..uusUUUUUUUU...', '..uu.UUUUUUUU...', '....UUUUUUUU....', '....AAAAAAAA....', '....AAA..AAA....',
  '....AAA..AAA....', '....AAA..AAA....', '...kkk....kkk...', '..kkkk....kkkk..', '................', '................', '................', '................']);
def('angebot', ['yyyyyyyyyyyy', 'ykkyyykkkyyy', 'yyyyyyyyyyyy', 'yyrrryyyrrry', 'yyyyyyyyyyyy', 'ykkkkkyykkky', 'yyyyyyyyyyyy']);
def('heu', ['....yyyyyyyy....', '..yyYyyyyyyYyy..', '.yyyyyYyyYyyyyy.', '.yYyyyyyyyyyyYy.', 'yyyyyYyyyyYyyyyy', 'yyYyyyyyyyyyyyYy', 'yyyyyyYyyYyyyyyy', 'yYyyyyyyyyyyyyYy', 'yyyyYyyyyyyYyyyy', 'yyyyyyyYyyyyyyyy', 'yYyyyyyyyyyYyyyy', 'yyyyYyyyyYyyyyyy', '.yyyyyyYyyyyyyy.', '.yYyyyyyyyyyYyy.', '..yyyyYyyyYyyy..', '....yyyyyyyy....']);
def('ticket', ['qqqqqqqqqqqq', 'qkkqqqqqqkkq', 'qqqqkkkkqqqq', 'qkkqqqqqqkkq', 'qqqqqqqqqqqq', 'qqrrrrrrrrqq', 'qqqqqqqqqqqq', 'qqqqqqqqqqqq']);
def('laterne', ['...kk...', '..kkkk..', '.kzzzzk.', '.kzyyzk.', '.kzyyzk.', '.kzzzzk.', '..kkkk..', '...kk...', '...kk...', '...kk...', '..kkkk..', '..kkkk..']);
def('coin', ['..ZZZZ..', '.ZZyyZZ.', 'ZZyyyyZZ', 'ZZyZZyZZ', 'ZZyZZyZZ', 'ZZyyyyZZ', '.ZZyyZZ.', '..ZZZZ..']);
def('stecker', ['....uuuuuuuu....', '..uuuUUUUUUuuu..', 'kkuuUUUUUUUUuukk', 'kkuuUUUUUUUUuukk', '..uuuUUUUUUuuu..', '....uuuuuuuu....', '......yyyy......', '......yyyy......', '......yyyy......', '......yyyy......']);
def('algo', (() => { // 48x48 eye in play-button
  const rows = []; for (let y = 0; y < 48; y++) { let r = ''; for (let x = 0; x < 48; x++) {
    const dx = x - 24, dy = y - 24; const d = Math.hypot(dx, dy * 1.3);
    let ch = '.';
    if (d < 21) ch = 'w'; if (d < 10) ch = 'U'; if (d < 5) ch = 'k'; if (d >= 21 && d < 23.5) ch = 'r';
    if ((x > 6 && x < 12 && y > 14 && y < 34 && d >= 21) || (x >= 12 && x < 26 && Math.abs(y - 24) < (26 - x) * 1.0 && d >= 21)) ch = 'R';
    if (dx === -6 && dy === -5) ch = 'w'; r += ch; } rows.push(r); } return rows; })());
def('algo_closed', SPR.algo.rows.map((r, y) => y > 18 && y < 30 ? r.replace(/[Uk]/g, 'l').replace(/w/g, y === 24 ? 'k' : 'l') : r));
def('nixi', (() => { // 64x64 telephone monster
  const rows = []; for (let y = 0; y < 64; y++) { let r = ''; for (let x = 0; x < 64; x++) {
    let ch = '.';
    if (y >= 20 && y < 62 && x >= 4 && x < 60) ch = (x < 6 || x >= 58 || y < 22 || y >= 60) ? 'R' : 'r';
    if (y >= 26 && y < 40 && x >= 12 && x < 52) ch = (y === 26 || y === 39 || x === 12 || x === 51) ? 'k' : 'v';
    if (y >= 44 && y < 58 && x >= 12 && x < 52) { const cx = (x - 12) % 13, cy = (y - 44) % 7; if (cx < 11 && cy < 5 && cx > 0 && cy > 0) ch = 'l'; else ch = 'R'; if (cx >= 11 || cy >= 5) ch = 'r'; }
    if (y >= 8 && y < 20 && x >= 8 && x < 56 && (x < 20 || x >= 44)) ch = (y < 10 || y >= 18 || (x >= 8 && x < 10) || (x >= 54 && x < 56) || x === 19 || x === 44) ? 'k' : 'A';
    if (y >= 12 && y < 18 && x >= 20 && x < 44) ch = (y === 12 || y === 17) ? 'k' : 'A';
    if (y < 8 && (x === 14 || x === 15 || x === 48 || x === 49)) ch = 'a';
    if (y < 3 && ((x >= 12 && x < 18) || (x >= 46 && x < 52))) ch = 'r';
    r += ch; } rows.push(r); } return rows; })());
// ---- friends' faces (portraits 24x24) --------------------------------------------------
def('face_imp', ['.....hhhhhhhhhhhhhh.....', '....hhhhhhhhhhhhhhhh....', '...hhhhhhhhhhhhhhhhhh...', '..hhhhhhhhhhhhhhhhhhhh..', '..hhhhsssssssssssshhhh..', '..hhhssssssssssssssshh..', '..hhhssssssssssssssshh..', '..hhssskkssssssskksshh..', '..hhssskkssssssskksshh..', '..hhssssssssssssssssshh.'.slice(0, 24), '..hhsssssssSSsssssssshh.'.slice(0, 24), '..hhsssssssSSssssssshh..', '..hhssbbssssssssbbsshh..', '..hhssbbbbssssbbbbsshh..', '..hhsbbbbbbbbbbbbbbshh..', '..hhbbbbbbbbbbbbbbbbhh..', '..hhbbbbbbbbbbbbbbbbhh..', '...hbbbbbbbbbbbbbbbbh...', '...hbbbbbbbbbbbbbbbbh...', '....bbbbbbbbbbbbbbbb....', '....bbbbbbbbbbbbbbbb....', '.....bbbbbbbbbbbbbb.....', '......bbbbbbbbbbbb......', '.......bbbbbbbbbb.......']);
def('face_luigi', ['.......eeeeeeeeee.......', '.....eeeeeeeeeeeeee.....', '....eeeewwwwwwwweeee....', '....eeeewewwwwewweee....', '....eeeewwewwewwweee....', '..eeeeeeeeeeeeeeeeeeee..', '..eeeeeeeeeeeeeeeeeeee..', '.....MMsssssssssMM......', '.....Mssssssssssss M....'.replace(' ', 's').slice(0, 24), '.....ssskksssskksss.....', '.....ssskksssskksss.....', '.....sssssssssssssss....', '.....ssssssSSssssss.....', '.....ssssssssssssss.....', '.....sssMMMMMMMMsss.....', '.....ssssssssssssss.....', '.....sssssswwwwssss.....', '.....sssssssssssssss....', '......ssssssssssss......', '.......ssssssssss.......', '........ssssssss........', '.........eeeeee.........', '........eeeeeeee........', '.......eeeeeeeeee.......']);
def('face_marx', ['......llllllllllll......', '....llllllllllllllll....', '...llllllllllllllllll...', '..llllllllllllllllllll..', '..llllssssssssssssllll..', '..lllssssssssssssssslll.'.slice(0, 24), '..lllsssssssssssssssll..', '..llssskkssssssskkssll..', '..llssskkssssssskkssll..', '..llssssssssssssssssll..', '..llsssssssSSsssssssll..', '..llsssssssSSsssssssll..', '..llsslllsssssslllssll..', '..llsllllllssllllllsll..', '..llllllllllllllllllll..', '..llllllllllllllllllll..', '..llllllllllllllllllll..', '...llllllllllllllllll...', '...llllllllllllllllll...', '....llllllllllllllll....', '....llllllllllllllll....', '.....llllllllllllll.....', '......llllllllllll......', '.......llllllllll.......']);
def('face_sinan', ['........rrrrrrrr........', '......rrrrrrrrrrrr......', '.....rrrrrrrrrrrrrr.....', '....rrrrrrrrrrrrrrrrrr..', '....rrrrrrrrrrrrrrrrrrrr', '......ssssssssssss......', '.....ssssssssssssss.....', '....ssssssssssssssss....', '....kkkkkkkkkkkkkkkk....', '....kkkkkkksskkkkkkk....', '....kkkkkkksskkkkkkk....', '.....ssssssssssssss.....', '.....sssssssSSsssss.....', '.....sssssssSSsssss.....', '.....ssssssssssssss.....', '.....sssssbbbbsssss.....', '.....ssssswwwwsssss.....', '.....ssssssssssssss.....', '......ssssssssssss......', '.......ssssssssss.......', '........ssssssss........', '.......wwwwwwwwww.......', '......wwwwwwwwwwww......', '.....wwwwwwwwwwwwww.....']);
def('face_baba', ['.nnnn..............nnnn.', 'nnffnn............nnffnn', 'nnffnnnnnnnnnnnnnnnnffnn', '.nnnnnnnnnnnnnnnnnnnnnn.', '...nnnnnnnnnnnnnnnnnn...', '...nnnssssssssssssnnn...', '...nnsssssssssssssnnn...', '...nnsYYYYYssYYYYYsnn...', '...nnsYAAAAYYAAAAYsnn...', '...nnsYAAAAYYAAAAYsnn...', '...nnssYYYYssYYYYssnn...', '...nnssssssssssssssnn...', '...nnsssssssSSsssssnn...', '...nnssbbbbbbbbbbssnn...', '...nnsbbbbbbbbbbbbsnn...', '...nnbbbbbbbbbbbbbbnn...', '...nnbbbbbbbbbbbbbbnn...', '....nbbbbbbbbbbbbbbn....', '....nnbbbbbbbbbbbbnn....', '.....nnbbbbbbbbbbnn.....', '......nnnnnnnnnnnn......', '.......nnnnnnnnnn.......', '......nnnnnnnnnnnn......', '.....nnnnnnnnnnnnnn.....']);
def('face_dl', ['......BBBBBBBBBBBB......', '....BBBBBBBBBBBBBBBB....', '...BBBBBBBBBBBBBBBBBB...', '...BBBssssssssssssBBB...', '...BBssssssssssssssBB...', '...BBssssssssssssssBB...', '...BBsskkssssssskksBB...', '...BBsskkssssssskksBB...', '...BBssssssssssssssBB...', '...BBsssssssSSsssssBB...', '...BBsssssssSSsssssBB...', '...BBsssBBBBBBBBsssBB...', '...BBssBBBBBBBBBBssBB...', '....BssBBBwwwwBBBssB....', '....BsssBBBBBBBBsssB....', '.....sssBBBBBBBBsss.....', '.....ssssBBBBBBssss.....', '......ssssssssssss......', '.......ssssssssss.......', '........ssssssss........', '......tttttttttttt......', '.....tttttwwwwtttttt....', '....ttttttwwwwtttttt....', '....tttttttttttttttt....']);
def('face_nixi', ['........kkkkkkkk........', '.....kkkAAAAAAAAkkk.....', '....kkAAAAAAAAAAAAkk....', '....kAAAAAAAAAAAAAAk....', '....kkkkkkkkkkkkkkkk....', '..RRRRRRRRRRRRRRRRRRRR..', '.RrrrrrrrrrrrrrrrrrrrrR.', '.RrrkkkkkkkkkkkkkkkkrrR.', '.RrrkvvvvvvvvvvvvvvkrrR.', '.RrrkvkkvvvvvvvkkvvkrrR.', '.RrrkvkkvvvvvvvkkvvkrrR.', '.RrrkvvvvvvvvvvvvvvkrrR.', '.RrrkvvvvkkkkkkvvvvkrrR.', '.RrrkvvvkvvvvvvkvvvkrrR.', '.RrrkkkkkkkkkkkkkkkkrrR.', '.RrrrrrrrrrrrrrrrrrrrrR.', '.RrrllrrllrrllrrllrrrrR.', '.RrrllrrllrrllrrllrrrrR.', '.RrrrrrrrrrrrrrrrrrrrrR.', '.RrrllrrllrrllrrllrrrrR.', '.RrrllrrllrrllrrllrrrrR.', '.RrrrrrrrrrrrrrrrrrrrrR.', '..RRRRRRRRRRRRRRRRRRRR..', '........................']);
def('face_ober', ['.......hhhhhhhhhh.......', '.....hhhhhhhhhhhhhh.....', '....hhhhhhhhhhhhhhhh....', '....hhssssssssssssshh...', '....hsssssssssssssssh...', '.....sssssssssssssss....', '.....sskkssssssskkss....', '.....sskkssssssskkss....', '.....sssssssssssssss....', '.....ssssssSSSssssss....', '.....ssssssSSSssssss....', '.....sssskkkkkkkssss....', '.....ssskkkkkkkkksss....', '.....sssssssssssssss....', '.....sssssskkkkksssss...', '.....sssssssssssssss....', '......ssssssssssssss....', '.......ssssssssssss.....', '........sssssssss.......', '.......kkkkwwkkkk.......', '......kkkkkwwkkkkk......', '.....kkkkkwwwwkkkkk.....', '....kkkkkkkwwkkkkkkk....', '....kkkkkkkkkkkkkkkk....']);
def('face_algo', SPR.algo.rows.filter((r, i) => i % 2 === 0).map(r => r.replace(/(.)./g, '$1')));
def('face_volker', SPR.face_ober.rows.map((r, i) => i >= 19 ? r.replace(/k/g, 'U') : i === 11 || i === 12 ? r.replace(/k/g, 's') : i === 14 ? '.....ssssswwwwwwssss....' : r));
def('face_torben', ['.......OOOOOOOOOO.......', '.....OOOOOOOOOOOOOO.....', '....OOOOOOOOOOOOOOOO....', '...OOOOOOOOOOOOOOOOOO...', '...OOOOOOOOOOOOOOOOOO...', '.....ssssssssssssss.....', '.....ssssssssssssss.....', '.....sskkssssssskkss....', '.....sskkssssssskkss....', '.....ssssssssssssss.....', '.....sssssssSSssssss....', '.....sssssssSSssssss....', '.....sssbbbbbbbbssss....', '.....ssbbbbbbbbbbsss....', '.....ssbbbwwwwbbbsss....', '.....ssbbbbbbbbbbsss....', '......sssbbbbbbssss.....', '.......ssssssssssss.....', '........ssssssssss......', '.........ssssssss.......', '.......rrrrrrrrrrrr.....', '......rrrrrwwwwrrrrr....', '.....rrrrrrwwwwrrrrrr...', '.....rrrrrrrrrrrrrrrr...']);
def('face_barth', ['......BBBBBBBBBBBB......', '....BBBBBBBBBBBBBBBB....', '...BBBBBBBBBBBBBBBBBB...', '...BBBssssssssssssBBB...', '...BBssssssssssssssBB...', '....ssssssssssssssss....', '....sskkssssssssskkss...'.slice(0, 24), '....sskkssssssssskkss...'.slice(0, 24), '....ssssssssssssssss....', '....sssssssSSSssssss....', '....sssssssSSSssssss....', '....ssssssssssssssss....', '....sswwwwwwwwwwwwss....', '....ssskwkwkwkwkwsss....', '....sssswwwwwwwwssss....', '....ssssssssssssssss....', '.....ssssssssssssss.....', '......ssssssssssss......', '.......ssssssssss.......', '........ssssssss........', '......UUUUUUUUUUUU......', '.....UUUUUUUUUUUUUU.....', '....UUUUUUUUUUUUUUUU....', '....UUUUUUUUUUUUUUUU....']);
// ---- items -------------------------------------------------------------------------
def('bit_1', ['..pp..', '.pppp.', 'pppppp', 'pPpppp', 'pPPppp', '.pPPp.', '..pp..', '......']);
def('bit_2', ['..pp..', '..pp..', '.pppp.', '.pPpp.', '.pPpp.', '.pPPp.', '..pp..', '......']);
def('bit_3', ['..pp..', '..pp..', '..pp..', '..Pp..', '..Pp..', '..Pp..', '..pp..', '......']);
def('bit100', ['...xxxx...', '..xxxxxx..', '.xxxxxxxx.', 'xxxxxxxxxx', 'xxxxxxxxxx', 'xxPxxxxPxx', '.xxPPPPxx.', '..xxxxxx..', '...xxxx...', '..........']);
def('sub', ['..pp....pp..', '.pppp..pppp.', 'pppppppppppp', 'ppppwwpppppp', 'pppwwwwppppp', '.pppwwpppppp'.slice(0, 12), '..pppppppp..', '...pppppp...', '....pppp....', '.....pp.....', '............', '............']);
def('holf', ['ZZZZZZZZZZ', 'ZyyyyyyyyZ', 'ZyyyyyyyyZ', '.ZyyyyyyZ.', '.ZyyyyyyZ.', '..ZyyyyZ..', '...ZyyZ...', '....ZZ....', '....ZZ....', '..ZZZZZZ..', '.ZZZZZZZZ.', 'ZZZZZZZZZZ']);
def('hafer', ['...wwwwww...', '...wwwwww...', '..wuuuuuuw..', '..wuuuuuuw..', '..wuwwwwuw..', '..wuwGGwuw..', '..wuwGGwuw..', '..wuwwwwuw..', '..wuuuuuuw..', '..wuuuuuuw..', '..wuuuuuuw..', '..wwwwwwww..', '............', '............']);
def('bshirt', ['cc..........cc', 'ccc..cccc..ccc', 'cccccyccyccccc', 'cccccyccyccccc', 'cccyccccccyccc', '.ccyycccyyccc.', '.ccccyyyyccyc.', '.ccyccccccycc.', '.ccyccyyccycc.', '.cccccyyccccc.', '.cccyccccyccc.', '.ccccyyyycccc.', '.cccccccccccc.', '..............']);
def('mate', ['..mm....', '..mm....', '.eeee...', '.eeee...', '.eyye...', '.eyye...', '.eeee...', '.eeee...', '.eeee...', '.eeee...', '.eeee...', '.eeee...', '........', '........']);
def('agave', ['...ee...', '..eeee..', '.eeeeee.', '...dd...', '..dddd..', '..dDDd..', '..dDDd..', '..dDDd..', '..dddd..', '..dddd..', '...dd...', '........', '........', '........']);
def('hammer', ['..AAAAAAAA....', '..AAAAAAAA....', '..AAppppAA....', '..AAppppAA....', '..AAAAAAAA....', '..AAAAAAAA....', '.....mm.......', '.....mm.......', '.....mm.......', '.....mm.......', '.....mm.......', '.....mm.......', '.....mm.......', '..............']);
def('brb', ['pppppppppppp', 'pwwpwppwwwpp', 'pwpwpwwpwpwp', 'pwwpwppwwwpp', 'pwpwpwwpwpwp', 'pwwpwppwwwpp', 'pppppppppppp', '............', '............', '............']);
def('gift', ['.....yy.....', '....yyyy....', 'pppppyyppppp', 'ppppppppppp'.slice(0, 12) + 'p', 'yyyyyyyyyyyy', 'PPPPPyyPPPPP', 'PPPPPyyPPPPP', 'PPPPPyyPPPPP', 'PPPPPyyPPPPP', 'PPPPPyyPPPPP', 'PPPPPyyPPPPP', 'PPPPPPPPPPPP']);
def('flag_pole', ['ll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll', 'll']);
def('flag_green', ['eeeeeeeeeeee', 'eeeewwwweeee', 'eeewewwewee.', 'eeeweweweee.', 'eeewewwewee.', 'eeeeeeeeee..', 'eeeeeeee....', 'eeeeee......']);
def('flag_grey', SPR.flag_green.rows.map(r => r.replace(/e/g, 'a')));
def('box', ['AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaAAAAAAAAAAAAAAAAAAAAAAAAAAAAaA', 'AaAyyyyyyyyyyyyyyyyyyyyyyyyyyAaA', 'AaAyyyyyyyyyyyyyyyyyyyyyyyyyyAaA', 'AaAAAAAAAAAAAAAAAAAAAAAAAAAAAAaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaarrraaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA']);
def('sponsor', ['....yyyyyyyy....', '...yyyyyyyyyy...', '....ssssssss....', '....skssskss....', '....ssssssss....', '....sswwwwss....', '.....ssssss.....', '....iiiiiiii....', '...siiwwwwiis...', '...siiwrrwiis...', '..qqsiiwwwwiis..', '..qq.iiiiiiii...', '..qq.iiiiiiii...', '....iiiiiiii....', '....AAAAAAAA....', '....AAA..AAA....', '....AAA..AAA....', '....AAA..AAA....', '...kkk....kkk...', '..kkkk....kkkk..', '................', '................', '................', '................']);
def('zzz', ['wwww', '..w.', '.w..', 'wwww']);
def('heart', ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
def('laugh', ['w.w.w.w.w', 'w.w.w.w.w', 'wwwwwwwww', 'w.w.w.w.w', 'w.w.w.w.w']);
def('dust', ['.ll.', 'llll', '.ll.']);
def('spark', ['..w..', '.www.', 'wwwww', '.www.', '..w..']);
def('lock', ['..aaaa..', '.aa..aa.', '.aa..aa.', 'YYYYYYYY', 'YYYkkYYY', 'YYYkkYYY', 'YYYYYYYY', 'YYYYYYYY']);
def('door', ['MMMMMMMMMMMMMMMM', 'MmmmmmmmmmmmmmmM', 'MmmMMMMMMMMMMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMMMMMMMMMMmmM', 'MmmmmmmmmmmmmmmM', 'MmmMMMMMMMMMMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmYmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMmmmmmmmmMmmM', 'MmmMMMMMMMMMMmmM', 'MmmmmmmmmmmmmmmM', 'MmmmmmmmmmmmmmmM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM', 'MMMMMMMMMMMMMMMM']);
def('kasten', ['aaaaaaaaaaaaaaaa', 'aAAAAAAAAAAAAAAa', 'aAaaaaaaaaaaaaAa', 'aAaAAAAAAAAAAaAa', 'aAaArAgArAgAAaAa', 'aAaAAAAAAAAAAaAa', 'aAaaaaaaaaaaaaAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAyyyyyyyyyyAAa', 'aAAyyyyyyyyyyAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aAAAAAAAAAAAAAAa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa']);
def('cookiebanner', (() => { const rows = []; for (let y = 0; y < 40; y++) { let r = ''; for (let x = 0; x < 96; x++) { let ch = (y < 2 || y >= 38 || x < 2 || x >= 94) ? 'A' : 'w'; if (y >= 20 && y < 34 && x >= 8 && x < 62) ch = (y < 22 || y >= 32 || x < 10 || x >= 60) ? 'C' : 'c'; if (y >= 22 && y < 28 && x >= 70 && x < 90) ch = 'l'; if (y >= 6 && y < 10 && x >= 8 && x < 60) ch = 'a'; if (y >= 12 && y < 15 && x >= 8 && x < 80) ch = 'a'; r += ch; } rows.push(r); } return rows; })());
def('captcha', ['wwwwwwwwwwwwwwwwwwwwwwww', 'waaaaaaawaaaaaaawaaaaaaw', 'waaaaaaawaaaaaaawaaaaaaw', 'waaaaaaawaaaaaaawaaaaaaw', 'waaaaaaawaaaaaaawaaaaaaw', 'waaaaaaawaaaaaaawaaaaaaw', 'waaaaaaawaaaaaaawaaaaaaw', 'wwwwwwwwwwwwwwwwwwwwwwww']);
def('bike', ['....k...', '...kk...', '..kkkk..', 'kk.k.kkk', 'k.k.k.kk'.slice(0, 8), 'kkk..kkk', 'k.k..k.k', 'kkk..kkk']);
def('lag', ['uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu', 'uUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUu', 'uUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUu', 'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', '..U..U..U..U..U..U..U..U..U..U..', '..U..U..U..U..U..U..U..U..U..U..', '..U..U..U..U..U..U..U..U..U..U..', '..U..U..U..U..U..U..U..U..U..U..']);
def('gondel', ['.......ll.......', '.......ll.......', '.....llllll.....', '....l......l....', '...rrrrrrrrrr...', '...ruurrrruur...', '...ruurrrruur...', '...rrrrrrrrrr...', '...rrrrrrrrrr...', '....rrrrrrrr....', '................', '................']);
def('buffer', ['....uu....', '..u....u..', '.u......u.', 'u........u', 'u........u', 'u........u', '.u......u.', '..u....u..', '....uu....', '..........']);

/* ------------- Sprite builder ------------- */
const Sprites = {
  cache: {},
  build(name, flip, pal) {
    const s = SPR[name]; if (!s) { console.warn('no sprite', name); return null; }
    const key = name + (flip ? '|f' : '') + (pal ? '|' + pal : '');
    if (this.cache[key]) return this.cache[key];
    const c = document.createElement('canvas'); c.width = s.w; c.height = s.h; const g = c.getContext('2d');
    const palObj = pal ? Object.assign({}, PAL, pal === 'grey' ? { s: '#999', b: '#555', h: '#444', t: '#333', g: '#666', j: '#555', r: '#777', y: '#aaa', n: '#888', N: '#666', B: '#888', e: '#777', w: '#ddd', p: '#888' } : pal === 'flash' ? Object.fromEntries(Object.keys(PAL).map(k => [k, '#ffffff'])) : pal === 'dark' ? Object.fromEntries(Object.keys(PAL).map(k => [k, '#101018'])) : pal === 'gold' ? Object.fromEntries(Object.keys(PAL).map(k => [k, ['k', 'K', 'i'].includes(k) ? '#7a5a10' : '#ffd700'])) : {}) : PAL;
    for (let y = 0; y < s.h; y++) { const row = s.rows[y]; for (let x = 0; x < s.w; x++) { const ch = row[x]; if (!ch || ch === '.') continue; const col = palObj[ch]; if (!col) continue; g.fillStyle = col; g.fillRect(flip ? s.w - 1 - x : x, y, 1, 1); } }
    this.cache[key] = c; return c;
  },
  draw(ctx, name, x, y, flip = false, pal = null) { const c = this.build(name, flip, pal); if (c) ctx.drawImage(c, Math.round(x), Math.round(y)); return c; },
  size(name) { const s = SPR[name]; return s ? { w: s.w, h: s.h } : { w: 16, h: 16 }; }
};
