import glob, os, re
files = sorted(glob.glob('src/*.js'))
js = '\n'.join(open(f, encoding='utf-8').read() for f in files)
html = '''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>imps Adventure – Kein Netz. Kein Stream. Kein Plan.</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { margin: 0; padding: 0; background: #0e0e10; height: 100%; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; font-family: monospace; color: #efeff1; }
  canvas { image-rendering: pixelated; image-rendering: crisp-edges; background: #0e0e10; outline: none; box-shadow: 0 0 40px rgba(145,70,255,0.25); }
  #hint { position: fixed; bottom: 6px; left: 0; right: 0; text-align: center; font-size: 12px; color: #53535f; pointer-events: none; }
</style>
</head>
<body>
<canvas id="game" tabindex="0"></canvas>
<div id="hint">imps Adventure · Tastatur: ←→ laufen · Space springen · Shift rennen/werfen · ↓ Röhre · E Perk · H Marx · Esc Pause · M Ton</div>
<script>
''' + js + '''
</script>
</body>
</html>
'''
open('imps-adventure.html', 'w', encoding='utf-8').write(html)
print('bundled', len(html), 'bytes,', len(files), 'files')
