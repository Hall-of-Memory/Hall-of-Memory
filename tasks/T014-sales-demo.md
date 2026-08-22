---
id: T014
status: done
priority: P0
dependencies: [T002, T003, T004]
---
# Isolierte, kundenvorzeigbare Sales-Demo

## Entscheidung

Die Sales-Demo wird als eigene statische Route `/demo/` mit einem explizit separaten Demo-Datenmodul umgesetzt. Sie darf gemeinsame Präsentations- und Formularbausteine verwenden, liest ihre Verkaufsinszenierung aber nicht aus den Produktions-Contentdateien. Die Produktionsroute, ihr Draft-Status und der fail-closed Inquiry-Pfad bleiben fachlich unverändert.

## Grenzen

- Demo-Inhalte sind sichtbar als beispielhafte Darstellung gekennzeichnet und werden nicht als freigegebene Kundendaten ausgegeben.
- Es werden keine unbekannten Leistungen, Referenzen, Bewertungen, Kennzahlen, Kontaktdaten, Preise, Rechts- oder Datenschutztexte erfunden.
- Die Demo enthält keine fremden Bilder; die Hero- und Produktvisuals sind typografisch/grafisch in CSS inszeniert.
- `/demo/` ist immer `noindex,nofollow`, erhält weder Canonical noch strukturierte Unternehmensdaten und erscheint nicht in der Sitemap.
- Der Demo-Anfragepfad übermittelt keine Formulardaten an API oder Produktion, legt sie in keinem Anwendungsspeicher ab und zeigt ausschließlich eine klar hypothetische lokale Rückmeldung.
- Eine Anfrage ist weder Buchung noch Verfügbarkeitsbestätigung. T013 bleibt unverändert `blocked_external` und wird weder implementiert noch semantisch umgangen.
- `launchStatus` bleibt `draft`; es werden keine Remotes, Deployments, Cloud-Ressourcen, Kosten oder Secrets angelegt.

## Akzeptanz

- starker, responsive gestalteter Hero und eigenständiger Premium-Event-Markenauftritt in Schwarz/Gold
- Fotobox, Fotospiegel und Magazinbox emotional, aber ohne unbelegte Leistungsbehauptungen präsentiert
- Editorial-/Markensektion sowie klar abgegrenzte Zukunftsperspektive vorhanden
- nachvollziehbarer Flow: Angebot wählen → Eventdetails → Anfrage beispielhaft senden → eindeutige Rückmeldung
- gute Tastaturbedienung, sichtbare Fokuszustände, Labels, Status/ARIA, Reduced Motion und kleine Mobile-Viewports berücksichtigt
- Demo- und Produktionsdaten technisch sowie in gebautem HTML getrennt
- Regressionstest prüft Route, Kernsektionen, Kennzeichnung, SEO-Isolation, lokalen Formularpfad und unveränderten Draft-Status; Gate ist in `npm run verify` eingebunden

## Evidenz

### Implementierung

- `src/pages/demo.astro` bildet die statische Route mit Hero, drei Angeboten, Editorial-Sektion, Inquiry-Flow und Zukunftsperspektive.
- `src/data/demo.ts` hält alle Demo-Verkaufstexte getrennt von `src/content/*`; die Produktionsseite importiert das Modul nicht.
- `src/components/InquiryEventFields.astro` teilt ausschließlich fachlich identische Angebots- und Eventfelder mit der Produktionsroute.
- `public/demo-inquiry.js` erzeugt ohne `fetch`, API-Konfiguration oder Produktionscontroller eine lokale, ausdrücklich beispielhafte Rückmeldung. Die Demo-CSP setzt zusätzlich `form-action 'none'`; Privacy-Hinweise grenzen die Aussage präzise auf Backend und Anwendungsspeicher ein.
- `src/styles/demo.css` enthält die eigenständige Schwarz/Gold-Inszenierung sowie Breakpoints bei 1080, 860, 620 und 380 Pixeln, Focus-within, Forced Colors und Reduced Motion.
- `scripts/test-sales-demo.mjs` prüft gebautes DOM, Daten-/SEO-/Inquiry-Isolation, Kernsektionen, Kennzeichnung, tote Links, A11y-Basics, responsive Regeln und Budgets. `npm run verify` führt das Gate als `test:demo` aus.

### Vor-Commit-Validierung — 2026-08-11

- `npm run test:domain` → `availability-domain-ok`
- `npm run test:form` → `inquiry-form-ui-ok`
- `npm run test:quality` → `quality-baseline-ok html=9283 css=9683 js=6779 gzip=8400`
- `npm run test:demo` → `sales-demo-isolation-ok route=/demo/ noindex=true launchStatus=draft apiCalls=0 html=11700 css=24235 js=1017 gzip=10912`
- `npm run check` → 0 Fehler, 0 Warnungen, 0 Hinweise
- `npm run build` → `/demo/index.html` und Produktionsroute erfolgreich statisch gebaut
- `npm run spike:inquiry` → `inquiry-admin-frontend-smoke-ok`
- vollständiges `npm run verify` → alle enthaltenen Gates grün; Worker- und Site-Build endeten jeweils mit `--dry-run: exiting now.`

Chrome wurde lokal unter `/opt/google/chrome/google-chrome` verwendet. Nach dem kundenseitigen Copy-Fix auf `fee42840c2d0de81a1e0b8600af905f5279b97aa` wurde die gebaute `/demo/`-Route über einen isolierten, loopback-only Chrome-CDP-Worker real geprüft. Ein erster Fragment-Screenshotlauf scrollte die Zielsektionen nicht zuverlässig und wurde deshalb nicht als visuelle Evidenz akzeptiert. Der Wiederholungslauf positionierte Hero, Produktsektion und Anfrage explizit per DOM/CDP und erzeugte neun Screenshots: Desktop 1440×1000, iPad 834×1112 und iPhone 390×844. Die DOM-Messung bestätigte dabei kein horizontales Overflow (`scrollWidth <= innerWidth`). Der revisionsgebundene Bildreview bewertete alle drei Breiten mit `PASS`: keine sichtbaren Clipping-, Kollisions-, Karten-, Formular- oder Responsive-Blocker; Schwarz/Gold-Inszenierung und Demo-Kennzeichnung wurden als kundenvorzeigbar bewertet. Die Screenshots lagen ausschließlich temporär unter `/tmp/hom-sales-demo-cdp-fee42840/` und wurden nicht ins Repository übernommen.

### Revisionsgebundener Abschluss

- Implementierungs-HEAD `2b21642f3bce409cf549da9b7611718484ffc118` → vollständiges `npm run verify` und `git show --check HEAD` grün.
- Self-Review fand einen mit 4,49:1 knapp unzureichenden Kontrast des kleinsten Demo-Labels und eine zu pauschale Privacy-Formulierung. Beides wurde in `e5858a6634d21024469a3a621d5c4df46496639c` behoben; der Regressionstest berechnet nun mindestens 4,5:1 und prüft die Backend-/Anwendungsspeicher-Grenze.
- Fix-HEAD `e5858a6634d21024469a3a621d5c4df46496639c` → vollständiges `npm run verify` und `git show --check HEAD` erneut grün.
- Abschließendes Self-Review des Fix-HEAD fand nach unabhängiger Nachprüfung noch einen kundenseitigen Qualitätsmangel: sichtbare interne Begriffe wie `Inquiry-Pfad`, `fail-closed`, `Backend` und `Anwendungsspeicher`. Dieser Fund wurde in `fee42840c2d0de81a1e0b8600af905f5279b97aa` durch verständliche Sprache zum echten Anfrage-Service behoben; der Demo-Regressionstest verbietet die internen Begriffe seitdem in den kundensichtbaren Demo-Pfaden.
- Browserreview des visuellen UI-HEAD `fee42840c2d0de81a1e0b8600af905f5279b97aa`: Desktop `PASS`, iPad `PASS`, iPhone `PASS`.
- Produktionscontent, Inquiry-Backend und T013 bleiben gegenüber dem Ausgangs-HEAD unverändert.

### Sicherheits-Nachtrag für die öffentliche Arbeitsdomain — 2026-08-22

Mit T045 wird `/demo/` vorübergehend zum sichtbaren Arbeitsstand hinter `hallofmemory.de`. Damit ist der frühere lokale Mock-Submit nicht mehr geeignet: Ein echter Interessent könnte ihn mit einer funktionierenden Anfrage verwechseln, obwohl keine Daten an den Betreiber gehen. Der Anfragebereich bleibt deshalb als Design-/Ablaufvorschau sichtbar, aber alle drei Feldgruppen und der Submit sind technisch deaktiviert, die Seite weist ausdrücklich darauf hin, dass derzeit keine Anfragen übermittelt werden, Produkt-Preselection und `demo-inquiry.js` werden nicht mehr ausgeliefert. Die echte Anfragefunktion wird erst in Stage 2 nach T008/T010/T011 aktiviert. Dieser Nachtrag supersediert für die öffentliche Arbeitsdomain ausschließlich die frühere Akzeptanz „Anfrage beispielhaft senden“; die übrige T014-Demo-/SEO-Isolation bleibt erhalten.

Damit ist T014 `done`. Die Produktionswebsite bleibt getrennt davon weiterhin durch T007 bis T011 auf echte Kundenzulieferungen, Geschäftsregeln beziehungsweise autorisierte Infrastruktur angewiesen; T013 bleibt unverändert `blocked_external`.
