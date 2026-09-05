/* =====================================================================
   13 levels: die 10 Level, Bonusräume, Bossräume, Dialoge, Marx-Hinweise
   ===================================================================== */
// fix chunk pipe tags (uu = Bonus rein, oo = Bonus raus)
CH.pipe_bonus.rows = [
  '....................', '....................', '....................', '....................', '....................', '....................', '....................', '....................',
  '....................', '....................', '......uu......oo....', '..b...||......||..t.', '......||......||....', '####################', '####################'];
CH.pipe_bonus.pipes = ['bIn', 'bOut'];
CH.pipe_kabel.rows = CH.pipe_kabel.rows.map((r, i) => i === 8 ? '........y...........' : r);
chunk('boss_pipe', `
........................
........................
........................
........................
........................
........................
........................
........................
........................
..............oo.......%
....b...b.....||.......%
..............||.......%
..............||.......%
########################
########################`, { pipes: ['toBoss'] });
chunk('sec_pipe', `
........................
........................
........................
........................
........................
........................
........................
........................
........................
..............oo.......%
....b.........||.......%
..............||.......%
..............||.......%
########################
########################`, { pipes: ['toNext'] });
chunk('sec_start', `
................
....||..........
....dd..........
................
................
................
................
................
................
................
................
................
................
################
################`, { pipes: ['secIn'] });
CH.w5_pipes.pipes = ['mzA', 'mzB', 'mzC', 'mzD'];
CH.w5_pipes.rows = CH.w5_pipes.rows.map((r, i) => i === 10 ? '....uu......uu......uu......uu..........' : r);

const BONUS = {
  bits: { pipeTags: ['in', 'out'], fallDeath: false, map: [
    '%%%%||%%%%%%%%%%%%%%%%%%', '%...||.................%', '%...dd.................%', '%......................%', '%..bbbbbbbbbbbbbbbbbb..%', '%......................%', '%..bbbbbbbbbbbbbbbbbb..%', '%......................%',
    '%..bbbbb..5...bbbbbbb..%', '%......................%', '%.......----...........%', '%......................%', '%.................uu...%', '%.................||...%', '%%%%%%%%%%%%%%%%%%%%%%%%'] },
  sinan: { pipeTags: ['in', 'out'], fallDeath: false, map: [
    '%%%%||%%%%%%%%%%%%%%%%%%', '%...||.................%', '%...dd.......2.........%', '%...........XXX........%', '%......................%', '%.....b.........b......%', '%......................%', '%...b.............b....%',
    '%......................%', '%..b................b..%', '%......................%', '%..........S......uu...%', '%.................||...%', '%######################%', '%%%%%%%%%%%%%%%%%%%%%%%%'] },
  shop: { pipeTags: ['in', 'out'], fallDeath: false, shop: true, map: [
    '%%%%||%%%%%%%%%%%%%%%%%%', '%...||.................%', '%...dd.................%', '%......................%', '%......................%', '%......................%', '%......................%', '%......................%',
    '%......................%', '%......................%', '%..........,...........%', '%.......L.........uu...%', '%.................||...%', '%######################%', '%%%%%%%%%%%%%%%%%%%%%%%%'], ents: [{ t: 'npc', x: 6, y: 12, who: 'ludwig', lines: ['Willkommen im Späti. Hafermilch 30, Mate 40, Sinans Ball 60, BRB 100.', 'Drück ↓ um den Shop zu öffnen.'] }, { t: 'sign', x: 12, y: 10, text: 'SPÄTI24 - seit 3 Uhr nachts. ↓ = Shop' }] },
  marx: { pipeTags: ['in', 'out'], fallDeath: false, map: [
    '%%%%||%%%%%%%%%%%%%%%%%%', '%...||.................%', '%...dd.................%', '%......................%', '%......................%', '%...,....,....,....,...%', '%......................%', '%......................%',
    '%....5.................%', '%...XXX................%', '%......................%', '%.........M.......uu...%', '%.................||...%', '%######################%', '%%%%%%%%%%%%%%%%%%%%%%%%'] },
  sub3: { pipeTags: ['in', 'out'], fallDeath: true, map: [
    '%%%%||%%%%%%%%%%%%%%%%%%', '%...||.................%', '%...dd.................%', '%......................%', '%.................3....%', '%................XXX...%', '%......................%', '%..........XX..........%',
    '%......................%', '%.....XX.......XX......%', '%......................%', '%..XX.............uu...%', '%.................||...%', '%###^^^^^^^^^^^^^^#####%', '%%%%%%%%%%%%%%%%%%%%%%%%'] },
  warp: { pipeTags: ['in', 'w5', 'w6', 'w8'], fallDeath: false, warp: true, map: [
    '%%%%||%%%%%%%%%%%%%%%%%%%%%%%%%%', '%...||.........................%', '%...dd.........................%', '%..............................%', '%..............................%', '%..............................%', '%..............................%', '%..............................%',
    '%..............................%', '%..............................%', '%..............................%', '%.......uu.....uu......uu......%', '%.......||.....||......||......%', '%##############################%', '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'], ents: [{ t: 'sign', x: 3, y: 10, text: 'ROUTER-RAUM: Warp zu Level 5 / 6 / 8' }, { t: 'sign', x: 8, y: 8, text: 'Level 5' }, { t: 'sign', x: 15, y: 8, text: 'Level 6' }, { t: 'sign', x: 23, y: 8, text: 'Level 8' }] },
};
function bossRoom(map, boss, extra) { return Object.assign({ map, boss, music: 'boss', pipeTags: ['in'], fallDeath: true }, extra || {}); }
const ROOM_L2_BOSS = bossRoom([
  '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '%...||.........................%', '%...dd.........................%', '%..............................%', '%..............................%', '%..............................%', '%..............................%', '%..............................%',
  '%..............................%', '%.=============================%', '%..............................%', '%..............................%', '%..................uu..........%', '%..................||..........%', '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'],
  { t: 'techniker', x: 20, y: 7 }, { pipeTags: ['in', 'ret'], endAfterBoss: { x: 27, y: 14 }, fallDeath: false });
const ROOM_L4_BOSS = bossRoom([
  '........................................', '....||..................................', '....dd..................................', '%......................................%', '%......................................%', '%......................................%', '%......................................%', '%......................................%',
  '%......................................%', '%......................................%', '%......................................%', '%......................................%', '%......................................%', '########################################', '########################################'],
  { t: 'drachenlord', x: 30, y: 10 }, { endAfterBoss: { x: 33, y: 13 }, haider: [[3, 11], [35, 11]] });
const ROOM_L5_BOSS = bossRoom([
  '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '%...||.........................%', '%...dd.........................%', '%..............................%', '%..............................%', '%.........-------..............%', '%..............................%', '%..............................%',
  '%.....==.............==........%', '%..............................%', '%..==.....................==...%', '%..............................%', '%..............................%', '%##############################%', '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'],
  { t: 'kabelkoenig', x: 14, y: 6 }, { endAfterBoss: { x: 26, y: 13 } });
const ROOM_L6_BOSS = bossRoom([
  '%......................................%', '%...||.................................%', '%...dd.................................%', '%......................................%', '%......................................%', '%......................................%', '%......................................%', '%..........---............---..........%',
  '%......................................%', '%......................................%', '%.....---......................---.....%', '%......................................%', '%......................................%', '########################################', '########################################'],
  { t: 'baba', x: 28, y: 9 }, { endAfterBoss: { x: 34, y: 13 } });
const ROOM_L7_BOSS = bossRoom([
  '%......................................%', '%...||.................................%', '%...dd.................................%', '%.........4.....................4......%', '%.......XXXX..................XXXX.....%', '%......................................%', '%..................4...................%', '%................XXXXX.................%',
  '%......................................%', '%.4..................................4.%', '%XXX................................XXX%', '%......................................%', '%......................................%', '########################################', '########################################'],
  { t: 'ober', x: 30, y: 11 }, { endAfterBoss: { x: 36, y: 13 }, ents: [{ t: 'tisch', x: 18, y: 12 }] });
const ROOM_L8_BOSS = bossRoom([
  '%%%%%%%%%%%%%%%%%%%%%%%%', '%..||..................%', '%..dd..................%', '%......................%', '%......................%', '%......................%', '%......................%', '%......................%',
  '%......................%', '%......................%', '%......................%', '%......................%', '%......................%', '%######################%', '%%%%%%%%%%%%%%%%%%%%%%%%'],
  { t: 'algo', x: 9, y: 3 }, { endAfterBoss: { x: 18, y: 13 }, layoutX: 1, layoutY: 6, bossLayouts: [
    ['......................', '......................', '....---........---....', '......................', '..........----........', '......................', '......................'],
    ['......................', '..---............---..', '......................', '........--------......', '......................', '......................', '......................'],
    ['......................', '......................', '..........---.........', '......................', '...---.........---....', '......................', '......................']] });
const ROOM_L9_BOSS = bossRoom([
  '%......................................%', '%...||.................................%', '%...dd.................................%', '%......................................%', '%......................................%', '%......................................%', '%......................................%', '%......................................%',
  '%......=====..............=====........%', '%......................................%', '%......................................%', '%......................................%', '%......................................%', '########################################', '########################################'],
  { t: 'volker', x: 30, y: 11 }, { endAfterBoss: { x: 35, y: 13 } });
const ROOM_L10_BOSS = bossRoom([
  '%..........................................%', '%...||.....................................%', '%...dd.....................................%', '%..........................................%', '%..........................................%', '%..........................................%', '%.==.......................................%', '%..........................................%',
  '%.......9..................................%', '%..........................................%', '%..............===.........................%', '%.....==...................................%', '%..........................................%', '############################################', '############################################'],
  { t: 'nixi', x: 22, y: 9 }, { endAfterBoss: { x: 8, y: 13 }, buchse: { x: 2, y: 5 }, music: 'final' });

/* ---------- scenes (cutscene scripts) ---------- */
const SCENES = {
  prologue: [
    { bg: 'room', who: 'ludwig', text: 'Neue Wohnung! Kartons ausgepackt: 3 von 47. imp, du wolltest "koordinieren"?' },
    { who: 'imp', text: 'Ich koordiniere vom Sofa aus. Stream startet um 20 Uhr. Es ist... 20:17. Pünktlich wie immer.' },
    { who: 'imp', text: '*klick* "Stream starten"... "Keine Internetverbindung." ...Ludwig?' },
    { who: 'ludwig', text: 'Der Techniker von NIXNET kommt zwischen 8 und 18 Uhr.' },
    { who: 'imp', text: 'Ludwig. Es ist 20 Uhr.' }, { who: 'ludwig', text: 'Von welchem Tag stand da nicht.' },
    { who: 'nixi', text: 'Willkommen bei NIXNET. Ihr Anschluss ist uns wichtig. Ihre voraussichtliche Wartezeit beträgt: VIER STUNDEN.' },
    { who: 'torben', text: '*Türklingel* Torben, NIXNET! Wir bohren kurz durch die Wand... ups, Wasserrohr. Und das Kabel vom Nachbarn. Und die Klingel.' },
    { who: 'torben', text: 'So! Zettel an die Tür: "Kunde nicht angetroffen". Schönen Tag noch!' },
    { who: 'imp', text: 'Ich stehe DIREKT NEBEN DIR.' },
    { who: 'ludwig', text: 'imp... ohne Stream: Werbepartner weg, Abos laufen aus, Bits null. In zehn Tagen ist der Kanal OFFLINE.' },
    { who: 'imp', text: 'Und dieses gelbe Kabel, das aus der Wand kommt und um die Ecke verschwindet...?' },
    { who: 'ludwig', text: 'NIXNET hat unsere Glasfaser verlegt. Nur nicht zu uns. Irgendwohin.' },
    { who: 'imp', text: 'Dann hol ich mir Sponsoren, Abos und das Internet eben zurück. Persönlich. Zu Fuß.' },
    { who: 'ludwig', text: 'ZU FUSS?!' }, { who: 'imp', text: 'Nö. Mit Röhren.' },
    { who: 'marx', text: 'Proletarier aller Kieze... folgt dem Kabel.' }, { who: 'imp', text: 'Die Büste redet seit dem Umzug. Ich frag lieber nicht.' },
  ],
  l1_intro: [{ who: 'ludwig', text: 'Das Kabel führt ins Treppenhaus. Kartons kann man tragen und werfen. Nicht auf mich.' }, { who: 'imp', text: 'Ich werfe nur auf Sponsoren-Verträge. Und Wände.' }, { who: 'ludwig', text: 'Der Nachbar grillt schon wieder. Halt Abstand zu Bratwürsten. Und sammle Bits, Abos und die HOLF-Pokale!' }],
  l1_outro: [{ who: 'sponsor', text: 'HAFI - Hafermilch, die dich versteht! Herr imp, wir wollen Sie sponsern! Nur hier unterschreiben, 14 Seiten.' }, { who: 'imp', text: 'Vierzehn Seiten. Ludwig?' }, { who: 'ludwig', text: '*unterschreibt* Erledigt. Kleingedrucktes: Du musst jeden Stream mit "Hafi!" eröffnen.' }, { who: 'imp', text: 'Hafi.' }, { who: 'sponsor', text: 'Und ich bin von GLATTMANN Rasierklingen. Wir hätten auch Interesse...' }, { who: 'imp', text: '...an meinem Bart? Nein. Das Kabel geht hier raus in den Kiez. Weiter.' }],
  l2_intro: [{ who: 'imp', text: 'Plan B: fremdes WLAN. "FRITZ!Box-nein", "Kein Internet hier", "Passwort ist Passwort". Vielversprechend.' }, { who: 'ludwig', text: 'Manche Ecken sind komplett OFFLINE. Such den Hotspot-Router und schalte ihn ein (↑). Aber Achtung: das Signal reicht nicht weit.' }, { who: 'ludwig', text: 'Und Sinan steht irgendwo rum und posiert. Spring auf seinen Bizeps, das katapultiert dich hoch.' }],
  l2_boss: [{ who: 'torben', text: 'Oh, der Kunde! Wir verlegen hier gerade die Straße. Also, wir zerlegen sie.' }, { who: 'imp', text: 'Wo ist mein Internet, Torben?' }, { who: 'torben', text: 'Das ist ein Ticket. Ich bin Techniker. Kevin, Kabelbinder!' }],
  l2_outro: [{ who: 'sponsor', text: 'Späti24 - Mate & Chips, seit 3 Uhr nachts. Vertrag?' }, { who: 'ludwig', text: '*unterschreibt* Wir kriegen lebenslang Mate. Du musst dafür ein Späti-Shirt tragen.' }, { who: 'imp', text: 'Ich trage gar nichts, was mir jemand sagt. Außer Ludwig. Wo geht das Kabel hin?' }, { who: 'ludwig', text: 'Ins... Bürgeramt für Anschlussangelegenheiten.' }, { who: 'imp', text: 'Nein. Nein. Nein. NEIN.' }],
  l3_intro: [{ who: 'ludwig', text: 'Du brauchst die Anschlussgenehmigung, Formular G-4/Fiber. Formulare kleben an dir fest, dann Sprung-Taste hämmern!' }, { who: 'imp', text: 'Papierkram. Mein Endgegner. Und wir sind erst in Level 3.' }, { who: 'marx', text: 'Hier hält man mich für dich und dich für mich. Nutze das. Mit dem Marx-Ausweis ignorieren dich die Sachbearbeiter.' }],
  l3_outro: [{ who: 'sponsor', text: 'FormFrei - die App, die deine Formulare ausfüllt. Irgendwann. Genehmigung erteilt!' }, { who: 'imp', text: 'ENDLICH. Für welche Adresse?' }, { who: 'sponsor', text: 'Schanzenhof, Altschauerberg.' }, { who: 'imp', text: '...das ist nicht meine Adresse.' }, { who: 'ludwig', text: 'Aber da liegt jetzt das Kabel. In einer Scheune. Bei einem gewissen... Drachenlord.' }, { who: 'imp', text: 'Meddl.' }],
  l4_intro: [{ who: 'ludwig', text: 'Fränkische Provinz. Grillfest. Heuballen rollen den Hang runter, und die Kessel schießen Würste.' }, { who: 'imp', text: 'Ein ganzes Dorf grillt Fleisch. Und ich hab nur Tofu-Argumente.' }, { who: 'ludwig', text: 'Der Vegan-Award (grüner HOLF) macht alle Fleischgegner zu Tofu. Nur so als Tipp.' }],
  l4_boss: [{ who: 'dl', text: 'MEDDL LOIDE! Des is mei Hof, mei Kabel und mei Grillfleisch!' }, { who: 'imp', text: 'Zwei von drei Dingen sind mir egal.' }, { who: 'dl', text: 'Ich roll dich platt wie an Fels, du Haider!' }, { who: 'ludwig', text: 'Er rollt sich zur Kugel! Spring drüber. Wenn er gegen die Wand knallt, ist er benommen: STAMPFEN!' }],
  l4_outro: [{ who: 'sponsor', text: 'Seitan-Schmiede - Fleischersatz aus Franken. Etzala vegan! Vertrag?' }, { who: 'ludwig', text: '*unterschreibt* Wir bekommen 300 kg Seitan. Pro Monat.' }, { who: 'imp', text: 'Ludwig, ich hab eine Zweizimmerwohnung.' }, { who: 'dl', text: 'Etzala... des Kabel geht in den Gully. Da unten is a Röhrensystem. Viel Spaß, Haider.' }],
  l5_intro: [{ who: 'ludwig', text: 'Die Kanalisation. Das Kabel verzweigt sich in ein Knäuel aus Röhren. Blaue Röhren führen weiter, aber nur die richtige Reihenfolge bringt dich zum Ausgang.' }, { who: 'marx', text: 'Die Wahrheit will erarbeitet werden. Frag mich (H). Ich rede in Rätseln. Das ist mein Ding.' }, { who: 'imp', text: 'Großartig. Ein Orakel mit Bart. Also ich. Aber älter.' }],
  l5_outro: [{ who: 'sponsor', text: 'RohrFrei - Abflussreiniger für jedes Röhrensystem. Sie sind unser Mann!' }, { who: 'ludwig', text: '*unterschreibt* Wir müssen einmal die Woche live einen Abfluss reinigen.' }, { who: 'imp', text: 'Das ist mehr Struktur als mein ganzes Leben. Was steht auf dem Schild da?' }, { who: 'ludwig', text: '"Honigwald. Bitte nicht füttern."' }],
  l6_intro: [{ who: 'ludwig', text: 'Der Honigwald. Honigboden ist klebrig, an Honigwänden kannst du hochklettern (an die Wand drücken + Sprung). Soletti-Brücken brechen!' }, { who: 'imp', text: 'Wer wohnt hier?' }, { who: 'ludwig', text: 'Ein Bär im rosa Overall. Er hat unser Kabel als Wäscheleine benutzt.' }],
  l6_boss: [{ who: 'baba', text: 'Wer stört meine Soletti-Pause?! BABA!' }, { who: 'imp', text: 'Ich will nur mein Kabel. Das da. Mit deiner Unterhose drauf.' }, { who: 'baba', text: 'Das ist ein OVERALL. Und der bleibt!' }, { who: 'ludwig', text: 'Seine Soletti bleiben im Boden stecken: nutz sie als Plattformen oder wirf sie zurück! Wenn er schläft: auf den Bauch springen!' }],
  l6_outro: [{ who: 'sponsor', text: 'Agavo - der Honig ohne Bienenstress. Endlich ein veganer Streamer!' }, { who: 'ludwig', text: '*unterschreibt* Kein Kleingedrucktes. Ich bin misstrauisch.' }, { who: 'baba', text: 'Das Kabel? Geht nach Wien. Baba!' }, { who: 'imp', text: 'Nein.' }, { who: 'ludwig', text: 'Doch.' }, { who: 'imp', text: 'Warum. Immer. Wien.' }],
  l7_intro: [{ who: 'imp', text: 'Wien. Von hier kommen immer so viele komische Leute. Und jetzt bin ich hier. Das sagt alles.' }, { who: 'ludwig', text: 'Riesenrad-Gondeln sind Plattformen. Fiaker rasen durchs Bild. Und die Warteschleifen-Geister kommen nur näher, wenn du wegschaust!' }, { who: 'imp', text: 'Also wie mein Chat.' }],
  l7_boss: [{ who: 'ober', text: 'Ham\'S reserviert?' }, { who: 'imp', text: 'Ich will nur durch.' }, { who: 'ober', text: 'Dann ham\'S nicht reserviert.' }, { who: 'ludwig', text: 'Der ist unbesiegbar. Aber käuflich: sammle 5 Trinkgeld-Münzen und leg sie auf den Tisch (↓+Shift). Oder zahl 100 Bits (↓ am Tisch).' }],
  l7_outro: [{ who: 'sponsor', text: 'Melange-to-go - Wiener Kaffee ohne den Grant. Passt scho?' }, { who: 'ludwig', text: '*unterschreibt* Passt scho.' }, { who: 'imp', text: 'Am Riesenrad hängt ein Schild: "Kabel geht weiter → YouTube-Tower. Alternativeinnahmen?"' }, { who: 'ludwig', text: 'Videos statt Live! Der Algorithmus wird uns lieben!' }, { who: 'imp', text: 'Der Algorithmus liebt niemanden, Ludwig.' }],
  l8_intro: [{ who: 'ludwig', text: 'Der YouTube-Tower. Es geht nach oben! Clickbait-Plattformen verschwinden, Cookie-Banner: spring auf "nur notwendige", NICHT auf "alle akzeptieren".' }, { who: 'ludwig', text: 'Hier oben geht\'s ums Geld: Zollschranken kassieren 25% deiner Bits. Es gibt immer einen Umweg. Und ein Privatjet wirft Aktenkoffer ab. Firewall-Blöcke halten sie auf.' }, { who: 'imp', text: 'Ein Jet. Klar. Ganz normal.' }],
  l8_boss: [{ who: 'algo', text: 'NUTZER ERKANNT: imp. WATCHTIME: NIEDRIG. EMPFEHLUNG: MEHR SCHREIEN IM THUMBNAIL.' }, { who: 'imp', text: 'Ich schreie nie. Ich rede nur laut und lange.' }, { who: 'ludwig', text: 'Wenn sein Abonnieren-Button rot leuchtet: DRAUFSPRINGEN!' }],
  l8_outro: [{ who: 'sponsor', text: 'ThumbNail Pro - Clickbait für Einsteiger! (GONE WRONG) (NICHT KLICKEN)' }, { who: 'ludwig', text: '*unterschreibt* Dein Gesicht muss ab jetzt auf jedem Thumbnail überrascht sein.' }, { who: 'imp', text: 'Ich BIN überrascht. Dauerhaft. Seit Level 1.' }, { who: 'algo', text: 'FEHLER 404... NIXNET hat das Kabel nicht falsch verlegt. NIXNET hat es ABSICHTLICH in die eigene Zentrale gelegt. Als PREMIUM-UPGRADE.' }, { who: 'imp', text: 'Also doch Kapitalismus.' }, { who: 'marx', text: 'Sag ich doch seit 1867.' }],
  l9_intro: [{ who: 'ludwig', text: 'Die NIXNET-Zentrale. Du brauchst Tickets für die Schleusen, und die laufen ab! Captcha-Blöcke: nur die mit Fahrrädern anstoßen.' }, { who: 'ludwig', text: 'Und in der Lobby läuft Mario Barth rum. Wenn er dich erwischt: Smalltalk-Falle. Tasten hämmern zum Losreißen!' }, { who: 'imp', text: 'Kennste? Nein. Und das bleibt auch so.' }],
  l9_boss: [{ who: 'volker', text: 'Herr imp! Vertriebler Volker! Nur heute: 1000 Mbit für 99 Euro! 24 Monate! Plus Router-Miete!' }, { who: 'imp', text: 'Ich will das Internet, das ich schon bezahle.' }, { who: 'volker', text: 'Das ist leider der Grundtarif. Der hat keine Verbindung inklusive.' }, { who: 'ludwig', text: 'Nach jeder Verkaufsphrase verbeugt er sich. Das ist dein Moment!' }],
  l9_outro: [{ who: 'sponsor', text: 'VPN-Vorhang - damit nicht mal NIXNET sieht, dass du kein Internet hast.' }, { who: 'ludwig', text: '*unterschreibt* Wir müssen in jedem Video "Mit dem Code IMP 3 Monate gratis" sagen.' }, { who: 'imp', text: 'Das sag ich eh im Schlaf. Da: ein Schacht. "Glasfaser-Backbone. Zutritt nur für Premium-Kunden."' }, { who: 'imp', text: 'Ich bin Premium. Ich bin seit zehn Tagen ohne Internet, das ist Premium-Leiden.' }],
  l10_intro: [{ who: 'ludwig', text: 'Die Glasfaser-Unterwelt. Alles, was du gelernt hast, kommt hier zusammen. Sinan, Baba, Marx und ich funken dich an.' }, { who: 'sinan', text: 'Bruder, ich steh vor der letzten Tür und pos. Spring drauf.' }, { who: 'baba', text: 'Ich werf Agavendicksaft, wenn\'s eng wird! Baba!' }, { who: 'marx', text: 'Am Ende wartet die Warteschleife selbst. Sie wurde zur Maschine. Drücke, was sie sagt. Und dann drück sie weg.' }, { who: 'imp', text: 'Zehn Level. Kein Netz. Kein Stream. Aber einen Plan. Halb.' }],
  l10_boss: [{ who: 'nixi', text: 'WILLKOMMEN BEI NIXNET. IHR ANRUF IST UNS WICHTIG. BITTE BLEIBEN SIE DRAN.' }, { who: 'imp', text: 'Ich bin seit zehn Leveln dran.' }, { who: 'nixi', text: 'IHRE VORAUSSICHTLICHE WARTEZEIT BETRÄGT: FÜR IMMER.' }, { who: 'ludwig', text: 'Spring auf den Hörer, wenn er runterkommt! Dann drück die richtigen Nummern! Und am Ende: DER STECKER!' }],
  ending: [
    { bg: 'room', who: 'imp', text: '*klick* Die LED... ist GRÜN.' }, { who: 'ludwig', text: 'INTERNET! Wir haben INTERNET! Nach zehn Leveln, acht Bossen und einem Bären!' },
    { who: 'sponsor', text: 'Glasfaser-Gigi - endlich Internet. Selbstbau-Set. Sie haben es ja quasi selbst verlegt!' }, { who: 'ludwig', text: '*unterschreibt* Der letzte Vertrag. Zehn Werbepartner. Der Kanal ist gerettet.' },
    { who: 'imp', text: 'Schnell nach Hause. Stream startet um 20 Uhr. Es ist... egal. *klick* "Stream starten".' },
    { chat: ['impimpimp', 'impimpimp', 'ER LEBT', 'endlich wieder Dauersatiresendung', 'impimpimp', 'wo ist ludwig', 'LUDWIG HAT EINEN RASIERER-DEAL LUL', 'impimpimp'] },
    { who: 'sponsor', text: 'GLATTMANN Rasierklingen hier. Wir haben jetzt übrigens Ludwig unter Vertrag.' }, { who: 'ludwig', text: '*glatt rasiert* Es war das Kleingedruckte.' },
    { who: 'imp', text: 'Hafi, Chat. Willkommen zur Dauersatiresendung. Heute: wie ich zu Fuß nach Wien gelaufen bin.' },
    { who: 'marx', text: 'Das Kabel gehört jetzt allen. Besonders dir.' },
    { who: 'torben', text: '*Türklingel* NIXNET, ich komm wegen\'m Internet?' }, { who: 'imp', text: '...' }, { who: 'imp', text: '*Tür zu*' },
    { title: 'ENDE?' },
  ],
};
/* ---------- Marx hints ---------- */
const MARX_HINTS = {
  1: ['Die Kartons gehören dem Volk. Aber du darfst sie werfen. Auf Helmträger zum Beispiel.', 'Blaue Röhren führen zu Bonusräumen. Der Mehrwert wartet unten.', 'Ein Abo ist oft dort versteckt, wo keiner hinschaut: oben. Ganz oben.'],
  2: ['Die Stadt ist offline. Such den Router, drück ↑. Aber das Signal ist wie das Kapital: ungleich verteilt.', 'Sinans Bizeps ist ein Produktionsmittel. Benutze ihn.', 'Die Techniker tragen Helme. Von unten anstoßen oder Kartons werfen. Ich sage nur: Basis und Überbau.', 'Hinter der Bonusröhre auf den Dächern liegt ein Router-Raum. Warp-Zone, sagt die Jugend.'],
  3: ['Wartenummern zieht man in Reihenfolge: 47, 48, 49, 50. Die 49 hängt hoch, wie die Bürokratie selbst.', 'Mit meinem Ausweis (Power-Block) hält man dich für mich. Sachbearbeiter ignorieren dich. Das ist der eigentliche Klassenkampf.', 'Formulare kleben. Sprung-Taste hämmern. Oder gleich die Papierkram-Allergie kaufen.'],
  4: ['Heuballen rollen bergab. Spring drüber, oder duck dich in eine Nische.', 'Die Kessel schießen Würste in einer Linie. Ducken hilft. Vegan bleiben auch.', 'Der Drachenlord prallt an der Wand ab. Dann ist er benommen. Dann springst du. Dialektik.'],
  5: ['Erst links, dann links, dann links... wie die Geschichte. Die Röhren gehören allen, aber die DRITTE von links gehört dir.', 'Unter Wasser: Sprung-Taste tippen zum Schwimmen. Die Ratten haben Currywurst. Nicht bestechlich.', 'Der König des Kabelsalats hat drei Stecker. Halte die Aktions-Taste, während die Arme vorbeiziehen.'],
  6: ['Honigwände: dagegen drücken und springen, so klettert man. Bienen mögen das nicht.', 'Soletti-Brücken halten 40 Frames. Also: nicht stehenbleiben. Nie stehenbleiben.', 'Der Bär schläft nach dem Honig. Ein schlafender Bauch ist ein Trampolin. Das ist Naturgesetz.'],
  7: ['Warteschleifen-Geister kommen nur näher, wenn du wegschaust. Schau sie an. Schau den Kapitalismus immer an.', 'Die Gondeln drehen sich. Warte auf die untere, fahr hoch, spring ab.', 'Der Ober will Trinkgeld. Fünf Münzen liegen im Café verteilt. Trage sie (Shift), leg sie ab (↓+Shift). Oder zahl. Aber dann sind wir nicht mehr befreundet.'],
  8: ['Cookie-Banner: der große Knopf spawnt Cookies. Der kleine oben rechts ("nur notw.") schließt. Spring drauf.', 'Zollschranken nehmen 25%. Über die Plattform darüber kommst du vorbei.', 'Der Algorithmus wird verwundbar, wenn der Abo-Knopf rot blinkt. Das ist die einzige Zeit, in der Abonnieren etwas nützt.'],
  9: ['Tickets laufen ab. Erst Ticket ziehen, dann schnell zur Schleuse.', 'Captcha: drei Felder haben Fahrräder. Die anderen nicht. Das ist der ganze Trick. Roboter scheitern daran.', 'Mario Barth: wenn er dich erwischt, hämmer alle Tasten. Ich habe ihn nie verstanden. Niemand hat.'],
  10: ['Alles zugleich: offline, Lag, Honig, Feuer. Bleib in Bewegung.', 'NIXI hat vier Phasen. Hörer stampfen, Nummern drücken, Techniker überleben, Stecker tragen.', 'Der Stecker gehört in die Buchse links oben. Trage ihn. Lass dich nicht von Pings ablenken.'],
};
const SPONSORS = { 1: { name: 'HAFI', slogan: 'Hafermilch, die dich versteht.' }, 2: { name: 'Späti24', slogan: 'Mate & Chips. Seit 3 Uhr nachts.' }, 3: { name: 'FormFrei', slogan: 'Die App, die deine Formulare ausfüllt. Irgendwann.' }, 4: { name: 'Seitan-Schmiede', slogan: 'Fleischersatz aus Franken. Etzala vegan.' }, 5: { name: 'RohrFrei', slogan: 'Abflussreiniger für jedes Röhrensystem.' }, 6: { name: 'Agavo', slogan: 'Der Honig ohne Bienenstress.' }, 7: { name: 'Melange-to-go', slogan: 'Wiener Kaffee. Ohne den Grant.' }, 8: { name: 'ThumbNail Pro', slogan: 'Clickbait für Einsteiger.' }, 9: { name: 'VPN-Vorhang', slogan: 'Damit nicht mal NIXNET sieht, dass du kein Internet hast.' }, 10: { name: 'Glasfaser-Gigi', slogan: 'Endlich Internet. Selbstbau-Set.' } };
const INTRO_TIMES = ['20:34', '21:02', '23:48', 'morgen früh', 'übermorgen', 'die Uhr hat aufgegeben', 'Dienstag?', 'Wien-Zeit', '404', 'irgendwann'];

/* ---------- Level definitions ---------- */
function L(no, def) { def.no = no; def.theme = def.theme || 'w' + no; def.music = def.music || 'w' + no; def.sponsor = SPONSORS[no]; def.hints = MARX_HINTS[no]; def.introTime = INTRO_TIMES[no - 1]; return def; }
const LEVELS = {
  1: () => L(1, {
    title: 'Umzugskartons', subtitle: 'Die neue Wohnung', powerItem: 'hafer', bonuses: ['bits', 'sinan'],
    main: assemble(['start_room', 'flat_k', 'w1_boxes', 'qrow', 'gap3', 'w1_stairwell', 'checkpoint', 'pipe_bonus', 'flat_r', 'stairs', 'poll_fork', 'marx', 'tower_holf', 'gap5_plat', 'checkpoint', 'pipe_bonus', 'brick_wall', 'sub2_climb', 'bits_arc', 'sub_hidden', 'gauntlet', 'end'],
      { polls: [{ A: 'Dach: Abkürzung', B: 'Keller: Bonus-Bits' }] }),
    scenes: { intro: 'l1_intro', outro: 'l1_outro' },
  }),
  2: () => L(2, {
    title: 'WLAN-Jagd im Kiez', subtitle: 'Nacht, Neon, NIXNET', powerItem: 'ball', bonuses: ['shop', 'warp'],
    main: assemble(['start', 'flat_k', 'w2_roofs', 'pipe_kabel', 'w2_offline', 'checkpoint', 'w2_ledge', 'sinan', 'pipe_bonus', 'w2_tech', 'poll_fork', 'moving_h', 'marx', 'checkpoint', 'w2_roofs', 'pipe_bonus', 'tower_holf', 'pit_spikes', 'sub2_climb', 'w2_tech', 'gift_ledge', 'sub_hidden', 'checkpoint', 'boss_pipe'],
      { polls: [{ A: 'Dächer: schneller', B: 'Straße: Späti-Bits' }] }),
    boss: ROOM_L2_BOSS, scenes: { intro: 'l2_intro', boss: 'l2_boss', outro: 'l2_outro' },
  }),
  3: () => L(3, {
    title: 'Das Amt', subtitle: 'Bürgeramt für Anschlussangelegenheiten', powerItem: 'marx', bonuses: ['bits', 'marx'],
    main: assemble(['start', 'w3_flur', 'w3_formular', 'w3_ordner', 'checkpoint', 'pipe_bonus', 'w3_warte', 'marx', 'poll_fork', 'w3_flur', 'low_ceiling', 'checkpoint', 'sinan', 'w3_ordner', 'tower_holf', 'w3_formular', 'pipe_bonus', 'sub2_climb', 'dieb', 'w3_flur', 'sub_hidden', 'checkpoint', 'brb_block', 'gauntlet', 'end'],
      { polls: [{ A: 'Chefetage: Aktenordner', B: 'Wartesaal: Formulare' }] }),
    scenes: { intro: 'l3_intro', outro: 'l3_outro' }, holfKind: 'silver',
  }),
  4: () => L(4, {
    title: 'Schanzenhof', subtitle: 'Fränkische Provinz', powerItem: 'ball', bonuses: ['sinan', 'bits'],
    main: assemble(['start', 'flat_r', 'w4_heu', 'w4_grill', 'checkpoint', 'w4_kessel', 'pipe_bonus', 'w4_fence', 'poll_fork', 'marx', 'w4_heu', 'checkpoint', 'w4_grill', 'tower_holf', 'sub2_climb', 'pipe_bonus', 'w4_kessel', 'pit_enemy', 'sub_hidden', 'checkpoint', 'w4_fence', 'boss_pipe'],
      { polls: [{ A: 'Zaun: umgehen', B: 'Grillfest: durch' }] }),
    boss: ROOM_L4_BOSS, scenes: { intro: 'l4_intro', boss: 'l4_boss', outro: 'l4_outro' }, holfKind: 'green',
  }),
  5: () => L(5, {
    title: 'Röhren-Labyrinth', subtitle: 'Berliner Unterwelt', powerItem: 'ball', bonuses: ['bits', 'warp'],
    main: assemble(['start', 'flat_k', 'w5_buffer', 'water', 'checkpoint', 'pipe_bonus', 'w5_ghost', 'marx', 'w5_pipes', 'dead_end']),
    sec2: Object.assign(assemble(['sec_start', 'w5_watermaze', 'checkpoint', 'w5_ghost', 'poll_fork', 'tower_holf', 'pipe_bonus', 'sub2_climb', 'w5_buffer', 'checkpoint', 'sub_hidden', 'w5_ghost', 'boss_pipe'], { polls: [{ A: 'Oberes Rohr: trocken', B: 'Unteres Rohr: nass' }] }), { pipeTags: null }),
    maze: { pipeTags: ['in', 'out'], fallDeath: false, map: ['%%%%||%%%%%%%%%%%%%%%%%%', '%...||.................%', '%...dd.................%', '%......................%', '%......................%', '%.....q.....q..........%', '%....XXXX..XXXX........%', '%......................%', '%......................%', '%......................%', '%..................b...%', '%......b..........uu...%', '%.................||...%', '%######################%', '%%%%%%%%%%%%%%%%%%%%%%%%'], ents: [{ t: 'sign', x: 10, y: 10, text: 'Falsche Röhre! "Erst links, dann links..." Zurück.' }] },
    boss: ROOM_L5_BOSS, scenes: { intro: 'l5_intro', outro: 'l5_outro' }, holfKind: 'bronze',
    mazeLinks: true,
  }),
  6: () => L(6, {
    title: 'Honigwald', subtitle: 'Bitte nicht füttern', powerItem: 'banana', bonuses: ['bits', 'sinan'],
    main: assemble(['start', 'w6_honey', 'w6_hive', 'w6_wall', 'checkpoint', 'w6_soletti', 'pipe_bonus', 'poll_fork', 'marx', 'w6_honey', 'dieb', 'checkpoint', 'tower_holf', 'w6_wall', 'sub2_climb', 'pipe_bonus', 'w6_soletti', 'w6_hive', 'sub_hidden', 'checkpoint', 'moving_v', 'boss_pipe'],
      { polls: [{ A: 'Baumkronen: Bienen', B: 'Waldboden: Honig' }] }),
    boss: ROOM_L6_BOSS, scenes: { intro: 'l6_intro', boss: 'l6_boss', outro: 'l6_outro' }, holfKind: 'green',
  }),
  7: () => L(7, {
    title: 'Wien bei Nacht', subtitle: 'Oida.', powerItem: 'banana', bonuses: ['shop', 'sub3'],
    main: assemble(['start', 'flat_k', 'w7_fiaker', 'w7_dark', 'checkpoint', 'pipe_bonus', 'w7_gondel', 'marx', 'poll_fork', 'w7_dark', 'checkpoint', 'tower_holf', 'w7_fiaker', 'sub2_climb', 'pipe_bonus', 'w7_gondel', 'dieb', 'sub_hidden', 'checkpoint', 'w7_dark', 'boss_pipe'],
      { polls: [{ A: 'Prater: Gondeln', B: 'Gassen: Grantler' }] }),
    boss: ROOM_L7_BOSS, scenes: { intro: 'l7_intro', boss: 'l7_boss', outro: 'l7_outro' }, holfKind: 'silver', dark: true,
  }),
  8: () => L(8, {
    title: 'YouTube-Tower', subtitle: 'Nach oben, um jeden Preis', powerItem: 'ball', bonuses: ['bits', 'sinan'],
    main: assemble(['start', 'w8_gnom', 'w8_firewall', 'w8_cookie', 'w8_clickbait', 'checkpoint', 'w8_demon', 'pipe_bonus', 'poll_fork', 'marx', 'w9_zoll', 'w8_gnom', 'checkpoint', 'sub2_climb', 'w8_firewall', 'pipe_bonus', 'tower_holf', 'w8_clickbait', 'dieb', 'sub_hidden', 'checkpoint', 'sec_pipe'],
      { polls: [{ A: 'Trending: Zoll', B: 'Nische: Cookies' }] }),
    tower: Object.assign(genTower(88, 60, { enemies: ['t', 'C'], clickbait: true }), { pipeTags: ['toBoss'], autoScroll: { vy: -0.25 }, fallDeath: true }),
    cookieBanner: true,
    boss: ROOM_L8_BOSS, scenes: { intro: 'l8_intro', boss: 'l8_boss', outro: 'l8_outro' }, holfKind: 'bronze',
  }),
  9: () => L(9, {
    title: 'NIXNET-Zentrale', subtitle: 'Ihr Anschluss ist uns wichtig', powerItem: 'marx', bonuses: ['marx', 'shop'],
    main: assemble(['start', 'w9_barth', 'w9_ticket', 'w9_router', 'checkpoint', 'w9_captcha', 'w9_lag', 'pipe_bonus', 'poll_fork', 'marx', 'w9_zoll', 'w3_ordner', 'checkpoint', 'w9_ticket', 'tower_holf', 'sub2_climb', 'pipe_bonus', 'w9_router', 'w9_barth', 'dieb', 'sub_hidden', 'checkpoint', 'w9_lag', 'boss_pipe'],
      { polls: [{ A: 'Callcenter: Bots', B: 'Serverraum: Router' }] }),
    captcha: true,
    boss: ROOM_L9_BOSS, scenes: { intro: 'l9_intro', boss: 'l9_boss', outro: 'l9_outro' }, holfKind: 'silver',
  }),
  10: () => L(10, {
    title: 'Glasfaser-Unterwelt', subtitle: 'Kein Netz. Kein Stream. Kein Plan.', powerItem: 'banana', bonuses: ['sinan', 'shop'],
    main: assemble(['start', 'w10_stream', 'w10_mix', 'checkpoint', 'w9_lag', 'w6_wall', 'pipe_bonus', 'poll_fork', 'marx', 'w10_stream', 'w8_firewall', 'checkpoint', 'w5_buffer', 'tower_holf', 'w10_mix', 'sub2_climb', 'pipe_bonus', 'lava_hop', 'w9_router', 'dieb', 'sub_hidden', 'checkpoint', 'w10_stream', 'boss_pipe'],
      { polls: [{ A: 'Backbone: Ping-Hölle', B: 'Wartungsschacht: Lag' }] }),
    boss: ROOM_L10_BOSS, scenes: { intro: 'l10_intro', boss: 'l10_boss' }, holfKind: 'gold',
  }),
};
/* ---------- Hub ---------- */
const HUB_DEF = { theme: 'hub', music: 'hub', fallDeath: false, map: [
  '%........................................%', '%........................................%', '%........................................%', '%........................................%', '%........................................%', '%........................................%', '%........................................%', '%........................................%',
  '%........................................%', '%........................................%', '%........................................%', '%.....P..................................%', '%........................................%', '##########################################', '##########################################'] };
