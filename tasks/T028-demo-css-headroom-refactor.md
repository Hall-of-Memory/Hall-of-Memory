---
id: T028
status: done
priority: P1
dependencies: [T023, T027]
---
# Demo CSS Headroom Refactor

## Anlass

Die Sales-Demo lag nach T023/T027 bei `28659` Byte CSS gegenüber dem damaligen harten Demo-Limit von `28672` Byte. Die verbleibenden 13 Byte Reserve waren für kommende Logo-, Brand- und Responsive-Anpassungen technisch ungesund. Ursache war nicht allein die Demo-Art-Direction: `BaseLayout` importierte die komplette `global.css`, sodass `/demo/` auch zahlreiche ausschließlich für die reguläre Startseite bestimmte Regeln auslieferte.

## Umgesetzt

- gemeinsame Design-, Accessibility-, Navigation-, Formular- und Footer-Primitiven nach `src/styles/base.css` extrahiert
- reguläre Startseiten-spezifische Regeln in `src/styles/site.css` isoliert
- `BaseLayout` lädt nur noch die gemeinsame Basis; `index.astro` lädt zusätzlich die Site-Regeln
- die bisherige monolithische `global.css` entfällt
- Demo-Markup, Art-Direction, Anfrage-Logik, Worker, D1 und T018 wurden nicht verändert
- `scripts/test-sales-demo.mjs` verwendet die neue Basisdatei und erzwingt nun ein 26-KiB-CSS-Ceiling, damit mindestens 2 KiB Reserve gegenüber 28 KiB dauerhaft erhalten bleiben

## Ergebnis

- Demo-CSS vorher: `28659` Byte
- Demo-CSS nachher: `23546` Byte
- Reserve gegenüber 28 KiB vorher: `13` Byte
- Reserve gegenüber 28 KiB nachher: `5126` Byte
- Reduktion: `5113` Byte bzw. rund 17,8 %
- reguläre Startseite: `9756` Byte externe CSS-Assets und damit weiterhin deutlich innerhalb ihres Quality-Budgets

## Evidenz

Implementierung:
- `95380759a8e28e9d8d26c85abbdf0976457baae9` — `refactor: restore demo css headroom`

Automatische Regression:
- Grabowski-Task `5d7a81c183ef46068eb643c2`: vollständiges `npm run verify` PASS, einschließlich Inquiry-Smoke, Availability, Gallery-Access, Form, Quality, Demo, Astro-Check, Build sowie Worker-/Site-Dry-Runs
- `sales-demo-isolation-ok ... css=23546 ...`
- `quality-baseline-ok ... css=9756 ...`
- `git diff --check` PASS

Browser-Readback:
- Grabowski-Task `eb24444915fe45cea11ece58`: `/`, `/demo/`, `/impressum/`, `/datenschutz/` jeweils bei `1440×1000`, `834×1112`, `390×844`, `340×844`
- 16/16 Kombinationen HTTP 200
- 16/16 `scrollWidth == innerWidth`, also 0 px horizontaler Overflow
- keine `>=400`-Assetantworten, Console-Errors oder Page-Errors
- zentrale Demo-Komponenten behalten Grid-, Farb- und Typografie-Stile

Externer Preview-Readback:
- Grabowski-Task `c1824e63b5b944b5b7928797` auf `wg-prod-1`: `/`, `/demo/`, `/impressum/`, `/datenschutz/` jeweils HTTP 200
- alle referenzierten externen CSS-Assets jeweils HTTP 200
- Draft-/`noindex,nofollow`-Status bleibt erhalten

## Abschluss

T028 ist `done`. Die Demo besitzt wieder belastbare CSS-Reserve für kommende Logo-/Brand- und optionale Responsive-Polishes, ohne dass dafür die bestehende Gestaltung vereinfacht oder T018 verändert werden musste.
