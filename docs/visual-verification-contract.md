# Visual Verification Contract

## Zweck

Die Browser-Regressionstests sichern die Funktion und Belastbarkeit der sichtbaren Oberfläche ab, ohne eine zufällige frühere CSS-Ausprägung zum dauerhaften Designstandard zu erklären.

## Hierarchie

### `VIS-INVARIANT-*`

Technische oder semantische Eigenschaften, die auch bei einem Redesign erhalten bleiben müssen. Beispiele:

- kein horizontaler Overflow;
- Logo, Eventfoto und weitere relevante Assets sind geladen und tatsächlich gerendert;
- zentrale Navigation ist vorhanden, sichtbar und geometrisch nutzbar;
- Logo und Navigation bleiben im Header enthalten;
- vier Prozessschritte und ihr Ablaufbereich werden vollständig gerendert;
- rein informative Elemente geben sich nicht als tote Aktion aus;
- Rahmenmaske, Sliderzustand und URL-Synchronisierung funktionieren.

Ein solcher Fehler ist zuerst als Implementierungsregression zu behandeln.

### `VIS-DESIGN-*`

Visuelle Verträge, die bei einer ausdrücklich autorisierten Kundenentscheidung legitim verändert werden können. Beispiele:

- Prozessraster 4 / 2 / 1;
- unterstützte Größenbandbreite des Logos;
- sichtbare Mindestgeometrie von Hero-, Rahmen- und Produktflächen.

Ein solcher Fehler verlangt zuerst den aktuellen Task- und Kundenentscheidungs-Readback. Die Implementation darf nicht reflexartig auf eine ältere Baseline zurückgesetzt werden.

### `VIS-EVIDENCE-*`

Belege dafür, dass der Test wirklich unter der erwarteten Beobachtungsbedingung lief, zum Beispiel korrekter Viewport, erwartete Rahmenvariante, brauchbarer Full-Page-Screenshot oder erfolgreich erkannte kontrollierte Regression.

## Pixelregel

Exakte Pixelwerte sind nur bindend, wenn eine aktuelle Kunden-, Marken- oder Produktentscheidung genau diesen Wert ausdrücklich zum Vertrag macht.

Für das Header-Logo existiert derzeit **kein** solcher 72-/54-Pixel-Markenvertrag. Die CSS-Werte dürfen weiterhin die aktuelle Gestaltung ausdrücken, der Regressionstest prüft jedoch nur:

- sichtbare und geladene Darstellung;
- eine breite, plausible Größenbandbreite statt eines einzelnen Pixels;
- vollständige Einpassung in den Header;
- keine Beeinträchtigung von Navigation oder Seitenbreite.

Damit kann ein künftiges bewusstes Logo-Polish erfolgen, ohne dass ein alter Pixelwert fälschlich als technische Invariante behandelt wird.

Numerische Mindestgrößen für Hero-, Rahmen- oder Produktflächen sind keine exakten Pixel-Baselines. Sie dienen nur dazu, kollabierte oder praktisch unsichtbare Geometrie zu erkennen. Das Verhältnis der akzeptierten Rahmenvariante 10 bleibt design-sensitive, weil es deren bewusstem Portrait-Consumer entspricht.

## Aktuelle kritische Failure-Codes

- `VIS-INVARIANT-HORIZONTAL-OVERFLOW`
- `VIS-INVARIANT-BROKEN-ASSET`
- `VIS-INVARIANT-NAV-HIDDEN`
- `VIS-INVARIANT-HEADER-CONTAINMENT`
- `VIS-INVARIANT-CUSTOMER-AFFORDANCE`
- `VIS-INVARIANT-PROCESS-HIDDEN`
- `VIS-INVARIANT-FRAME-MASK`
- `VIS-INVARIANT-FRAME-SLIDER`
- `VIS-INVARIANT-FRAME-URL-STATE`
- `VIS-DESIGN-PROCESS-LAYOUT`
- `VIS-DESIGN-LOGO-SIZE`
- `VIS-DESIGN-HERO-GEOMETRY`
- `VIS-DESIGN-FRAME-GEOMETRY`
- `VIS-DESIGN-PRODUCT-GEOMETRY`
- `VIS-EVIDENCE-VIEWPORT`
- `VIS-EVIDENCE-FRAME-VARIANT`
- `VIS-EVIDENCE-SCREENSHOT-EMPTY`
- `VIS-EVIDENCE-CONTROLLED-REGRESSION`

Neue kritische Visual-Assertions sollen denselben Namensraum verwenden. Ein freier Fehlertext ohne Klasse ist für neue zentrale Verträge zu vermeiden.

## Kontrollierte Regressionen

`test:visual` erzeugt ausschließlich im isolierten Testbrowser zwei temporäre Negativfälle:

1. Logo selbst wird mit `display:none` aus dem Rendering entfernt → `VIS-INVARIANT-LOGO-HIDDEN`.
2. Der Logo-Vorfahre `.demo-brand` wird mit `display:none` entfernt → ebenfalls `VIS-INVARIANT-LOGO-HIDDEN`.
3. Das Prozessraster wird mit `display:none` entfernt → `VIS-INVARIANT-PROCESS-HIDDEN`.
4. Das Prozessraster wird mit `visibility:hidden` unsichtbar → `VIS-INVARIANT-PROCESS-HIDDEN`.
5. Ein Logo-Vorfahre wird vollständig transparent (`opacity:0`) → `VIS-INVARIANT-LOGO-HIDDEN`.
6. Logo wird auf offensichtlich unbrauchbare, aber weiterhin gerenderte Geometrie verkleinert → `VIS-DESIGN-LOGO-SIZE`.

Damit beweist der Test nicht nur, dass die Seite aktuell grün ist, sondern auch, dass er die beiden unterschiedlichen Fehlerarten tatsächlich erkennt. Nichtdarstellung wird über einen gemeinsamen Paint-State vor jeder Designklassifikation als technische Regression behandelt. Dieser berücksichtigt Rendergeometrie, berechnete `visibility`, effektive Opazität über die Vorfahren und `content-visibility`.

## Abgrenzung

Dieser Vertrag ändert keine Website-Gestaltung, keine CSS-Werte und keine Kundeninhalte. Er beschreibt ausschließlich, wie visuelle Regressionen interpretiert und maschinenlesbar gemeldet werden.