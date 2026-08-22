---
id: T017
status: done
priority: P0
dependencies: [T016]
---
# Luxury-Editorial-Micro-Polish der Sales-Demo

## Ziel

Die isolierte Route `/demo/` erhält einen weiteren sehr kleinen, rein präsentationalen
Luxury-Editorial-Polish. Die bestehende Classy-Premium-Richtung bleibt erhalten; reduziert
werden ausschließlich verbliebene UI-Chrome-Schichten und zwei unruhige Textmaße.

## Ausgangsbefund und Review-Baseline

- Fail-closed verifizierter Start: `main`, HEAD
  `393b67ed27c54dc55226ff3b4bed64cf323a24a6`, sauber; kein passender oder
  deduplizierbarer T017 vorhanden.
- Unabhängiger, revisionsgebundener Art-Direction-Review:
  `/tmp/hom-t017-review/art-direction.txt`, Urteil **OPTIMIZE**.
- Screenshot-Baseline: zwölf Aufnahmen unter `/tmp/hom-t017-review/` für Hero,
  Angebotskarten, Editorial und Anfrage auf Desktop `1440×1000`, iPad `834×1112` und
  Mobile `390×844`.
- Eigene CSS-/Markup-Prüfung bestätigt die vier MUST-Punkte: zusätzlicher
  `.demo-offer-card`-Inset-Rahmen plus dreifaches Demo-Label, Inset- und Hinweisbox im
  Anfrageformular, zu dominante Desktop-Anfrageüberschrift plus zu lange Editorial-Zeilen
  sowie mobil gestapelte Hero-Fakten vor der Stage.

## Designentscheidung

**Weniger UI-Chrome, nicht mehr Gold.** Außenrahmen, individuelle Angebotsmotive,
Charakter-Kicker, Form-Feldrahmen und bestehende Kontraste bleiben erhalten. Es kommen
keine neuen Dekorationen, Goldflächen, Glows, Verläufe oder Schatten hinzu. Die
NICE-TO-HAVE-Punkte des Reviews bleiben bewusst unverändert, weil sie für diesen engen
Korrekturscope weder nötig noch risikofrei begründbar sind.

## Umgesetzter Scope

- Den Karten-Pseudoelement-Inset entfernen und `.demo-example-label` rein per CSS
  ausblenden.
- Beim Anfrageformular nur den äußeren Rahmen behalten; den Demo-Hinweis ohne eigene
  Box, mit reduziertem horizontalem Padding, aber weiterhin klar lesbar darstellen.
- Die Anfrageüberschrift auf Desktop auf etwa `58–62px`, `line-height: .98` und ungefähr
  `7.5em` Breite beruhigen; Editorial-Fließtext nach Browsermessung auf `64ch` begrenzen.
- Die Hero-Fakten bei Mobile kompakt dreispaltig mit `minmax(0, 1fr)`, kleinen Abständen,
  `min-width: 0` und kleinerer Typografie anordnen; unter `350px` wieder stapeln.

## Scope und Grenzen

- Implementierung ausschließlich in `src/styles/demo.css`; dazu diese Taskdatei und der
  konsistente Eintrag in `tasks/INDEX.md`.
- `src/pages/demo.astro`, `src/content/*`, T013, T015/T016, Worker, D1,
  Produktionsroute und Produktionslogik bleiben unangetastet.
- `launchStatus` bleibt `draft`; `/demo/` bleibt `noindex,nofollow` und führt weiterhin
  keine echte Anfrage oder API-Kommunikation aus.
- Kein JavaScript, keine Fremdfonts, Skripte, Fotografie, neue Assets oder
  Produktionsfreischaltung.

## Validierung und Abschluss

- Vollständige finale Dirty-State-Gates grün: `npm run test:demo`, `npm run test:form`,
  `npm run test:quality`, `npm run check`, `npm run build`, `npm run verify` und
  `git diff --check`. Demo-Isolation: `noindex=true`, `launchStatus=draft`, `apiCalls=0`;
  Astro-Check: 0 Fehler, 0 Warnungen, 0 Hinweise.
- Chrome-Stable/CDP auf dem finalen Build: `scrollWidth <= innerWidth` bei
  `1440×1000` (`1425 <= 1440`), `834×1112` (`819 <= 834`) und `390×844`
  (`375 <= 390`). Zusätzlicher 340-px-Stresstest: `325 <= 340`.
- Der 340-px-Stresstest deckte ein latentes Min-Content-Overflow der Future-Karten auf;
  ursächlich mit `min-width: 0` am Grid-Item behoben, nicht per Overflow-Clipping.
- Der erste unabhängige Endreview verwarf die zunächst geplanten `61ch`, weil auf
  Desktop und iPad die Einwort-Witwe „geschärft.“ entstand. CDP-Messung von `61ch` bis
  `68ch` zeigte `64ch` als kleinste saubere Breite; final exakt `64ch`, drei ausgewogene
  Zeilen auf Desktop und iPad.
- Zwölf finale Screenshots (Hero, Angebote, Editorial, Anfrage × Desktop/iPad/Mobile)
  sind an Manifest-SHA-256
  `7a48eb48863d78c8b1eab5eeb31a9664ab57c8d1de22fb43fe09fea3c79721bd` gebunden.
  Der zugehörige Dirty-State-Diff ist an
  `e25d5986277cb097eef774fc9664364ee1800391d072bc465e712f1154f907ec` gebunden.
- Zweiter unabhängiger, revisionsgebundener Art-Direction-Review: **PASS**. Keine
  visuellen Blocker, Kollisionen oder ungewollten Leerflächen; Karten und Formular
  ruhiger und hochwertiger, Mobile kontrolliert. Mehr Gold oder Glanz wurde ausdrücklich
  als kontraproduktiv bewertet.
- Verbleibende visuelle Unsicherheit: reale Geräte-/Subpixel-Abweichungen gegenüber dem
  emulierten Chrome-Viewport; keine aktuell sichtbare Abweichung blockiert die Demo.

Damit ist T017 `done`. Produktionsroute, T013 und alle Demo-Isolationsgrenzen bleiben
unverändert.
