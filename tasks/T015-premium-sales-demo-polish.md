---
id: T015
status: done
priority: P0
dependencies: [T014]
---
# Premium-Polish für die Sales-Demo

## Ziel

Die isolierte Route `/demo/` erhält einen deutlich hochwertigeren, kundenvorzeigbaren
Dark-Luxury-Auftritt mit schwarzem Lack-/Obsidian-Material, Champagner-Metall,
kontrollierten Lichtkanten und einem ruhigen Editorial-Rhythmus. Die Produktionsroute,
Produktionsinhalte und Buchungslogik bleiben fachlich unverändert.

## Designentscheidung

- Glanz entsteht durch wenige, kontrollierte CSS-Materialschichten: dunkle Lackverläufe,
  feine metallische Kanten, statische Specular Highlights und zurückhaltende Schatten.
- Champagner ersetzt plakatives Gelbgold; große Flächen wirken eher wie gebürstetes Metall
  beziehungsweise hochwertiges Papier als wie eine Vollton-Warnfläche.
- Bewegung bleibt dekorativ, klein und CSS-basiert. Bei `prefers-reduced-motion` ist sie
  vollständig ruhig; Forced Colors behält klare Grenzen, Text und Fokuszustände.
- Keine Fotografie, Bildassets, Fremdfonts, externen Skripte oder neuen Geschäftsaussagen.

## Scope und Grenzen

- Umsetzung ausschließlich in `src/styles/demo.css`; das bestehende Demo-Markup blieb
  unverändert.
- `src/content/*`, Produktionsroute, Inquiry-Worker/D1, T013, `BaseLayout.astro`,
  `launchStatus`, Sitemap und echte Anfragekonfiguration blieben unangetastet.
- `/demo/` bleibt `noindex,nofollow`, ohne echte Anfrage/API, externe Links oder erfundene
  Fakten, Preise, Testimonials und Kontaktdaten.
- Es wurden keine neuen Bildassets, Fremdfonts, Third-Party-Skripte oder JavaScript-Effekte
  ergänzt.

## Akzeptanzkriterien

- Notice, Header, Hero/Stage, Buttons, Offer Cards, Editorial, Inquiry, Future und Footer
  bilden ein konsistentes ruhiges Premium-Materialsystem.
- CTA-Hierarchie, Typografie, Fokuszustände und Form-Control-Tiefe sind klar; normale
  Schrift hält mindestens WCAG AA.
- 1440, 834 und 390 Pixel Breite zeigen kein horizontales Overflow oder störende
  Überlagerungen.
- Animationen verursachen keinen dauerhaften großen Effekt und werden bei Reduced Motion
  vollständig deaktiviert; Forced Colors bleibt sinnvoll bedienbar.
- Demo-/Produktionsisolation und alle bestehenden Sicherheitsgrenzen bleiben testbar.

## Arbeitsjournal / Evidenz

- 2026-08-11: Startzustand fail-closed bestätigt: `main`, HEAD
  `6aa45e6abb27d6f12ecf4176b4d9374d0e2e9e3c`, sauber; keine konkurrierenden
  Hall-of-Memory-Writer.
- Premium-Polish in `src/styles/demo.css`: ruhige dunkle Demo-Notice, satinierter Header,
  Champagner-Metall für CTAs und Akzente, Black-Lacquer-Hero/Stage, räumlichere Offer Cards,
  champagnerfarbene Editorialfläche sowie tiefere Inquiry-, Future- und Footer-Panels.
- Pre-Commit-Gates auf dem exakten Dirty-State vollständig grün: `npm run test:demo`,
  `npm run test:form`, `npm run test:quality`, `npm run check`, `npm run build`,
  `git diff --check` und anschließend das vollständige `npm run verify` einschließlich
  Inquiry-Smoke sowie Worker-/Site-Dry-Runs.
- Demo-Regression: `sales-demo-isolation-ok route=/demo/ noindex=true launchStatus=draft
  apiCalls=0 html=11760 css=28629 js=1057 gzip=12137`; Astro-Check: 0 Fehler,
  0 Warnungen, 0 Hinweise.
- Reale Chrome-CDP-Abnahme mit `prefers-reduced-motion: reduce`: zwölf explizit positionierte
  Screenshots für Hero, Produkte, Editorial und Anfrage auf Desktop 1440×1000, iPad
  834×1112 und iPhone 390×844. Die DOM-Messung bestätigte auf allen drei Breiten
  `scrollWidth <= innerWidth`.
- Unabhängiger revisionsgebundener Bildreview: Desktop `PASS`, iPad `PASS`, iPhone `PASS`.
  Urteil: gewünschtes Premiumbild erreicht; Obsidian-Schwarz, zurückhaltendes
  Champagner-Metall und Editorial-Typografie wirken hochwertig und kundenvorzeigbar,
  ausdrücklich ohne Casino-, Billiggold-, Neon- oder Glassmorphism-Eindruck.
- Die Screenshots lagen nur temporär unter `/tmp/hom-premium-demo-precommit/` und wurden
  nicht ins Repository übernommen.

Damit ist T015 `done`. Die Produktionswebsite bleibt unabhängig davon `draft`; die
bestehenden extern blockierten Produktions- und Buchungsthemen bleiben unverändert.