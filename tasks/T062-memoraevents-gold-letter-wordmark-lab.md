---
id: T062
status: done
priority: P1
dependencies: [T061]
---
# Memoraevents Goldletter-Wordmark als isoliertes Design-Lab prüfen

## Ziel

Die bereits verifizierten gegossenen Goldletter-Master aus dem zentralisierten Livia/Schauwerk-Bestand werden ausschließlich in einer isolierten, noindex Design-Lab-Seite für die neue Marke MEMORAEVENTS ausprobiert.

Production, bestehendes Hall-of-Memory-Logo, Anfragefluss und Live-Domain bleiben unverändert.

## Scope

- nur die neun unterschiedlichen bestätigten A–Z-Glyphen, die MEMORAEVENTS benötigt
- direkte PNG-Materialmaster; keine CSS-Rekonstruktion als Materialquelle
- Vergleich verschiedener Abstände/Größen im Schwarz-Gold-Kontext
- CSS-Gold nur als Referenzachse
- responsive Prüfung ohne horizontalen Overflow

## Quelle

Fundus-/Livia-Masterfamilie gold-letters-2026-09-08.

Originalmaster SHA-256:
8555fa52d2aae2fda730c36a53fcafa68486dee73ddf515abfd41b00a99b17b1

Für den Lab-Slice verwendete Glyphen:
A E M N O R S T V.

## Akzeptanz

- [x] /demo/memoraevents-logo/ rendert die Materialglyphen sichtbar
- [x] Seite ist noindex
- [x] bestehende Production-/Demo-Startseite bleibt unverändert
- [x] Desktop und Mobile ohne horizontalen Overflow
- [x] Build und relevante Repo-Prüfungen grün
- [x] Ergebnis visuell als Vergleich dokumentiert; keine automatische Produktionsfreigabe

## Evidenz

- Alle neun Lab-PNGs sind SHA-256-identisch mit den verifizierten Livia-Quellglyphen.
- Astro-Check: 0 Fehler, 0 Warnungen, 0 Hinweise.
- Gezielter echter Chrome/CDP-Readback:
  - 1440×1000: scrollWidth=clientWidth=1440
  - 768×1024: scrollWidth=clientWidth=768
  - 390×844: scrollWidth=clientWidth=390
  - noindex/nofollow gesetzt, alle 12 Glyphen je Material-Wordmark geladen, keine gebrochenen Bilder.
- Screenshots: docs/memoraevents-gold-letter-lab/desktop.png und mobile.png.
- Vollständiger kanonischer Verify auf dem Design-Slice: 23 PASS, 0 FAIL, 0 BLOCKED.
- Draft-PR #70 hält den Versuch von Production getrennt.

## Visueller Befund

- In Signature-/Editorial-Größe bleibt die reale Goldmaterialität deutlich sichtbar: Glanzkanten, plastische Wölbung und lokale Schattierung wirken wesentlich materieller als die CSS-Gegenprobe.
- Die Letterformen sind stark kalligrafisch; dadurch liest sich MEMORAEVENTS als dekorativer Marken-Schriftzug und nicht wie neutrale Versalschrift.
- In der aktuellen kleinen Header-Simulation sinken Detailwirkung und schnelle Lesbarkeit deutlich. Das ist ein Befund dieser konkreten Skalierung, kein Beweis, dass ein eigens optisch kalibrierter Header-Lockup mit denselben Masterglyphen nicht funktionieren kann.
- Auf 390 px passt auch die luftigere Variante ohne Overflow; für eine spätere Produktionswahl bleiben Lesbarkeit und Markencharakter eine bewusste Designentscheidung.

## Arbeitsjournal

- 2026-10-01: isolierter Worktree von main @ 9055903b40301759eca9f1290beb55d91e2236ff angelegt.
- 2026-10-01: neun benötigte Materialglyphen aus dem verifizierten Livia-Quellbestand für den Design-Lab-Slice kopiert.
- 2026-10-01: noindex-Lab mit Signature-, Editorial-, Header- und CSS-Gegenprobe erstellt.
- 2026-10-01: Chrome/CDP-Readback bei 1440, 768 und 390 px sowie vollständigen Repo-Verify erfolgreich abgeschlossen.
- 2026-10-01: Screenshots versionsgebunden dokumentiert und Draft-PR #70 geöffnet; keine Production-Mutation.
