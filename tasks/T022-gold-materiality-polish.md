---
id: T022
status: done
priority: P0
dependencies: [T021]
---
# Gold Materiality Polish

## Ziel

Die bereits kundenpräsentable `/demo/` wird in einer kontrollierten Veredelungsrunde eine Stufe präsenter, lesbarer, immersiver und materieller. Rahmen, Ornamentik, Divider, Marker und Line-Art sollen warmes graviertes Metall glaubwürdiger lesen, ohne Goldflächen, Glow, Neon, harte Spiegelreflexe oder dekorative Überladung.

## Art Direction

- Nicht grob dicker, sondern präsenter, weicher und materieller.
- Gold bleibt Champagner-/Messinggold auf tiefem Schwarz.
- Helligkeitswechsel innerhalb der Goldsprache sind klein und weich; sie sollen Material suggerieren, nicht als UI-Gradient auffallen.
- Karten sollen als gefasste Tafeln lesen, nicht als moderne Shadow-/Glass-Cards.
- Line-Art bleibt gravurartig und konkurriert nicht mit Text.

## Scope

Bevorzugt nur:

- `src/styles/demo.css`
- `src/pages/demo.astro`
- `tasks/INDEX.md`
- diese Taskdatei

Keine Änderung an Worker, D1, echter Anfrage-API, Buchungsengine, Produktionsroute, Preisen, Kundendaten, Testimonials, Verfügbarkeiten oder `launchStatus`. Kein neues JavaScript.

## Acceptance

- Außen-/Innenrahmen und Eckornamente sind sichtbar präsenter, aber nicht plakativ.
- Produkt- und Future-Karten lesen sich materieller und stärker als Tafeln.
- Offer- und Future-Line-Art ist besser lesbar; keine iconhafte oder glühende Wirkung.
- Divider, Marker und Signaturlinien führen klarer.
- Hero, Future und Kapitel gewinnen subtile Tiefenstaffelung ohne moderne Gradient-Fill-Anmutung.
- Viewports `1440×1000`, `834×1112`, `390×844`, `1366×1024`, `340×844`: `scrollWidth <= innerWidth`, keine abgeschnittenen Ornamente oder kollidierenden Rahmen.
- `npm run test:demo`, `npm run test:form`, `npm run test:quality`, `npm run check`, `npm run build`, `npm run verify`, `git diff --check` grün.
- Demo-Isolation bleibt `launchStatus=draft`, `noindex,nofollow`, `apiCalls=0`.
- T018 bleibt eigenständig aktiv; dessen Preview-Server, Cleanup-Task und fremde 443-/9443-Routen werden nicht übernommen oder gestoppt.
- Nach finalem PASS wird der laufende T018-Previewpfad mit dem verifizierten Build aktualisiert und öffentlich rückgelesen.

## Abschlussbeleg

- Visueller Review auf separatem Build und anschließend erneut auf dem finalen T018-`dist`: PASS.
- Viewports `1440×1000`, `834×1112`, `390×844`, `1366×1024`, `340×844`: jeweils `scrollWidth == innerWidth`; keine Ornament-, Offer-Card- oder Future-Card-Überläufe.
- Demo-Budget: `html=17828`, `css=28645`, `js=1057`, `gzip=13832`; CSS bleibt unter dem 28-KiB-Gate.
- Isolation: `noindex=true`, `launchStatus=draft`, `apiCalls=0`.
- `npm run verify`: PASS; darin Inquiry-Spike, Domain-, Form-, Quality- und Demo-Tests, Astro-Check, Build sowie Worker-/Site-Dry-Run grün.
- Öffentlicher Preview-Readback: HTTP 200 auf `https://heim-pc.tail6dbb90.ts.net:8443/demo/`.
- HTML-SHA-256 lokal/öffentlich/`dist`: `37dcf07ddaf211251679fe332b35f468b4138e21a22f89ee5b89945815d1e419`.
- Demo-CSS-SHA-256 lokal/öffentlich/`dist`: `1ad6933f18aecf1c9d8171b00c2680b301a1fd972818a387d2613d9f6a228bd7`.
- T018 bleibt `active`; sein Server, Cleanup-Task sowie 443-/9443-Routen wurden nicht verändert.
