---
id: T027
status: done
priority: P0
dependencies: [T002]
---
# Legal-/Privacy-Struktur ohne erfundene Rechtstexte

## Ziel

Die bestätigten Wünsche zu Impressum, Datenschutz und Cookie-/Consent-Thema technisch so weit vorbereiten, wie es ohne finale Kunden-/Rechtsdaten möglich ist.

## Umgesetzt

- echte statische Routen `/impressum/` und `/datenschutz/`
- beide Seiten zeigen klar sichtbar `Entwurfsstand` und behaupten ausdrücklich nicht, finale Rechtstexte zu sein
- keine erfundenen Firmen-, Anschrift-, Register-, Vertretungs- oder sonstigen Pflichtangaben
- beide Routen bleiben im aktuellen Draft `noindex,nofollow`
- Startseiten-Footer verlinkt Impressum und Datenschutz
- eigenes `src/styles/legal.css`; die Legal-Gestaltung belastet das extrem knappe Demo-CSS-Budget nicht
- `docs/legal-privacy-baseline.md` trennt belegbaren technischen Stand von noch erforderlicher fachlich/rechtlicher Freigabe
- Quality-Regression prüft Legal-Routen, Draft-Kennzeichnung, Robots-Meta und Footerlinks
- Quality-Regression verbietet im aktuellen Build bekannte Analyse-/Marketing-/Social-Embed-Marker; es wurde keine prophylaktische Tracking- oder Consent-Schicht eingeführt
- Turnstile bleibt ausschließlich am Anfragepfad und wird dort weiterhin nur bedarfsnah geladen
- eine neutrale leere Favicon-Deklaration verhindert den impliziten Browser-404, ohne ein nicht geliefertes Kundenlogo zu erfinden

## Bewusste Grenze

Es wird weder behauptet, dass ein Cookie-Banner erforderlich ist, noch dass keines erforderlich ist. Die endgültige Consent-Entscheidung folgt erst aus den tatsächlich eingesetzten Diensten und der fachlich/rechtlichen Freigabe in T008.

## Evidenz

Implementierung:
- `ace206f933e787c39795a4f58490f8960a9a75e8` — `feat: add gallery security and legal foundations`

Validierung:
- finaler kompletter Regressionslauf Grabowski-Task `f06334ec0f6443feaa6204fa` → PASS für `test:gallery-access`, `test:domain`, `test:form`, `test:quality`, `test:demo`, `check`, `build`, `verify` und `git diff --check`.
- `test:quality` → `quality-baseline-ok html=9388 css=9683 js=6779 gzip=8437`; Tracker-/Marketing-/Embed-Marker bleiben abwesend.
- finaler Browser-Readback Grabowski-Task `87c81100db34493eb38df7d1` über `/impressum/` und `/datenschutz/` bei `1440×1000`, `834×1112`, `390×844`, `340×844`: 8/8 HTTP 200, korrekte H1, `noindex,nofollow`, beide Footerlinks, `horizontalOverflow=0` und keine Console-/Page-Errors.
- der zuvor reproduzierbare implizite Browser-404 wurde durch die neutrale Favicon-Deklaration beseitigt; erst der anschließende 8/8-Lauf gilt als Closeout-Evidenz.
- externer Readback vom unabhängigen Host `wg-prod-1`, Grabowski-Task `3775d9f685a34a7680ef253d`: `/demo/`, `/impressum/`, `/datenschutz/` jeweils HTTP 200; Legal-Seiten mit Entwurfsmarker und `noindex,nofollow`.
- Demo-Isolation unverändert: `launchStatus=draft`, `noindex`, `apiCalls=0`, Demo-CSS `28659` Byte bei Limit `28672`.

## Abschluss

T027 ist `done`. Finale Inhalte und die tatsächliche Cookie-/Consent-Entscheidung bleiben korrekt als externe Inputs in T008 offen.
