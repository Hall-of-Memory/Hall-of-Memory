---
id: T016
status: done
priority: P0
dependencies: [T014, T015]
---
# Classy-Premium-Frame-Redesign der Sales-Demo

## Ziel

Die isolierte Route `/demo/` erhält eine ruhigere, klassisch-luxuriöse Rahmengestaltung:
Onyx-/Lackschwarz, warmes Elfenbein, sparsame Champagnerakzente, präzise Abstände und
bewusster Negativraum. Produktionsroute, Produktionsinhalte sowie Anfrage- und
Buchungslogik bleiben fachlich unverändert.

## Startbefund und Headline-Defekt

- Verifizierter Start: `main`, HEAD `8709680c7ea18682d72a451e84a3f076d3e0c770`,
  sauberer kanonischer Checkout ohne konkurrierenden Hall-of-Memory-Writer.
- Der T015-Stand verwendete Champagner zu häufig als große Metallfläche, besonders für den
  Primär-CTA und die volle Editorial-Sektion. Das wirkte schwerer und plakativ goldener als
  die gewünschte klassische Luxuskommunikation.
- Kritischer sichtbarer Defekt: `Bühne.` nutzte Verlaufstext mit transparentem Text-Fill.
  Auf dem iPad wirkte das Schlüsselwort dadurch nahezu schwarz beziehungsweise unsichtbar;
  die Headline „Erinnerungen bekommen eine Bühne.“ erschien semantisch unvollständig.

## Designentscheidung

**Goldrahmen statt Goldflächen.** Champagner erscheint überwiegend als 1-px-Haarlinie,
gelegentlicher Doppelrahmen/Inset, kleiner Eck- oder Kantenakzent und kontrollierter
Textakzent. Große Goldfüllungen, starke Glows, Casino-/Party-Anmutung, SaaS-Panels und
übermäßiges Glassmorphism entfallen. Typografie, Kontrast, Raum und Materialkanten tragen
die Wertigkeit.

## Umgesetzter Scope

- Änderung der Präsentationsgestaltung ausschließlich in `src/styles/demo.css`.
- `src/pages/demo.astro`, `src/content/*`, Produktionsroute, Inquiry-Worker/D1, T013,
  Produktions-Anfragelogik und Demo-JavaScript blieben unangetastet.
- `Bühne.` ist nun ein fester, kontrastreicher Champagnerton ohne transparentes Text-Fill
  oder Background-Clip.
- Primär-CTA, Navigations-CTA und Submit sind dunkle Lackflächen mit feinem
  Champagnerrahmen und Ivory-Text statt großer Goldfüllung.
- Die Hero-Bühne verwendet klare Hairlines, Doppelrahmen und Insets statt diffuser
  Goldglows; „Der Moment bleibt.“ bleibt klar lesbar.
- Angebotskarten sind tief dunkel, fein gerahmt und visuell näher an Gravur/Editorial als an
  Dashboard-Karten.
- Die seitenbreite goldene Editorial-Platte wurde durch eine überwiegend dunkle Sektion mit
  begrenztem warmem Ivory-Panel ersetzt.
- Anfrage, Future-Sektion und Footer folgen demselben zurückhaltenden Rahmen-/Linien-System.
- Ein bei 390 px entdecktes horizontales Overflow wurde ursächlich behoben: die lange
  Future-Überschrift erhält mobil eine kontrolliert kleinere, balancierte Typografie; kein
  pauschales `overflow:hidden` kaschiert den Fehler.

## Validierung

- [x] `npm run test:demo` — RC 0;
  `sales-demo-isolation-ok route=/demo/ noindex=true launchStatus=draft apiCalls=0`
- [x] `npm run test:form` — RC 0
- [x] `npm run test:quality` — RC 0;
  `quality-baseline-ok html=9283 css=9683 js=6779 gzip=8400`
- [x] `npm run check` — RC 0; 28 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise
- [x] `npm run build` — RC 0; 2 Seiten gebaut
- [x] `npm run verify` — RC 0; einschließlich Worker- und Site-Wrangler-Dry-Run
- [x] `git diff --check` — RC 0
- [x] Isolation explizit geprüft: `src/content/site.json` bleibt `launchStatus: draft`,
  `src/pages/demo.astro` bleibt `noIndex={true}`, `public/demo-inquiry.js` verhindert den
  Submit mit `event.preventDefault()`; keine Produktions-/Content-/Worker-Datei im Diff.

Die bestehenden Build-Hinweise auf leere Collections `packages`, `faqs` und `gallery`
bleiben Warnungen ohne Fehler und wurden durch T016 nicht eingeführt.

## Browser-Evidenz

Realer isolierter Chrome-Stable-/CDP-Proof mit Chrome Stable `151.0.7922.108` und
task-eigenem temporärem Browserprofil. Für jede Zielbreite wurden Hero, Angebotskarten,
Editorial/Markenidee und Anfrageformular als Screenshot geprüft (insgesamt 12 Aufnahmen):

- [x] `1440×1000`: `scrollWidth=1425 <= innerWidth=1440`
- [x] `834×1112`: `scrollWidth=819 <= innerWidth=834`
- [x] `390×844`: `scrollWidth=375 <= innerWidth=390`

DOM-/Computed-Style-Beleg auf allen drei Breiten:

- Headline vollständig: `Erinnerungen bekommen eine Bühne.`
- `Bühne.`: `rgb(226, 211, 178)`, `-webkit-text-fill-color` ebenfalls deckend,
  `background-image: none`.
- Primär-CTA: dunkler Lackverlauf, Ivory-Text, dünner Champagnerrahmen; keine Goldplatte.
- Editorial: dunkler Grund `rgb(8, 7, 6)`; keine seitenbreite Goldfüllung.

## Unabhängiger visueller Review

- Revisionsbasis: `8709680c7ea18682d72a451e84a3f076d3e0c770`
- Revisionspaket SHA-256:
  `95a730a07d319f6a5aebe13ca2ee3c7239bdfb7bad333e6d0281e13aa5d09403`
- Read-only-Reviewer-Task: `ac8b675af383411bade151f2`
- Ergebnis: **PASS**.
- Bestätigt wurden insbesondere sofort lesbares `Bühne.` auf allen drei Viewports,
  reduzierte Goldflächen, kohärente Hairline-/Inset-Sprache, kein Casino-/Party-/SaaS-
  Eindruck, keine sichtbaren Kollisionen/Clippings und kundenvorzeigbare Gesamtwirkung.

## Self-Review

- Vollständiger Diff auf Demo-Isolation und verbotene Scope-Änderungen geprüft: PASS.
- Große Goldflächen sind auf CTA und Editorial entfernt; Hero/Karten setzen Gold überwiegend
  als Linie, Rahmen, kleine Materialkante oder Typoakzent ein.
- Mobile Überladung gezielt geprüft; der 390-px-Overflow wurde nicht verdeckt, sondern an der
  verursachenden Future-Typografie behoben.
- Kein zusätzliches JavaScript, keine Fremdfonts, Third-Party-Skripte, Fake-Fotografie oder
  erfundenen Kundendaten eingeführt.

## Verbleibende visuelle Unsicherheit

Der Chrome-Stable/CDP-Proof bildet die drei verlangten Viewports reproduzierbar ab, ersetzt
aber keinen zusätzlichen Test auf einem physischen iPad-Display. Der unabhängige Review
nennt das warme Ivory-Editorial-Panel auf Mobile als bewusst gewichtigen visuellen Akzent;
es bleibt innerhalb der gewünschten Fashion-Editorial-Sprache und ist kein Goldflächen-
Rückfall. Keine offene visuelle Abweichung blockiert die Kundenpreview.
