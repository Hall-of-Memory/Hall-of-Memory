# T051 – Startseite Redesign V1

Status: merge-ready — sauberer Successor von PR #37 technisch verifiziert; menschliche visuelle Preview-Abnahme am 11.09.2026 erteilt

## Ziel

Die bestehende Hall-of-Memory-Landingpage auf der vorhandenen Astro-/Content-Architektur weiterentwickeln, ohne funktionierende Grundlagen neu zu bauen.

PR #37 dient als Kunden- und Erkenntnisquelle, nicht als Implementierungsbasis. Der Successor startet auf aktuellem `main` und übernimmt nur die beabsichtigten Produktentscheidungen sowie belastbare Regressionstests.

## Kundenrichtung

- Marke: Hall of Memory, Claim „Every Star Has a Memory“.
- Hero kurz und direkt; primärer CTA zum Anfragebereich, sekundärer CTA zu den Angeboten.
- Fotobox, Fotospiegel und Magazinbox direkt nach dem Hero sichtbar.
- Weniger Schwarz-/Gold-Dominanz; größere warme Creme-/Beigeflächen, Champagner-Gold als Akzent.
- Bild- und editorialorientierte Präsentation, ohne Referenzseiten 1:1 zu kopieren.
- Vom Kunden gelieferte Kurzbeschreibungen für die drei Angebote verwenden.
- Mobile First und klare Conversion-Wege.

## Produktgrenzen

- keine erfundenen Paketnamen, Preise, Rabatte oder Bewertungen;
- keine erfundenen Extras oder Produktfotos;
- kein Pseudo-Konfigurator;
- keine neue Backend- oder Buchungslogik;
- bestehende Anfrage-, SEO- und WhatsApp-Grundlagen bleiben erhalten.

## Technischer Successor-Vertrag

Der Neuaufbau hält die vorhandene Komponentenarchitektur von `main` stabil:

- `DemoExperience.astro` bleibt unverändert und importiert weiterhin genau `demo.css`;
- Arams Showcase-Struktur und Kundentexte werden gezielt übernommen;
- Basis-, Redesign- und Responsive-/Visual-Regeln werden in **einer** zentralen `demo.css` konsolidiert;
- keine zusätzlichen `redesign-v1.css`- oder `redesign-contract.css`-Schichten;
- `/`, `/demo/` und die T038-Rahmen-Einzelvarianten teilen weiterhin denselben Seitenkern;
- rahmenspezifische Geometrie bleibt vor Startseiten-Höhenregeln geschützt.

## Übernommene Regressionen aus PR #37

- vier Ablaufschritte: 4 Spalten Desktop, 2×2 Tablet, 1 Spalte mobil;
- kein horizontaler Overflow bei 390 px;
- Kundenbereich bleibt rein informativ und verspricht keine tote Aktion;
- Rahmenvariante 10 behält Rahmengeometrie, Asset-Rendering und sichtbaren Landing-Inhalt;
- Produktsektion, Grid und Produktkarte bleiben im Browser-Readback sichtbar und gestaltet.

## Verifikation

Der erste saubere Implementierungs-Head `304b38905d705a9e7cb8d396462705f74687441a` wurde auf GitHub Actions vollständig verifiziert:

- Workflow `Verify`, Run `193`: PASS;
- kanonische Verifikation: PASS;
- Visual-Regression-Artefakte: erfolgreich erzeugt und hochgeladen;
- Vercel-Status auf demselben Head: PASS.

Der Successor-Diff gegen die Ausgangsbasis `6cf1f81c80ee9ee5a58ad7aacc591e99c0a2c8c1` besteht aus einem Implementierungscommit und sieben Dateien; `DemoExperience.astro` sowie zusätzliche Redesign-Stylesheets sind nicht Teil des Diffs.

Jeder nachfolgende Evidence-/Dokumentationscommit muss auf seinem exakten Head erneut den geschützten `verify`-Check bestehen. Die menschliche visuelle Preview-Abnahme wurde am 11.09.2026 für den revisionsgebundenen UI-Stand `4ad40cee7a122b7338dbe85398f0c68c4c8bff79` erteilt.

## Herkunft

Die sichtbaren Copy-, Hero-, Farb- und Informationsarchitekturentscheidungen stammen aus dem kundenerstellten PR #37 und werden als beabsichtigt behandelt. Technische Reparaturen aus #37 werden nur übernommen, wenn sie einen objektiven Defekt oder eine belastbare Regression absichern.

## Reconciliation mit T052-main — 30.08.2026

Der Successor wurde nach Integration von T052 erneut auf den aktuellen `main`-Stand `ff15ccc8a1c8c645fe1dbeb1e152d0e03093f722` gebracht. Der einzige Mergekonflikt betraf `tasks/INDEX.md`: T051 aus dem Redesign-Branch und das auf `main` abgeschlossene T052 wurden gemeinsam erhalten. Es gab keinen Mergekonflikt in Showcase, Produktcopy oder `demo.css`; die Kunden-UI wurde bei dieser Reconciliation nicht neu gestaltet.

Nach der Konfliktauflösung lief der neue kanonische T052-Verify vollständig durch: **23 PASS / 0 FAIL / 0 BLOCKED**, terminaler Receipt `b7ddd026f78aa46856804ba4d5da45d6deba20432708c1b6f473c9ff016deb0a`. Der lokale Merge-Commit ist `2a111c7`.

## Visuelle Freigabe — 11.09.2026

Vor der Freigabe wurde PR #42 auf den aktuellen `main`-Stand reconciliert und als exakter Head `4ad40cee7a122b7338dbe85398f0c68c4c8bff79` erneut verifiziert. GitHub `verify`, Vercel und das lokale kanonische `npm run verify` waren grün; offene Review-Threads: 0. Der revisionsgebundene Build wurde zusätzlich über einen privaten Tailscale-HTTPS-Preview auf dem physischen iPad 10 bereitgestellt. Alexander hat die sichtbare Preview am 11.09.2026 ausdrücklich mit „freigegeben“ abgenommen. Dieser Dokumentationsnachtrag verändert keine Website-, CSS-, Content- oder Asset-Bytes und erfordert vor Merge nur die vorgeschriebene erneute Exact-Head-Verifikation.
