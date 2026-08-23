---
id: T048
status: active
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

## Umsetzung und Evidenz — 23.08.2026

- Contract/Security/Content bleibt in den bestehenden fail-closed Tests. Production-Readiness, Security-Policy, Pages-Deployment, Inquiry/Admin-Privacy, Inhalts- und Asset-Digests wurden nicht gelockert.
- Accessibility-Source-Invarianten wie `prefers-reduced-motion`, `forced-colors` und `:focus-visible` bleiben als gezielte Source-Verträge bestehen.
- Reine Darstellungsdetails wurden aus `scripts/test-sales-demo.mjs` entkoppelt: konkrete Logo-CSS-Reihenfolge, der 860px-Override, konkrete Breakpoint-Quelltexte und bereits im gebauten DOM geprüfte Frame-Inset-Sourcewerte werden nicht mehr doppelt als Regex auf die Implementierungsform geprüft.
- `scripts/test-visual-regression.mjs` prüft stattdessen mit Chrome/Chromium über CDP die gebaute Seite in Desktop 1440×1000, Tablet 834×1112 und Mobil 390×844. Geprüft werden Logo-Geometrie und Asset-Load, Header, Navigation, horizontaler Overflow, Hero-/Eventfoto-Geometrie sowie die Portrait-Rahmenvariante 10 einschließlich Frame-Maske, Query-Normalisierung und Sliderzustand.
- Der Browsertest erzeugt sechs Full-Page-Screenshots (`/demo/` und `/demo/rahmen/10/` je Viewport). Der normale `Verify`-Workflow lädt sie über die voll gepinnte `actions/upload-artifact`-Revision `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` (v7.0.1, Node 24) als inspizierbares CI-Artefakt hoch.
- Kontrollierter Refactor: Die unveränderten Logo-Maße wurden lediglich in anderer CSS-Property-Reihenfolge formuliert. Der frühere Source-Regex wäre dadurch rot, obwohl die Browser-Geometrie unverändert bleibt.
- Kontrollierte Gegenprobe: Der Browsertest blendet ausschließlich im Testkontext das primäre Logo per stärkerer CSS-Regel aus und beweist, dass derselbe Geometrie-/Sichtbarkeitsvertrag diese absichtliche visuelle Regression erkennt.
- Performancebudget blieb unverändert: Demo-CSS `26601` Bytes bei weiter bestehendem 26-KiB-Gate; kein Budget wurde erhöht. Quality-Baseline: HTML `23219`, CSS `26601`, JS `6779`, gzip `16653` Bytes.
- Lokale Verifikation auf Base `d870520de98b0f7f0e4dd992c07c6e7d31abeacc`: frisches `npm ci`, `npm run verify` PASS, `npm audit --audit-level=high` → `0 vulnerabilities`. Browservertrag: `viewports=3 screenshots=6 controlled_regression_detected=true frame_variant=10`.
- Der erste reale PR-Run `32663588219` bewies den Browserteil auch auf GitHub `ubuntu-24.04`: Chrome 151 führte den kompletten visuellen Vertrag erfolgreich aus und Artifact `visual-regression-32663588219` (`9499397335`, `11947253` Bytes) wurde hochgeladen. Der Run wurde erst danach durch eine `ENOTEMPTY`-Race beim Entfernen des temporären Chrome-Profils rot.
- Diese Runner-spezifische Cleanup-Race wird fail-closed behoben: Nach `SIGTERM` wird der echte Chrome-Prozessausstieg abgewartet, nötigenfalls nach `SIGKILL` erneut gebunden gewartet; das Profil wird anschließend mit begrenzten `rm`-Retries entfernt. Die visuelle Prüfsemantik bleibt unverändert.
- Der korrigierte Zwischenhead `d657cc98d6bd0ae3e75e36e1c1b0d3094f32971a` bestand den realen PR-Run `32663993883` vollständig; Artifact `visual-regression-32663993883` (`9499509456`, `11759930` Bytes) wurde erfolgreich veröffentlicht. Der nachgelagerte Portabilitätsreview aktualisiert die Artifact-Action zusätzlich von der bereits Node-20-deprecated v4.6.2 auf die aktuelle v7.0.1-Pin; deren verwendete Inputs bleiben unverändert kompatibel.

T048 bleibt bis zum revisionsgebundenen PR-`verify` und finalen Review `active`. Danach wird dieser Task im selben PR auf `done` gesetzt und erneut auf dem finalen Head geprüft.

## Akzeptanz

- [x] sicherheits- und produktrelevante Contract-Tests bleiben mindestens gleich streng.
- [x] rein strukturelle CSS-/Komponentenrefactorings können bei unverändertem Verhalten grün bleiben.
- [x] Desktop-, Tablet- und Mobile-Visualregressionen werden reproduzierbar erkannt.
- [x] Performancebudgets bleiben explizit und messbar.
- [x] `npm ci` und `npm run verify` PASS.
- [x] ein kleiner kontrollierter Refactor und eine absichtliche visuelle Regression belegen beide Seiten des neuen Testvertrags.

## Nicht-Ziel

- keine pauschale Testreduktion;
- keine Aufweichung von Security-/Privacy-Gates;
- keine kostenpflichtige externe Visual-Testplattform ohne Freigabe.
