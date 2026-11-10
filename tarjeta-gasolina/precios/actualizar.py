"""Precios de combustible de las gasolineras de la tarjeta.
Toma los precios que la CRE publica por estación (publicacionexterna.azurewebsites.net) y los cruza,
por ubicación, con la lista oficial de gasolineras de la tarjeta (estaciones.js). Escribe precios.json.
Lo corre GitHub Actions cada día (.github/workflows/precios-gasolina.yml)."""
import json, math, re, sys, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

BASE = 'https://publicacionexterna.azurewebsites.net/publicaciones/'
AQUI = __file__.rsplit('/', 2)[0]

def bajar(n):
    with urllib.request.urlopen(urllib.request.Request(BASE + n, headers={'User-Agent': 'Mozilla/5.0'}), timeout=180) as r:
        return ET.fromstring(r.read())

def dist(a, b, c, d):
    R = 6371000; p1, p2 = math.radians(a), math.radians(c)
    x = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(d - b) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))

src = open(AQUI + '/estaciones.js', encoding='utf-8').read()
ests = json.loads(src[src.index('['):src.rindex(']') + 1])

lugares = {}
for p in bajar('places').iter('place'):
    try:
        x, y = float(p.findtext('location/x')), float(p.findtext('location/y'))
    except (TypeError, ValueError):
        continue
    if 27.5 < y < 33 and -118 < x < -112:  # solo Baja California
        lugares[p.get('place_id')] = {'n': (p.findtext('name') or '').strip(), 'cre': (p.findtext('cre_id') or '').strip(), 'la': y, 'lo': x}
precios = {}
for p in bajar('prices').iter('place'):
    if p.get('place_id') in lugares:
        precios[p.get('place_id')] = {g.get('type'): float(g.text) for g in p.findall('gas_price') if g.text}

con = [(k, v) for k, v in lugares.items() if precios.get(k)]
salida, sin = {}, []
for e in ests:
    if e.get('la') is None:
        sin.append(e['p']); continue
    cand = sorted((dist(e['la'], e['lo'], v['la'], v['lo']), k) for k, v in con)
    if not cand or cand[0][0] > 350:
        sin.append(e['p']); continue
    d, k = cand[0]
    pr = precios[k]
    salida[e['p']] = {k2: pr[k1] for k1, k2 in (('regular', 'magna'), ('premium', 'premium'), ('diesel', 'diesel')) if k1 in pr}
    salida[e['p']]['m'] = round(d)

hoy = datetime.now(timezone(timedelta(hours=-8))).strftime('%Y-%m-%d')
json.dump({'actualizado': hoy, 'fuente': 'CRE · precios por estación', 'p': salida}, open(AQUI + '/precios.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'Estaciones de la tarjeta: {len(ests)} · con precio: {len(salida)} · sin cruce: {len(sin)}')
print('Distancias:', sorted(v['m'] for v in salida.values())[-10:])
print('Sin cruce:', ', '.join(sin))
