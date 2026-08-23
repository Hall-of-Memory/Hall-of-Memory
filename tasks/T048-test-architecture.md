---
id: T048
status: planned
priority: P1
dependencies: [T047]
---
# Testarchitektur: Contracts, Visual Regression und Performance entkoppeln

## Ziel

Die bestehende starke Testsuite bleibt fail-closed, wird aber weniger an konkrete CSS-Implementierungsdetails gekoppelt. Sicherheits-, Produkt- und Routingverträge sollen weiterhin hart geprüft werden; legitime Refactorings sollen nicht allein wegen unveränderter visueller Details in anderen Source-Formulierungen scheitern.

## Umsetzung

1. Bestehende Tests nach Zweck klassifizieren:
   - Contract/Security/Content;
   - Accessibility-Struktur;
   - Visual Regression;
   - Performance-/Transferbudgets;
   - echte Source-/Architektur-Invarianten.
2. Pixel-, Regex- und konkrete CSS-Source-Assertions nur dort behalten, wo die konkrete Implementierung selbst Teil des Vertrags ist.
3. Visuelle Anforderungen wie responsive Logo-Präsenz, Layoutstabilität, Frame-Darstellung und Overflow bevorzugt über Browser-/Screenshot-Readback absichern.
4. Bestehende HTML-, CSS-, JS- und gzip-Budgets als explizite Performance-Gates erhalten und nach dem T046-Refactor einmal neu baselinen, ohne Budgetaufweichung allein zur Testberuhigung.
5. Keine zweite divergierende Testpipeline neben `npm run verify` einführen; neue Checks in den kanonischen Verify-Pfad integrieren.

## Akzeptanz

- [ ] sicherheits- und produktrelevante Contract-Tests bleiben mindestens gleich streng.
- [ ] rein strukturelle CSS-/Komponentenrefactorings können bei unverändertem Verhalten grün bleiben.
- [ ] Desktop-, Tablet- und Mobile-Visualregressionen werden reproduzierbar erkannt.
- [ ] Performancebudgets bleiben explizit und messbar.
- [ ] `npm ci` und `npm run verify` PASS.
- [ ] ein kleiner kontrollierter Refactor und eine absichtliche visuelle Regression belegen beide Seiten des neuen Testvertrags.

## Nicht-Ziel

- keine pauschale Testreduktion;
- keine Aufweichung von Security-/Privacy-Gates;
- keine kostenpflichtige externe Visual-Testplattform ohne Freigabe.
