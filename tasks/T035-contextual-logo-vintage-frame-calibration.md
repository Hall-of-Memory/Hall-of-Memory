---
id: T035
status: done
priority: P0
dependencies: [T031, T032, T033]
---
# Kontextabhängige Logofassung und kuratiertes Vintage-Rahmensystem

## Anlass

Die Event-first-Runde T032 reduzierte die Rahmendichte bewusst. Die anschließende Designprüfung präzisiert die Kundenrückmeldung: Goldrahmen passen zur Marke und sollen nicht verschwinden. Gefordert ist weniger Dauerrahmung, nicht weniger Markencharakter. Gleichzeitig sollen die gelieferten Logo-Farbvarianten kontextabhängig statt über einen zusätzlichen Theme-Schalter verwendet werden.

## Ziel

- eine kuratierte dunkle Premium-Hauptwelt ohne User-Light-/Dark-Toggle
- transparente Creme-/Gold-SVG auf dunklen Flächen
- kontrastierende dunkle Designerfassung auf heller Cremefläche
- Rahmenfamilie mit Vintage-Kamera-/Messing-/Atelier-Anmutung
- drei klar verschiedene Stärken: Signature, Produktkarten, Utility
- mehr Luft und weniger ornamentale Dauerpräsenz trotz sichtbarer Goldmaterialität

## Umsetzung

- Hero-Fassung mit heller Lichtkante, dunkler Messing-Gegenkante, innerer Fase und zurückhaltenden Eckrückläufen verstärkt
- Angebotskarten auf leichtere Doppelkontur mit zurückgesetzter Innenlinie umgestellt
- Paketkarten nur mit zurückhaltender Messingkante versehen
- persönlicher Galerie-Zugang als zweites Signature-Element mit gefasster Doppelkontur erhalten
- Anfrageformular bewusst rahmenärmer kalibriert
- Kontaktkarte auf Creme nur leicht gefasst und dort die dunkle Designer-JPG statt der hellen JPG eingesetzt
- kein Theme-Toggle und keine zusätzliche Theme-Logik eingeführt
- Designerdateien selbst unverändert gelassen; Hash-Vertrag aus T033/T034 bleibt bestehen

## Schauwerk-Prüfung

Schauwerk wurde live geprüft. Der aktuelle Stand bietet Fundus-Asset-Governance sowie deterministische Visual-Preview-/Regression-Funktionen für strukturierte Darstellungen. Eine allgemeine Browser-/DOM-/Pixelabnahme beliebiger Websites ist dort noch keine fertige Produktoberfläche. Für diese Runde bleibt daher echter Chrome/CDP-Readback die passendere visuelle Prüfung; Schauwerk wird nicht künstlich als Zwischenlage eingebaut.

## Sicherheitsgrenzen

- keine Produktionsfreischaltung
- keine Worker-, D1-, Anfrage-API-, Preis-, Kunden- oder Buchungsänderung
- T018-Preview-Prozess und Funnel werden weder übernommen noch neu gestartet noch gestoppt
- keine Änderungen im Schauwerk-Repository

## Akzeptanz

- [x] Rahmeninterpretation fachlich korrigiert und dokumentiert
- [x] kein Theme-Toggle eingeführt
- [x] kontrastierende Logofassung auf heller Kontaktfläche eingesetzt
- [x] Signature-/Produkt-/Utility-Hierarchie im CSS abgebildet
- [x] Demo-Regressionssuite und Volltest grün
- [x] echter Responsive-Readback grün
- [x] kanonischer `dist` aktualisiert und bestehende T018-Preview darauf readbackt


## Verifikation und Readback

- Ein erster Demo-Test schlug ausschließlich am unverändert beibehaltenen 28-KiB-CSS-Budget an. Statt das Budget anzuheben, wurden veraltete Logo-Monogramm-Regeln und der symbolische Hero-Orbit entfernt sowie Doppelrahmung verdichtet.
- `npm --silent run test:demo`: PASS; `html=21144`, `css=28480`, `js=1057`, `gzip=14174`.
- Vollständiges `npm run verify`: PASS über Grabowski-Job `e250183274d8`; finale Demo-Messung `html=21144`, `css=28245`, `js=1057`, `gzip=14136`; `astro check` mit 0 Fehlern/0 Warnungen/0 Hinweisen; Worker- und Site-Wrangler-Dry-Runs grün.
- Echter isolierter Chrome-CDP-Worker `a1843830195d45ee9d33`: acht Viewports `1440×1000`, `1366×1024`, `834×1112`, `768×1024`, `621×900`, `620×900`, `390×844`, `340×844`; überall `overflowX=0`, `outsideFrames=0`; Marker `T035_RESPONSIVE_FRAME_READBACK_PASS`.
- CDP bestätigte die Hierarchie messbar: Hero-Außenkante `rgba(239, 216, 163, 0.52)`, Hero-Innenkante `rgba(234, 211, 155, 0.26)`, Angebotskante `rgba(201, 167, 100, 0.27)`, Anfragekante nur `rgba(234, 211, 155, 0.11)`.
- Kontextlogo im Browser: `/brand/hall-of-memory-logo-dark.jpg`; Theme-Steuerungen `0`; alter Hero-Orbit `0`.
- Bestehende T018-Funnel-Preview wurde ohne Runtime-Neustart aus dem aktualisierten kanonischen `dist` gelesen. Öffentliche `/demo/`-HTML war byteidentisch zum lokalen Build: SHA-256 `e63ea7bb121e01e0faf64f0e02f06783e4a0f208ebcb51e2c10ed152a94ea85e`. Die ausgelieferte dunkle Designer-JPG blieb byteidentisch zur kanonischen Datei: SHA-256 `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`.
- Der Browserworker wurde anschließend sauber gestoppt; Port/Profil-Leases wurden freigegeben.
