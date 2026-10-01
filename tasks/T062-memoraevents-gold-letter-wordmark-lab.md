---
id: T062
status: active
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

- [ ] /demo/memoraevents-logo/ rendert die Materialglyphen sichtbar
- [ ] Seite ist noindex
- [ ] bestehende Production-/Demo-Startseite bleibt unverändert
- [ ] Desktop und Mobile ohne horizontalen Overflow
- [ ] Build und relevante Repo-Prüfungen grün
- [ ] Ergebnis visuell als Vergleich dokumentiert; keine automatische Produktionsfreigabe

## Arbeitsjournal

- 2026-10-01: isolierter Worktree von main @ 9055903b40301759eca9f1290beb55d91e2236ff angelegt.
- 2026-10-01: neun benötigte Materialglyphen aus dem verifizierten Livia-Quellbestand für den Design-Lab-Slice kopiert.
