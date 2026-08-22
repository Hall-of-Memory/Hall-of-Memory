---
id: T029
status: done
priority: P0
dependencies: [T020, T023, T028]
---
# Masterpiece Gold Frame Architecture

## Ziel

Die isolierte Sales-Demo wird in Rahmenarchitektur, Goldmaterialität, Lichtführung, Tiefenstaffelung, Eckornamentik und grafischer Führung sichtbar auf eine höhere Premium-Stufe gehoben, ohne Produktionspfade, Anfrage-API, Worker, D1, Preise, Kundendaten oder T018-Sicherheitsgrenzen zu verändern.

## Umgesetzt

- Goldsystem von einfacher Kontur auf mehrstufige Metallfassung mit hellen Lichtkanten, warmem Mittelgold und dunkleren Messing-/Braungoldstufen umgestellt.
- Hero als stärkstes Signature Piece mit kräftigerer Außenfassung, zusätzlicher Binnenkante, tieferer Innenmatte und stärker gefasstem HM-Eckelement ausgebaut.
- Angebots-, Anfrage-, Future-, Kapitel-, Header- und Footer-Tafeln in dieselbe Fassungslogik überführt; keine neue JavaScript-Logik eingeführt.
- Divider, Marker, Medaillons, Zierlinien und Line-Art sichtbar kräftiger und gravurartiger abgestimmt.
- Zwei im unabhängigen Bildreview gefundene echte Layoutblocker behoben: Future-Line-Art kollidiert am 620er Breakpoint nicht mehr mit Text, und die Magazinbox-Grafik schneidet die Ziffer `03` nicht mehr.
- T020-Tablet-Geometrie blieb stabil: Offer-Motif-Ratio 834/768/621 = `0.764 / 0.764 / 0.763`.
- Fremder Listener auf Host-Port `8443` live als Docker/UniFi belegt und bewusst nicht verändert. Der T018-Previewpfad wurde deshalb konfliktfrei auf den freien, von Tailscale unterstützten HTTPS-Funnel-Port `10000` verlegt.

## Abnahmebelege

- Browser-PASS bei 1440×1000, 1366×1024, 834×1112, 768×1024, 621×900, 620×900, 390×844 und 340×844.
- `document.documentElement.scrollWidth - window.innerWidth = 0` in allen acht Viewports; keine Frames oder relevanten Karten außerhalb des Viewports.
- Unabhängiger visueller Review nach korrigierten, style-assertierten Screenshots: `URTEIL: PASS`, `BLOCKER: keine`.
- `npm run test:demo`, `npm run test:form`, `npm run test:quality`, `npm run check`, `npm run build`, `npm run verify` und `git diff --check`: PASS.
- Demo-Isolation: `launchStatus=draft`, `noindex,nofollow`, `apiCalls=0`.
- Gebautes Demo-CSS: `25547 / 26624` Byte innerhalb des 26-KiB-Gates; initialer Demo-Gzip-Transfer `13250` Byte.
- Öffentlicher T018-Readback auf `https://heim-pc.tail6dbb90.ts.net:10000/demo/`: HTTP/2 200; HTML und beide CSS-Bundles bytegenau identisch zum lokal validierten `dist`.
- Produktionsroute, Worker, D1, Anfrage-API, Preise und Kundendaten unverändert.

## Ergebnis

Visueller und technischer PASS erreicht. Die Seite besitzt nun eine deutlich stärkere, materiellere Goldfassung und bessere Tiefenstaffelung, ohne in Neon-, Casino-, Glassmorphism-, Hochzeitskarten- oder pseudo-3D-Ästhetik zu kippen. T029 ist abgeschlossen; der laufende Kundenpreview-Lifecycle bleibt ausschließlich T018.
