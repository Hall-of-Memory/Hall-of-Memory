---
id: T042
status: done
priority: P2
dependencies: [T040]
---
# Demo CSS Headroom erneut herstellen

## Anlass

Nach T040/T041 und dem öffentlichen Mobile-Spezifitätsfix liegt die final ausgelieferte Demo bei 28.653 Byte CSS gegenüber dem harten 28-KiB-Maximum von 28.672 Byte. Die verbleibenden 19 Byte sind funktional noch innerhalb des Gates, aber als Wartungsreserve erneut ungesund. T028 hatte aus genau diesem Grund bereits mehrere KiB Reserve hergestellt; spätere Gestaltungsrunden haben diese Reserve schrittweise verbraucht.

## Ziel

Vor der nächsten nennenswerten CSS-Erweiterung mindestens 2 KiB belastbare Roh-CSS-Reserve gegenüber 28 KiB wiederherstellen, ohne die bestätigte Hall-of-Memory-Gestaltung, Responsive-Verhalten oder Accessibility zu verschlechtern.

## Leitplanken

- kein Anheben des 28-KiB-Maximums als Ersatz für Optimierung
- zuerst tote/überschriebene Regeln, doppelte Media-Query-Logik, redundante Selektoren und wiederverwendbare Primitiven untersuchen
- visuelle Wirkung und öffentliche 390×844-/Tablet-/Desktop-Readbacks beibehalten
- keine neue Styling-Abstraktion einführen, wenn sie die Wartung nur verlagert
- T040/T041-Kernregressionen, Rahmenvergleich und Base-Path-Gate müssen grün bleiben

## Akzeptanz

- Demo-CSS höchstens 26 KiB Rohgröße oder mindestens 2 KiB nachgewiesene Reserve gegenüber 28 KiB
- `npm run test:demo`, `npm run test:preview-base`, `npm run check` und `npm run build` PASS
- 390×844, Tablet und Desktop ohne horizontalen Overflow und ohne versteckte Hauptnavigation
- keine sichtbare Designregression in Hero, Angeboten, Paketen, Galerie, Kundenbereich, Anfrage und Kontakt

## Abschluss-Evidenz — 2026-08-22

- `npm run test:demo` liefert 26.601 Byte Demo-CSS und damit 2.071 Byte Reserve gegenüber 28 KiB; `test:preview-base`, `check` und der vollständige `npm run verify` sind grün.
- Browser-Readback bei 390×844, 768×1024 und 1440×1000 zeigt keinen horizontalen Overflow, alle Hauptnavigationslinks bleiben sichtbar und die Viewport-Screenshots sind pixelidentisch zum Stand vor der semantisch äquivalenten Konsolidierung.
- Reduced Motion bleibt über die globale Transition-Unterdrückung erhalten; die Demo enthält keine CSS-Animationen.
