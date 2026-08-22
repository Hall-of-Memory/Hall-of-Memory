---
id: T021
status: done
priority: P0
dependencies: [T019]
---
# Luxury Engraving Detail Polish

## Ziel

Die bereits kundenpräsentable `/demo/` wird in einer weiteren, ausdrücklich handwerklichen Veredelungsrunde näher an die gelieferte Luxus-/Editorial-Art-Direction geführt. Nicht mehr Effekt, sondern präzisere Gravurdetails, ruhigere Komposition und glaubwürdigere Papeterie-/Tafel-Anmutung.

## Scope

Bevorzugt nur:

- `src/pages/demo.astro`
- `src/styles/demo.css`
- `tasks/INDEX.md`
- diese Taskdatei

Keine Änderung an Worker, D1, echter Anfrage-API, Buchungsengine, Produktionsroute, Preisen, Kundendaten, Testimonials, Verfügbarkeiten oder `launchStatus`. Kein neues JavaScript und keine Drittanbieterassets.

## Umsetzung

- Das gemeinsame `demo-ornate-frame`-System wurde von der rundungsartigen Inset-Anmutung auf einen schärferen äußeren Hairline-Rahmen, eine zweite präzise Inset-Linie und vergrößerte feine Eckgravuren umgestellt. Hero, Angebotskarten, Anfrage, Future-Tafeln, Kapitel und Footer erhalten dadurch dasselbe zurückhaltende Handwerksvokabular ohne zusätzliche Goldflächen oder Glow.
- Der Future-Header ist ruhiger komponiert: größerer vertikaler Atemraum, strengere Spaltenbalance, feinere rechte Hairline und ein eigener langer horizontaler SVG-Hairline-Steg mit zentriertem Diamantmarker unter der Headline.
- Die vier Future-Karten sind stärker als Tafeln organisiert: etwas großzügigere Innenabstände, doppelt gefasste 01–04-Medaillons, fein auslaufende Zierlinien, schwächer eingeprägte Line-Art, größere Distanz zwischen Zeichnung und Titel sowie zurückhaltenderer Fußmarker.
- Alle vier eigenen Inline-SVG-Motive wurden mit `stroke-width=.82` und differenzierten Sekundärlinien neu gezeichnet: perspektivischer Galeriekorridor mit Architektur- und Wanddetails, geometrisch klareres Geschenkpaket mit Bandführung, symmetrischere Serviceglocke mit Sockeldetails und schlankerer klassischer Schlüssel mit feinen Zähnen/Ornamenten.
- Die architektonisch-botanische Hintergrundgravur besitzt zusätzliche Bogenstufen und feinere botanische Nebenlinien bei dünnerer Kontur. Auf 390/340 bleibt sie bewusst ausgeblendet, damit Mobile nicht überdekoriert wird.
- Der einfache Diamant-Divider wurde durch ein eigenes feines SVG-Signet mit seitlichen Hairlines ersetzt. Das Folgekapitel nutzt den geschärften Rahmen und einen noch dunkleren, ruhigeren Tafelhintergrund.
- Die visuelle Veredelung wurde innerhalb des bestehenden Budgets umgesetzt: Demo-CSS nach Build `28.510` Byte gegenüber `28.654` Byte vor T021.

## Validierung

Technische Gates am 2026-08-12:

- `npm run test:demo`: PASS — `noindex=true`, `launchStatus=draft`, `apiCalls=0`, HTML `17.827` Byte, CSS `28.510` Byte, JS `1.057` Byte, gzip initial `13.756` Byte.
- `npm run test:form`: PASS (`inquiry-form-ui-ok`).
- `npm run test:quality`: PASS (`quality-baseline-ok`).
- `npm run check`: PASS — 0 errors, 0 warnings, 0 hints.
- `npm run build`: PASS.
- `npm run verify`: PASS einschließlich lokaler Inquiry-Spike-/D1-Migrationen, Domain-/Form-/Quality-/Demo-Tests, Check, Build sowie Worker-/Site-Dry-Runs.
- `git diff --check`: PASS.

Die wiederkehrenden Hinweise auf leere Content-Collections (`packages`, `faqs`, `gallery`) entsprechen der bestehenden Baseline und wurden durch T021 nicht verschlechtert.

## Browser- und Visual-Evidenz

Frische Chrome-CDP-Evidenz wurde aus dem finalen Build über die bestehende T018-Loopback-Preview `127.0.0.1:4334` erzeugt. Evidenzroot: `/tmp/hom-t021-review`; SHA-gebunden über `manifest.sha256`.

| Viewport | `scrollWidth` | `innerWidth` | Dokument passt | Kartenoverflow | Hintergrundgravur |
|---|---:|---:|---|---|---|
| 1440×1000 | 1425 | 1440 | ja | 4/4 nein | sichtbar |
| 834×1112 | 819 | 834 | ja | 4/4 nein | sichtbar |
| 390×844 | 375 | 390 | ja | 4/4 nein | bewusst aus |
| 1366×1024 | 1351 | 1366 | ja | 4/4 nein | sichtbar |
| 340×844 | 325 | 340 | ja | 4/4 nein | bewusst aus |

Zusätzlich in allen fünf Viewports: `ornamentPageOverflow=false`, `artCount=4`, ein Future-Headline-Signet, ein Divider-Signet und positive Abstände Future→Divider→Kapitel. Keine abgeschnittenen Ornamente oder Kartenrahmen wurden gemessen.

Unabhängiger READ-ONLY Visual-Review: Grabowski-Task `ef2c831d8d3a480ea70e8002`, Grok 4.5 high. Der Reviewer las `metrics.json`, `manifest.sha256` und alle 15 frischen PNGs direkt. Ergebnis: **PASS**, keine P0/P1/P2-Befunde, ausdrücklich für die Kundenvorlage freigegeben.

## Preview / Autoritätsgrenzen

T018 bleibt eigenständig `active`; dessen laufende Server-/Funnel-Prozesse wurden nicht übernommen, gestoppt oder verändert. Funnel 8443 wurde nur rückgelesen.

Öffentlicher Readback am 2026-08-12 über frisch per öffentlichem DNS verifizierte Funnel-Edges (`185.40.234.37`, `.172`, `.210`):

- `https://heim-pc.tail6dbb90.ts.net:8443/demo/` → HTTP 200, `17.827` Byte.
- öffentliches HTML = lokales `dist/demo/index.html`: SHA-256 `aedb32795209b4e5178dd3e900af368623a5a26acca3a88f1301f1fd231f7469`.
- öffentliches `InquiryEventFields.CqO4gryu.css` = lokaler Build: SHA-256 `9a98496830bfed27072d900d94c1d8ef98cf55eb123af7e2057f8057137c10c2`.
- öffentliches `demo._KtwpMuA.css` = lokaler Build: SHA-256 `00d78ce0d181cf84417288eaa63a60d99092491ec1a89f26979442eef9a37f93`.

Die Referenzdatei in iCloud war während dieses Laufs wegen fehlender aktueller iCloud-PCS-Webauthentisierung nicht direkt lesbar. Sie wurde nicht als Webseiten-Asset benötigt: umgesetzt wurde die vom Nutzer konkretisierte Art Direction plus die bereits in T019 belegte Referenzübersetzung. Es entstand keine Fremdasset-Kopplung.

## Restbefunde

Keine neuen T021-Restbefunde. T020 bleibt als eigenständiger bereits vorhandener Responsive-Offer-Motif-Task unverändert `planned`; T018 bleibt für den Preview-Lifecycle `active`.

## Abschluss

Visual PASS, technische Gates, öffentlicher Readback und Self-Review sind erfüllt. T021 ist abgeschlossen.
