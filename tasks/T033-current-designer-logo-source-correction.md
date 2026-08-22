---
id: T033
status: done
priority: P0
dependencies: [T032]
---
# Aktuelle Designer-Logoquelle aus neuerer Kundenmail korrigieren

## Anlass

Die Event-first-Runde T032 hatte die ältere Mail „HOM“ von 12:52:02 Uhr und deren ZIP als aktuellsten Markenstand behandelt. Der Kunde hat klargestellt, dass diese eingebauten Dateien falsch sind.

Der frische Mail-Readback belegt eine **neuere Mail „Logos“ vom 13.08.2026, 13:01:59 Europe/Berlin** desselben Absenders. Sie enthält die aktuellen Designer-Einzelquellen und ist für die Markenassets autoritativ.

## Belegte Quellen

- SVG `59080_Hall of Memory_PP-01.svg`: `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`
- dunkle JPG-Fassung `59080_Hall of Memory_PP-01-01.jpg`: `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`
- helle JPG-Fassung `59080_Hall of Memory_PP-02-01.jpg`: `7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e`
- weitere Quellen der Mail: PNG, AI und PDF; Hashes in `docs/customer-feedback-2026-08-13.md`.

## Umsetzung

- alte ZIP-abgeleitete `hall-of-memory-mark-01.webp` und `hall-of-memory-mark-02.webp` entfernt
- Designer-SVG byteidentisch als `/brand/hall-of-memory-logo-primary.svg` übernommen
- aktuelle dunkle und helle JPG-Fassung byteidentisch als Markenreferenzen übernommen
- Header und Footer vom improvisierten HM-Monogramm auf das echte Designer-SVG umgestellt
- Hero nutzt das echte Logo nur als Logo und reserviert die große Medienfläche ausdrücklich für echtes Eventfoto/Video
- Galerie verwendet keine Logodatei mehr als vermeintliche Eventaufnahme
- Regressionstest bindet alle drei übernommenen Quellen an die exakten Mail-SHA-256-Werte
- Dokumentation und T010 auf die neuere Mail-Evidenz korrigiert

## Sicherheits-/Authentizitätsprüfung

Das SVG enthält bei statischer Prüfung keine `<script>`-, `foreignObject`-, `javascript:`-, Eventhandler- oder externen HTTP(S)-Referenzen. Die Datei wird nicht umgeschrieben; der SHA-256 im Repository muss exakt dem Mailanhang entsprechen.

## Qualitätsbeleg

- `npm run test:demo`: PASS; aktuelle Designerquellen hashgebunden
- vollständiger `npm run verify`: Grabowski-Job `e2787afb676d`, `succeeded`, Receipt SHA-256 `401e756d6f1d9b10932e5d804c870e087f71a1c07dac9c1f55c03902f04001f0`
- `git diff --check`: PASS
- echter isolierter Chrome-CDP-Readback in 1440×1000, 1366×1024, 834×1112, 768×1024, 621×900, 620×900, 390×844 und 340×844: `overflowX=0`, keine Karten/Logos außerhalb des Viewports, alte WebPs abwesend; `CURRENT_DESIGNER_ASSET_VIEWPORTS=PASS`

## Restzustand

Echte Event-/Produktbilder wurden in der aktuellen „Logos“-Mail nicht als solche belegt. Diese fehlen weiterhin in T010 und dürfen nicht durch Logodateien simuliert werden.

## Akzeptanz

- [x] neuere Mail als autoritativen Markenstand identifiziert
- [x] alte ZIP-Ableitungen entfernt
- [x] Designer-SVG unverändert übernommen
- [x] Logo und Eventfotografie getrennt
- [x] Quellen hashgebunden getestet
- [x] Repo-Dokumentation korrigiert
