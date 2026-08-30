# T051 – Startseite Redesign V1

Status: active — sauberer Successor von PR #37; technische Verifikation ausstehend

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

Vor Merge erforderlich:

- GitHub `verify` auf exakt dem finalen Successor-Head grün;
- Visual Regression Desktop, Tablet und 390-px-Mobile grün;
- Preview-Base und Pages-Artefakt grün;
- Rahmenvariante 10 grün;
- keine zusätzlichen Redesign-Stylesheet-Imports;
- menschliche visuelle Preview-Abnahme.

## Herkunft

Die sichtbaren Copy-, Hero-, Farb- und Informationsarchitekturentscheidungen stammen aus dem kundenerstellten PR #37 und werden als beabsichtigt behandelt. Technische Reparaturen aus #37 werden nur übernommen, wenn sie einen objektiven Defekt oder eine belastbare Regression absichern.
