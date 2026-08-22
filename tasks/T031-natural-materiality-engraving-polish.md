---
id: T031
status: done
priority: P0
dependencies: [T030]
---
# Natural Materiality & Engraving Polish

## Anlass

Die aktuelle Demo war technisch stabil und hochwertig gerahmt, wirkte in einzelnen Schmuckdetails aber noch zu symbolisch: Rauten, Diamantmarker und abstrakte Geometrien lasen sich eher als gezeichnete Luxusgrafik als als reale Metallfassung, Gravur oder architektonisches Relief.

## Ziel

Die Sales-Demo wirkt ruhiger, materieller und echter: konkave Einzüge, eingefasste Kerben, gravurartige Mittelstücke, gebaute Trenner und erkennbare Objekt-Line-Art statt schwebender Symbolornamentik. Gold bleibt Material an Kanten, Rahmen, Reliefs und Einlagen – nicht flächige Dekoration.

## Umsetzung

- Angebotsmotive von abstrakten Rechteck-/Kreis-Symbolen auf gravurartige Objektzeichnungen für Fotobox, Fotospiegel und Magazinbox umgestellt.
- Future-, Chapter- und Section-Divider-Rauten durch konkave, eingeschnitten wirkende SVG-Fassungen ersetzt.
- Future-Medaillons von runden Emblemen zu eingelassenen Nummerntafeln umgebaut.
- Future-Vertikalmarke, Regeln und Fußdetails als metallische Schienen, Rillen und Einlagen ausgeführt.
- Eckornamente der Rahmen von diagonalen Symbolmarken zu radialen, eingefassten Eckrückläufen naturalisiert.
- Hero-Monogramm als eingelassene Metallplakette statt schwebendem Quadrat gefasst.
- Future-Hintergrund ruhiger und architektonischer ausformuliert; symbolische Kreuze/Pfeile reduziert.
- T020-Tablet-Geometrie und T030-Footer-Schließung erhalten.

## Validierung

`npm run verify` lief vollständig grün in Grabowski-Task `8dd4c91d281d4606a0f732b2` und enthielt unter anderem:

- `npm run test:form` → `inquiry-form-ui-ok`
- `npm run test:quality` → `quality-baseline-ok`
- `npm run test:demo` → `sales-demo-isolation-ok`
- `npm run check` → 0 Fehler, 0 Warnungen, 0 Hinweise
- `npm run build` → PASS
- Worker-/Site-Schritte ausschließlich als Wrangler-Dry-Run → PASS

Zusätzlich lief `npm run test:demo` separat in Task `e11ebad393074d83a0df2b81` grün.

Demo-Isolation:

- `launchStatus=draft`
- `noindex=true`
- `apiCalls=0`
- Demo-CSS: 24.964 Byte

Chrome/Brave-CDP-Readback über isolierten Grabowski-Browserworker `d2230862b2294458843f`, danach sauber gestoppt und Profil/Port freigegeben:

| Viewport | overflowX | framesOutside | ornamentsOutside | offerSvgClipped | Footer unten |
|---|---:|---:|---:|---:|---:|
| 1440×1000 | 0 | 0 | 0 | 0 | 3px |
| 1366×1024 | 0 | 0 | 0 | 0 | 3px |
| 834×1112 | 0 | 0 | 0 | 0 | 3px |
| 768×1024 | 0 | 0 | 0 | 0 | 3px |
| 621×900 | 0 | 0 | 0 | 0 | 3px |
| 620×900 | 0 | 0 | 0 | 0 | 2px |
| 390×844 | 0 | 0 | 0 | 0 | 2px |
| 340×844 | 0 | 0 | 0 | 0 | 2px |

Der Assertions-Lauf `6f4f97a014e84e2abf6f2f7a` endete mit `VIEWPORT_ASSERTIONS=PASS`; der JSON-Metriklauf `b1cbed6d105646d9a9601eb9` belegt die Einzelwerte.

`git diff --check` → PASS.

## Scope-Nachweis

Geändert wurden ausschließlich Demo-Darstellung und Repo-Taskdokumentation. Keine Produktionsfreischaltung, keine Worker-/D1-/API-/Preis-/Kunden-/Buchungsänderung. Der bestehende T018-Preview-Prozess auf Port 4334 / Funnel 10000 wurde während Entwicklung und Validierung nicht verändert.
