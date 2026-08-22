---
id: T030
status: done
priority: P0
dependencies: [T029]
---
# Footer Frame Closure & Final Polish

## Anlass

Im echten iPad-Preview ist die untere Footer-Tafel visuell nach unten offen. Der Live-CSS-Befund bestätigt die Ursache: `.demo-footer` setzt trotz `demo-ornate-frame` explizit `border-bottom:0` und unterdrückt damit die äußere Goldfassung an der Unterkante.

## Ziel

Die letzte Tafel muss wie alle anderen Premium-Panels vollständig gefasst wirken. Die Goldfassung soll an allen vier Seiten geschlossen sein und am Dokumentende genug dunklen Freiraum besitzen, damit die Unterkante auch auf Tablet-Browsern eindeutig als vollständiger Rahmen lesbar bleibt.

## Scope

- ausschließlich `src/styles/demo.css` sowie diese Task-/Index-Dokumentation;
- keine neue JavaScript-Logik;
- T018-Preview-Infrastruktur nicht verändern;
- keine Produktionsroute, Worker-, D1-, API-, Preis- oder Kundendatenänderungen.

## Abnahme

- Footer-Außenfassung unten sichtbar geschlossen;
- kleiner dunkler Abschlussraum unter dem Footer verhindert optisches Anschneiden am Viewport-/Browserrand;
- kein horizontaler Overflow in den T029-Referenz-Viewports;
- `npm run test:demo`, `test:form`, `test:quality`, `check`, `build`, `verify` und `git diff --check` grün;
- Demo-CSS bleibt unter 26 KiB;
- öffentlicher T018-Readback nach Rebuild erfolgreich und weiterhin `noindex,nofollow`, `launchStatus=draft`, `apiCalls=0`.

## Abschlussbeleg

- Root cause beseitigt: die explizite Unterdrückung `border-bottom:0` an `.demo-footer` wurde entfernt; die bestehende mehrstufige `demo-ornate-frame`-Goldfassung läuft damit wieder über alle vier Seiten.
- Unter dem Footer liegt nun `margin-bottom:clamp(18px,3vw,36px)`, damit die untere Metallkante nicht mit Browser-/Viewportabschluss verschmilzt.
- Echter Chrome/CDP-Readback in `1440×1000`, `1366×1024`, `834×1112`, `768×1024`, `621×900`, `620×900`, `390×844`, `340×844`: `overflowX=0`, `framesOutside=0`, Footer-Unterkante jeweils `solid` mit `3px` bzw. mobil `2px`; Abschlussraum mindestens `17.86px`; `VIEWPORT_ASSERTIONS=PASS`.
- Vollständige Gates grün: `npm run test:demo`, `npm run test:form`, `npm run test:quality`, `npm run check`, `npm run build`, `npm run verify`, `git diff --check`.
- Demo-Isolation: `noindex,nofollow`, `launchStatus=draft`, `apiCalls=0`.
- CSS-Budget: Demo-Test `25566 / 26624` Bytes, weiterhin unter 26 KiB.
- Öffentlicher T018-Readback nach Rebuild: HTTP/2 `200`; lokales und öffentliches HTML SHA-256 `fb55806f4edf9cbdab43291aa04c354c01df0cc0019cc9a1931b7368dc982e62`; Demo-CSS SHA-256 `5f77eeb1b82a8c132c306eb3a764135157b327f1cb077164c019d4b56e362bfa`; Base-CSS SHA-256 unverändert `db4ebee591fdda700f05bc2d0e3c837174def90fdc1d69ca9d42ee3dc3c7c853`.
